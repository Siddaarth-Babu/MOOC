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
from fastapi.middleware.cors import CORSMiddleware
from backend.database import Base, engine

app = FastAPI()

# Create all database tables on startup
Base.metadata.create_all(bind=engine)

origins = [
    "http://localhost:5173"
]
# 2. Add the middleware
print("CORS Middleware Configured with Origins:")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows GET, POST, DELETE, etc.
    allow_headers=["*"],
)
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
pwd_context = CryptContext(schemes=["bcrypt_sha256"], deprecated="auto")

def get_password_hash(password: str):
    return pwd_context.hash(password)


@app.get("/")
def root():
    print("🚀 Server running on http://127.0.0.1:8000/")
    print("DB URL:", os.getenv("SQLALCHEMY_DATABASE_URI"))
    return {"message": "MOOC Backend is running"}


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
    if len(user_data.password.encode("utf-8")) > 72:
        raise HTTPException(status_code=400, detail="Password too long")
    hashed_password = pwd_context.hash(user_data.password)
    
    # new_user = models.User(
    #     full_name=user_data.full_name,
    #     email=user_data.email,
    #     hashed_password=hashed_password,
    #     role=user_data.role
    # )

    # db.add(new_user)
    # # db.commit()
    # # db.refresh(new_user)
    # db.flush()


    # #return {"message": f"Successfully signed up as {new_user.role}"}
    # if user_data.role == "student":
    #     new_student = models.Student(
    #         name=user_data.full_name,
    #         email_id=user_data.email,
    #         dob=user_data.dob,
    #         specialization=user_data.specialization,
    #         country=user_data.country,
    #         skill_level="Beginner"
    #     )
    #     db.add(new_student)

    # db.commit()

    # return {"message": "Signup successful"}
    try:
        # 4. Create auth user
        new_user = models.User(
            full_name=user_data.full_name,
            email=user_data.email,
            hashed_password=hashed_password,
            role=user_data.role
        )
        print("ROLE RECEIVED:", user_data.role)
        db.add(new_user)
        db.flush()   # user.id available, not committed

        # 5. Create role-specific row
        if user_data.role == "student":
            print("INSIDE STUDENT BLOCK") 
            new_student = models.Student(
                name=user_data.full_name,
                email_id=user_data.email,
                skill_level="Beginner",
            )
            db.add(new_student)
        elif user_data.role == "instructor":
            print("INSIDE INSTRUCTOR BLOCK") 
            new_instructor = models.Instructor(
                name=user_data.full_name,
                email_id=user_data.email
            )
            db.add(new_instructor)
        elif user_data.role == "analyst":
            print("INSIDE ANALYST BLOCK") 
            new_analyst = models.DataAnalyst(
                name=user_data.full_name,
                email_id=user_data.email
            )
            db.add(new_analyst)
        elif user_data.role == "admin":
            print("INSIDE ADMIN BLOCK") 
            new_admin = models.SystemAdmin(
                name=user_data.full_name,
                email_id=user_data.email
            )
            db.add(new_admin)
        else:
            raise HTTPException(status_code=400, detail="Invalid role specified")
        # 6. ONE commit
        db.commit()
        return {"message": "Signup successful"}

    except Exception as e:
        db.rollback()
        print("SIGNUP ERROR:", e)   # 👈 ADD THIS
        raise HTTPException(
            status_code=500,
            detail="Signup failed"
        )

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

@app.get("/student/profile", response_model=schemas.Student)
def view_profile(
    db: Session = Depends(get_db),
    student: models.Student = Depends(get_curr_student)
):
    """
    Returns the profile of the logged-in student based on their JWT.
    """
    return student

@app.patch("/student/profile/update", response_model=schemas.Student)
def update_profile(
    profile_data: schemas.StudentUpdate, 
    db: Session = Depends(get_db),
    student: models.Student = Depends(get_curr_student)
):
    """
    Updates only the fields provided in the request body.
    """
    # Convert input to dict, skipping anything React didn't send
    update_dict = profile_data.model_dump(exclude_unset=True)

    if not update_dict:
        raise HTTPException(status_code=400, detail="No data provided for update")

    for key, value in update_dict.items():
        setattr(student, key, value)

    try:
        db.commit()
        db.refresh(student)
        return student
    except Exception as e:
        db.rollback()
        # This usually happens if they try to change to an email already in use
        raise HTTPException(status_code=400, detail="Update failed. Check if email is unique.")


