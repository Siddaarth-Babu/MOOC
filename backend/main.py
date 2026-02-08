import os
from fastapi import FastAPI,HTTPException,Depends, status
from passlib.context import CryptContext
from backend import schemas,models,crud
# import schemas,models
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database import get_db
from datetime import datetime, timedelta,timezone,date
from jose import jwt, JWTError
from dotenv import load_dotenv
from backend.security import get_curr_student, get_curr_instructor,get_curr_analyst,get_curr_admin

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

app = FastAPI()


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
        "my_list": crud.get_student_courses(db,student.student_id)  # Using column from Student table
    }

@app.get("/student/home")
def student_home(
    student: models.Student = Depends(get_curr_student), # Returns Student model
    db: Session = Depends(get_db)
    ):
    
    return {
        "student_name": student.name,
        "my_list": crud.get_student_courses(db,student.student_id) 
    }


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
            "instructor": crud.get_course_instructors(db,course.course_id),
            "fees": course.course_fees,
            "skill-level": course.skill_level,
            "topics": crud.get_course_topics(db,course.course_id),
            "institute": db.query(models.University).filter(models.University.institute_id == course.institute_id).first()
        }

    # If enrolled, return EVERYTHING
    return {
        "enrolled": True,
        "details": course, # Includes assignments, assessments, etc.
    }

@app.post("/student/courses/{course_id}/submit_asg")
def hand_assignment(
    course_id: int,
    subm: schemas.SubmissionCreate,
    db: Session = Depends(get_db),
    student: models.Student = Depends(get_curr_student)
):
    return crud.create_submission(db,subm,student.student_id)


""" Routing for Instructor """

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
    
    instructors = crud.get_course_instructors(db, course.course_id)
    allowed_ids = [i.instructor_id for i in instructors]

    if instr.instructor_id not in allowed_ids:
        raise HTTPException(
            status_code=403, 
            detail="You are not an authorized instructor for this course"
        )
    
    other_instructors = [
        i.name
        for i in instructors 
        if i.instructor_id != instr.instructor_id
    ]

    return {
        "course_details": course,
        "co_instructors": other_instructors # Show them who else is teaching
    }


