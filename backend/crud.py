from sqlalchemy.orm import Session
import models,schemas

""" Course Crud Operations """

def create_course(db:Session, course: schemas.CourseCreate):
    db_course = models.Course(
        course_name = course.course_name,
        duration = course.duration,
        skill_level = course.skill_level,
        course_fees = course.course_fees,
        program_id = course.program_id,
        institute_id = course.institute_id
    )

    db.add(db_course)
    db.commit()

    db.refresh(db_course)
    return db_course

def delete_course(db:Session, course: schemas.Course)