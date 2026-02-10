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

app = FASTAPI()
###############################################################################################
@app.get("/admin/courses")
def admin_courses(
    admin: models.SystemAdmin = Depends(get_curr_admin), # Returns Student model
    db: Session = Depends(get_db)
    ):
    all_courses = crud.get_all_courses(db,skip=0,limit=20)
    
    return {
        "catalog": all_courses,
    }

@app.get("/admin/home")
def admin_home(
    admin: models.SystemAdmin = Depends(get_curr_admin), # Returns systemadmin model
    db: Session = Depends(get_db)
    ):
    no_of_students = db.query(models.Student).count()
    no_of_instructors = db.query(models.Instructor).count()
    no_of_courses = db.query(models.Course).count()
    no_of_dataanalysts = db.query(models.DataAnalyst).count()
    no_of_universities = db.query(models.University).count()
    return {
        "admin_name": admin.name,
        "no_of_students": no_of_students,
        "no_of_instructors": no_of_instructors,
        "no_of_courses": no_of_courses,
        "no_of_dataanalysts": no_of_dataanalysts,
        "no_of_universities": no_of_universities
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
#     }
#################################################################################################################
@app.post("admin/instructor/new_instructor")
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

@app.post("admin/student/new_student")
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

@app.post("admin/data_analyst/new_data_analyst")
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

@app.post("admin/course/{course_id}/assign_instructor/{instructor_email}")
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