@app.get("/instructor/courses/{course_id}/stud_list")
def grade_students(
    course_id: int,
    db: Session = Depends(get_db),
    instr: models.Instructor = Depends(get_curr_instructor)
):
    # 1. Verify the course exists (you already have this)
    course = db.query(models.Course).filter(models.Course.course_id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # 2. Join Student and Evaluation
    # We query both models at the same time
    results = db.query(models.Student, models.Evaluation).join(
        models.Evaluation
    ).filter(
        models.Evaluation.course_id == course_id
    ).all()

    # 3. Format for React
    # This creates a list of dictionaries containing both Student and Grade info
    graded_list = []
    for student, evaluation in results:
        graded_list.append({
            "student_id": student.student_id,
            "name": student.name,
            "email": student.email_id,
            "marks": evaluation.marks,
            "grade": evaluation.grade,
            "status": evaluation.pass_fail,
            "evaluation_date": evaluation.date_of_evaluation
        })

    return graded_list


@app.get("/instructor/courses/{course_id}/stud_list/{student_id}")
def get_student_course_detail(
    course_id: int,
    student_id: int,
    db: Session = Depends(get_db),
    instr: models.Instructor = Depends(get_curr_instructor)
):
    # 1. Fetch Student Basic Info
    student = db.query(models.Student).filter(models.Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # 2. Fetch Course Evaluation (The "Final" Grade/Marks)
    evaluation = db.query(models.Evaluation).filter(
        models.Evaluation.course_id == course_id,
        models.Evaluation.student_id == student_id
    ).first()

    # 3. Fetch All Submissions + Assignment Details (The "Direct" Join)
    # We join Submission with Assignment to get the Title and Total Marks
    submissions = db.query(
        models.StudentSubmission, 
        models.Assignment
    ).join(
        models.Assignment, 
        models.StudentSubmission.assignment_id == models.Assignment.assignment_id
    ).filter(
        models.StudentSubmission.student_id == student_id,
        models.Assignment.course_id == course_id
    ).all()

    # 4. Format for React
    return {
        "student_name": student.name,
        "course_overall_performance": {
            "total_marks": evaluation.marks if evaluation else "Not Evaluated",
            "grade": evaluation.grade if evaluation else "N/A",
            "status": evaluation.pass_fail if evaluation else "Pending"
        },
        "assignments_report": [
            {
                "assignment_title": assign.title,
                "submission_url": sub.submission_url,
                "marks_obtained": sub.obtained_marks,
                "out_of": assign.marks,
                "submitted_at": sub.submitted_at
            } for sub, assign in submissions
        ]
    }

@app.post("/instructor/courses/{course_id}/stud_list/{student_id}/edit_grade")
def edit_grade(
    course_id: int,
    student_id: int,
    grade_data: schemas.GradeUpdate, # This is your request body
    db: Session = Depends(get_db),
    instr: models.Instructor = Depends(get_curr_instructor)
):
    # 1. Look for existing evaluation
    db_eval = db.query(models.Evaluation).filter(
        models.Evaluation.course_id == course_id,
        models.Evaluation.student_id == student_id
    ).first()

    # 2. If it doesn't exist, create it; if it does, update it
    if not db_eval:
        db_eval = models.Evaluation(
            course_id=course_id,
            student_id=student_id,
            marks=grade_data.marks,
            grade=grade_data.grade,
            pass_fail=grade_data.pass_fail,
            date_of_evaluation=date.today()
        )
        db.add(db_eval)
    else:
        db_eval.marks = grade_data.marks
        db_eval.grade = grade_data.grade
        db_eval.pass_fail = grade_data.pass_fail
        db_eval.date_of_evaluation = date.today()

    db.commit()
    db.refresh(db_eval)
    
    return {"message": "Grade updated successfully", "updated_grade": db_eval}

@app.post("/instructor/courses/{course_id}/add_assign")
def post_assignment(
    course_id: int,
    assign: schemas.AssignmentCreate,
    db: Session = Depends(get_db)
):
    return crud.create_assignment(db,assign, course_id)

@app.post("/instructor/courses/{course_id}/remove_assign")
def remove_assignment(
    course_id: int,
    assign_id: int,
    db: Session = Depends(get_db)
):
    return crud.delete_assignment(db,assign_id)


@app.post("/instructor/courses/{course_id}/remove_video")
def remove_video(
    course_id: int,
    video_id: int,
    db: Session = Depends(get_db)
):
    return crud.remove_videos(db,video_id)

@app.post("/instructor/courses/{course_id}/remove_notes")
def remove_notes(
    course_id: int,
    notes_id: int,
    db: Session = Depends(get_db)
):
    return crud.remove_notes(db,notes_id)

@app.post("/instructor/courses/{course_id}/remove_textb")
def post_textbook(
    course_id: int,
    text_id: int,
    db: Session = Depends(get_db)
):
    return crud.add_textbook(db,text_id)


""" Data Analyst Routing """

@app.get("/analyst/home/")
def get_advanced_stats(
    db: Session = Depends(get_db),
    analyst: models.DataAnalyst = Depends(get_curr_analyst)
):
    # 1. TOTAL REVENUE (Sum of fees of all courses for every enrollment)
    # Logic: Join Course and the Link table, then sum the course_fees
    total_revenue = db.query(
        func.sum(models.Course.course_fees)
    ).join(
        models.course_student_link
    ).scalar() or 0  # .scalar() returns the single number result

    # 2. REVENUE PER COURSE (For the Pie Chart)
    revenue_per_course = db.query(
        models.Course.course_name,
        func.sum(models.Course.course_fees).label("total_revenue")
    ).join(
        models.course_student_link
    ).group_by(
        models.Course.course_id
    ).all()

    # 3. GRADE DISTRIBUTION (How many students got A, B, etc.)
    grade_dist = db.query(
        models.Evaluation.grade,
        func.count(models.Evaluation.evaluation_id)
    ).group_by(
        models.Evaluation.grade
    ).all()

    # 4. ENROLLMENTS BY COUNTRY
    country_dist = db.query(
        models.Student.country,
        func.count(models.Student.student_id)
    ).group_by(
        models.Student.country
    ).all()

    # Format for React
    return {
        "summary": {
            "total_revenue": total_revenue,
            "total_enrollments": db.query(models.course_student_link).count(),
        },
        "charts": {
            "revenue_data": [{"name": row[0], "value": row[1]} for row in revenue_per_course],
            "grade_data": [{"grade": row[0], "count": row[1]} for row in grade_dist],
            "country_data": [{"country": row[0], "count": row[1]} for row in country_dist]
        }
    }