""" Routing for Instructor """
@app.get("/instructor")
def get_home(
    instructor: models.Instructor = Depends(get_curr_instructor),
    db: Session = Depends(get_db)
):
    # 1. Fetch all course IDs this instructor is associated with
    my_course_ids = db.query(models.course_instructor_link.c.course_id).filter(
        models.course_instructor_link.c.instructor_id == instructor.instructor_id
    ).all()
    
    # Flatten the list of tuples into a simple list of IDs
    course_ids = [c[0] for c in my_course_ids]

    # 2. Query numbers for each course
    total_earnings = 0

    for c_id in course_ids:
        # Get course details (fees)
        course = db.query(models.Course).filter(models.Course.course_id == c_id).first()
        
        # Count enrollments for this specific course
        enrollment_count = db.query(models.course_student_link).filter(
            models.course_student_link.c.course_id == c_id
        ).count()

        earnings = enrollment_count * (course.course_fees or 0)
        total_earnings += earnings

    total_courses = len(course_ids)
    avg_earnings = (total_earnings / total_courses) if total_courses > 0 else None
    
    return {
        "instructor_name": instructor.name,
        "total_courses": total_courses,
        "total_earnings": total_earnings,
        "per_course_breakdown": avg_earnings
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

@app.get("/admin/courses")
def admin_courses(
    admin: models.SystemAdmin = Depends(get_curr_admin), # Returns Student model
    db: Session = Depends(get_db)
    ):
    all_courses = crud.get_all_courses(db,skip=0,limit=20)
    
    return {
        "catalog": all_courses,
    }

@app.get("/admin")
def admin_home(
    admin: models.SystemAdmin = Depends(get_curr_admin), # Returns systemadmin model
    db: Session = Depends(get_db)
    ):
    no_of_students = db.query(models.Student).count()
    no_of_instructors = db.query(models.Instructor).count()
    no_of_courses = db.query(models.Course).count()
    no_of_dataanalysts = db.query(models.DataAnalyst).count()
    no_of_universities = db.query(models.University).count()
    no_of_admins = db.query(models.SystemAdmin).count()
    return {
        "admin_name": admin.name,
        "no_of_students": no_of_students,
        "no_of_instructors": no_of_instructors,
        "no_of_courses": no_of_courses,
        "no_of_dataanalysts": no_of_dataanalysts,
        "no_of_universities": no_of_universities,
        "no_of_admins": no_of_admins
    }

@app.get("/admin/courses/{course_id}")
def admin_course_view(
    course_id: int,
    db: Session = Depends(get_db),
    admin: models.SystemAdmin = Depends(get_curr_admin)
):
    course = db.query(models.Course).filter(models.Course.course_id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    instructors = crud.get_course_instructors(db, course.course_id)

    return {
        "course_details": course,
        "instructors": [i.name for i in instructors] # Show them who is teaching
    }

@app.get("/admin/instructors")
def admin_instructors(
    admin: models.SystemAdmin = Depends(get_curr_admin), # Returns systemadmin model
    db: Session = Depends(get_db)
    ):
    all_instructors = db.query(models.Instructor).all()
    
    return {
        "instructors": all_instructors,
    }
@app.get("/admin/instructors/{instructor_id}")
def admin_instructor_view(
    instructor_id: int,
    db: Session = Depends(get_db),
    admin: models.SystemAdmin = Depends(get_curr_admin)
):
    instructor = db.query(models.Instructor).filter(models.Instructor.instructor_id == instructor_id).first()

    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor not found")
    
    courses=db.query(models.Course).join(
        models.course_instructor_link,
        models.Course.course_id == models.course_instructor_link.c.course_id
    ).filter(
        models.course_instructor_link.instructor_id == instructor_id
    ).all()

    return {
        "instructor": instructor,
        "courses": [c.course_name for c in courses] # Show them which courses they teach
    }

@app.get("/admin/students")
def admin_students(
    admin: models.SystemAdmin = Depends(get_curr_admin), # Returns systemadmin model
    db: Session = Depends(get_db)
    ):
    all_students = db.query(models.Student).all()
    
    return {
        "students": all_students,
    }
@app.get("/admin/students/{student_id}")
def admin_student_view(  
    student_id: int,
    db: Session = Depends(get_db),
    admin: models.SystemAdmin = Depends(get_curr_admin)
):
    student = db.query(models.Student).filter(models.Student.student_id == student_id).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    courses=crud.get_student_courses(db,student_id)

    return {
        "student": student,
        "courses": [c.course_name for c in courses] # Show them which courses they are enrolled in
    }

@app.get("/admin/data_analysts")
def admin_data_analysts(
    admin: models.SystemAdmin = Depends(get_curr_admin), # Returns systemadmin model
    db: Session = Depends(get_db)
    ):
    all_data_analysts = db.query(models.DataAnalyst).all()
    
    return {
        "data_analysts": all_data_analysts,
    }

@app.get("/admin/data_analysts/{analyst_id}")
def admin_data_analyst_view( 
    analyst_id: int,
    db: Session = Depends(get_db),
    admin: models.SystemAdmin = Depends(get_curr_admin)
):
    analyst = db.query(models.DataAnalyst).filter(models.DataAnalyst.analyst_id == analyst_id).first()

    return {
        "data_analyst": analyst
    }

@app.get("/admin/universities")
def admin_universities(
    admin: models.SystemAdmin = Depends(get_curr_admin), # Returns systemadmin model
    db: Session = Depends(get_db)
    ):
    all_universities = db.query(models.University).all()
    
    return {
        "universities": all_universities,
    }
@app.get("/admin/universities/{institute_id}")
def admin_university_view(
    institute_id: int,
    db: Session = Depends(get_db),
    admin: models.SystemAdmin = Depends(get_curr_admin)
):
    university = db.query(models.University).filter(models.University.institute_id == institute_id).first()

    if not university:
        raise HTTPException(status_code=404, detail="University not found")
    
    courses=db.query(models.Course).filter(models.Course.institute_id == institute_id).all()

    return {
        "university": university,
        "courses": [c.course_name for c in courses] # Show them which courses are offered by this university
    }

###############################################################################################################
# @app.post("admin/course/new_course/{instructor_email}")
# def admin_create_course(
#     instructor_email: str,
#     course_data: schemas.CourseCreate,
#     db: Session = Depends(get_db),
#     admin: models.SystemAdmin = Depends(get_curr_admin)
# ):
#     # 1. Check if university exists
#     university = db.query(models.University).filter(models.University.institute_id == course_data.institute_id).first()
#     if not university:
#         raise HTTPException(status_code=404, detail="University not found")

# # 2. Create the course
#     newcourse = crud.create_course(db, course_data)
#     return {
#         "message": f"Course '{newcourse.course_name}' created successfully under {university.institute_name}"
    #}

@app.post("/admin/course/new_course")
def admin_create_course(
    data: schemas.CourseCreateWithInstructors,
    db: Session = Depends(get_db),
    admin = Depends(get_curr_admin)
):
    try:
        # 1. University
        university = db.query(models.University).filter(
            models.University.name == data.institute_name
        ).first()
        if not university:
            raise HTTPException(status_code=404, detail="University not found")

        # 2. Program (by NAME, not ID)
        program = db.query(models.Program).filter(
            models.Program.program_name == data.program_name
        ).first()
        if not program:
            raise HTTPException(status_code=404, detail="Program not found")

        # 3. Create course
        new_course = models.Course(
            course_name=data.course_name,
            duration=data.duration,
            course_fees=data.course_fees,
            skill_level=data.skill_level,
            institute_id=university.institute_id,
            program_id=program.program_id
        )
        db.add(new_course)
        db.flush()

        # 4. Link instructors manually
        for email in data.instructor_emails:
            instructor = db.query(models.Instructor).filter(
                models.Instructor.email_id == email
            ).first()

            if not instructor:
                raise HTTPException(
                    status_code=404,
                    detail=f"Instructor with email {email} not found"
                )

            db.execute(
                models.course_instructor_link.insert().values(
                    course_id=new_course.course_id,
                    instructor_id=instructor.instructor_id
                )
            )

        db.commit()

        return {
            "message": "Course created successfully",
            "course_id": new_course.course_id
        }

    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Course creation failed")

@app.post("/admin/new_program")
def admin_create_program(
    program_data: schemas.ProgramCreate,
    db: Session = Depends(get_db),
    admin: models.SystemAdmin = Depends(get_curr_admin)
):
    # 1. Check if program name already exists
    existing_program = db.query(models.Program).filter(models.Program.program_name == program_data.program_name).first()
    if existing_program:
        raise HTTPException(status_code=400, detail="Program with this name already exists")

    # 2. Create the program
    new_program = crud.create_program(db, program_data)
    return {
        "message": f"Program '{new_program.program_name}' created successfully"
    }

#################################################################################################################

@app.post("/admin/instructor/new_instructor")
def admin_create_instructor(
    instructor_data: schemas.InstructorCreate,
    db: Session = Depends(get_db),
    admin: models.SystemAdmin = Depends(get_curr_admin)
):
    # 1. Check if email already exists
    existing_instructor = db.query(models.Instructor).filter(models.Instructor.email_id == instructor_data.email_id).first()
    if existing_instructor:
        raise HTTPException(status_code=400, detail="Email already registered for another instructor")

    # 2. Create the instructor
    new_instructor = crud.create_instructor(db, instructor_data)
    return {
        "message": f"Instructor '{new_instructor.name}' created successfully"
    }

@app.post("admin/university/new_university")
def admin_create_university(
    university_data: schemas.UniversityCreate,
    db: Session = Depends(get_db),
    admin: models.SystemAdmin = Depends(get_curr_admin)
):
    # 1. Check if university name already exists
    existing_university = db.query(models.University).filter(models.University.name == university_data.name).first()
    if existing_university:
        raise HTTPException(status_code=400, detail="University with this name already exists")

    # 2. Create the university
    new_university = crud.create_university(db, university_data)
    return {
        "message": f"University '{new_university.name}' created successfully in {new_university.city}, {new_university.country}"
    }

@app.post("/admin/student/new_student")
def admin_create_student(
    student_data: schemas.StudentCreate,
    db: Session = Depends(get_db),
    admin: models.SystemAdmin = Depends(get_curr_admin)
):
    # 1. Check if email already exists
    existing_student = db.query(models.Student).filter(models.Student.email_id == student_data.email_id).first()
    if existing_student:
        raise HTTPException(status_code=400, detail="Email already registered for another student")

    # 2. Create the student
    new_student = crud.create_student(db, student_data)
    return {
        "message": f"Student '{new_student.name}' created successfully"
    }

@app.post("/admin/data_analyst/new_data_analyst")
def admin_create_data_analyst(
    analyst_data: schemas.DataAnalystCreate,
    db: Session = Depends(get_db),
    admin: models.SystemAdmin = Depends(get_curr_admin)
):
    # 1. Check if email already exists
    existing_analyst = db.query(models.DataAnalyst).filter(models.DataAnalyst.email_id == analyst_data.email_id).first()
    if existing_analyst:
        raise HTTPException(status_code=400, detail="Email already registered for another data analyst")

    # 2. Create the data analyst
    new_analyst = crud.create_data_analyst(db, analyst_data)
    return {
        "message": f"Data Analyst '{new_analyst.name}' created successfully"
    }

@app.post("/admin/course/{course_id}/assign_instructor/{instructor_email}")
def admin_assign_instructor_to_course(
    course_id: int,
    instructor_email: str,
    db: Session = Depends(get_db),
    admin: models.SystemAdmin = Depends(get_curr_admin)
):
    # 1. Check if course exists
    course = db.query(models.Course).filter(models.Course.course_id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # 2. Check if instructor exists
    instructor = db.query(models.Instructor).filter(models.Instructor.email_id == instructor_email).first()
    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor not found")

    # 3. Assign the instructor to the course
    crud.assign_instructor_to_course(db, course_id, instructor.instructor_id)
    return {
        "message": f"Instructor '{instructor.name}' assigned to course '{course.course_name}' successfully"
    }