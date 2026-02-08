import os
from fastapi import FASTAPI,HTTPException,Depends, status
from passlib.context import CryptContext
import schemas,models
from sqlalchemy.orm import Session
from backend.database import get_db
from datetime import datetime, timedelta,timezone
from jose import jwt, JWTError
from dotenv import load_dotenv
import crud
from security import get_curr_student, get_curr_instructor

# Load the variables from .env into the system
load_dotenv()

# Fetch them using os.getenv(VARIABLE_NAME, DEFAULT_VALUE)
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# Fetch Role Keys
ROLE_KEYS = {
    "instructor": os.getenv("INSTRUCTOR_KEY"),
    "analyst": os.getenv("ANALYST_KEY"),
    "admin": os.getenv("ADMIN_KEY")
}

# Define the hashing algorithm
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str):
    return pwd_context.hash(password)

app = FASTAPI()


@app.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    # 1. Check if user already exists
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2. Key Check: If they choose a role from our ROLE_KEYS list
    if user_data.role in ROLE_KEYS:
        # Check if they provided the correct key from our .env
        if user_data.enrollment_key != ROLE_KEYS[user_data.role]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail=f"Incorrect enrollment key for the {user_data.role} role."
            )
ho
    # 3. Hash the password and save the user
    hashed_password = pwd_context.hash(user_data.password)
    
    new_user = models.User(
        full_name=user_data.full_name,
        email=user_data.email,
        hashed_password=hashed_password,
        role=user_data.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": f"Successfully signed up as {new_user.role}"}


@app.post("/login")
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    # 1. Fetch user by email
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()

    # 2. Check credentials
    if not user or not pwd_context.verify(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # 3. Create the JWT Token Payload
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # We include 'sub' (the subject, usually email) and 'role' 
    token_data = {
        "sub": user.email, 
        "role": user.role,
        "user_id": user.id
    }
    
    # Calculate expiration
    expire = datetime.now(timezone.utc) + access_token_expires
    token_data.update({"exp": expire})

    # 4. Sign the token
    encoded_jwt = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    # 5. Send to React
    return {
        "access_token": encoded_jwt,
        "token_type": "bearer",
        "role": user.role
    }

""" Routing for Student """

@app.get("/student/all-courses")
def student_all_courses(
    student: models.Student = Depends(get_curr_student), # Returns Student model
    db: Session = Depends(get_db)
    ):
    all_courses = crud.get_all_courses(db,skip=0,limit=20)
    
    return {
        "student_name": student.name,
        "catalog": all_courses,
        "my_list": student.courses # Using column from Student table
    }

@app.get("/student/home")
def student_home(
    student: models.Student = Depends(get_curr_student), # Returns Student model
    db: Session = Depends(get_db)
    ):
    
    return {
        "student_name": student.name,
        "my_list": student.courses 
    }


""" Routing for Courses """

@app.get("/student/courses/{course_id}")
def get_student_course_view(
    course_id: int, 
    db: Session = Depends(get_db),
    student: models.Student = Depends(get_curr_student)
):
    course = crud.get_course_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    enrolled_ids = [c.course_id for c in student.courses]
    is_enrolled = course_id in enrolled_ids

    if not is_enrolled:
        # Return only public info
        return {
            "enrolled": False,
            "title": course.course_name,
            "duration": course.duration,
            "instructor": course.instructors,
            "fees": course.course_fees,
            "skill-level": course.skill_level,
            "topics": course.topics,
            "institute": db.query(models.University).filter(models.University.institute_id == course.institute_id).first()
        }

    # If enrolled, return EVERYTHING
    return {
        "enrolled": True,
        "details": course, # Includes assignments, assessments, etc.
    }

@app.get("/instructor/courses/{course_id}")
def get_inst_course_view(
    course_id: int,
    db: Session = Depends(get_db),
    instr: models.Instructor = Depends(get_curr_instructor)
):
    # We query the course
    course = db.query(models.Course).filter(models.Course.course_id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    allowed_ids = [i.instructor_id for i in course.instructors]

    if instr.instructor_id not in allowed_ids:
        raise HTTPException(
            status_code=403, 
            detail="You are not an authorized instructor for this course"
        )
    
    other_instructors = [
        i.name
        for i in course.instructors 
        if i.instructor_id != instr.instructor_id
    ]

    return {
        "course_details": course,
        "co_instructors": other_instructors # Show them who else is teaching
    }

