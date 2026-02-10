from sqlalchemy.orm import Session
from backend import models,schemas
from datetime import datetime
from typing import Optional

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

def delete_course(db:Session, course_id: int):
    db_course = db.query(models.Course).filter(models.Course.course_id == course_id).first()

    if db_course:
        db.delete(db_course)
        db.commit()
        return True
    
    return False

def update_course_fees(db:Session,course_id: int, new_fees:int):
    db_course = db.query(models.Course).filter(models.Course.course_id == course_id).first()

    if db_course:
        db_course.course_fees = new_fees
        db.commit()
        db.refresh(db_course)

    return db_course

def get_all_courses(db : Session,skip: int = 0, limit: int = 20):
    return db.query(models.Course).offset(skip).limit(limit).all()

def get_course_by_id(db: Session, course_id: int):
    return db.query(models.Course).filter(models.Course.course_id == course_id).first()

def get_student_courses(db: Session, student_id: int):
    return db.query(models.Course).join(
        models.course_student_link, 
        models.Course.course_id == models.course_student_link.c.course_id
    ).filter(
        models.course_student_link.c.student_id == student_id
    ).all()

# def get_course_instructors(db:Session, course_id:int):
#     return db.query(models.Instructor).join(
#         models.course_instructor_link,
#         models.Instructor.instructor_id == models.course_instructor_link.c.instructor_id
#     ).filter(
#         models.course_instructor_link.course_id == course_id
#     ).all()
def get_course_instructors(db: Session, course_id: int):
    """
    Return Instructor rows for a given course_id.
    Note: when referencing columns on a Table object use the .c namespace.
    """
    return db.query(models.Instructor).join(
        models.course_instructor_link,
        models.Instructor.instructor_id == models.course_instructor_link.c.instructor_id
    ).filter(
        models.course_instructor_link.c.course_id == course_id
    ).all()


def get_course_students(db: Session, course_id: int):
    return db.query(models.Student).join(
        models.course_student_link,
        models.Student.student_id == models.course_student_link.c.student_id
    ).filter(
        models.course_student_link.c.course_id == course_id
    ).all()

def get_course_topics(db:Session, course_id:int):
    return db.query(models.Topic).join(
        models.course_topic_link,
        models.Topic.topic_id == models.course_topic_link.c.topic_id
    ).filter(
        models.course_topic_link.c.course_id == course_id
    ).all()


""" Crud for Folder operations """

def create_folder(db: Session, title: str, course_id: int, parent_id: Optional[int] = None):
    db_folder = models.Folder(title=title, course_id=course_id, parent_id=parent_id)
    db.add(db_folder)
    db.commit()
    db.refresh(db_folder)
    return db_folder

def add_item_to_folder(db: Session, folder_id: int, item_type: str, reference_id: int):
    # Map the reference_id to the correct column
    new_item = models.FolderItem(folder_id=folder_id, item_type=item_type)
    if item_type == "video": new_item.video_id = reference_id
    elif item_type == "notes": new_item.notes_id = reference_id
    elif item_type == "assignment": new_item.assignment_id = reference_id
    
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

""" Instructor Crud operations """

def create_instructor(db:Session,instructor:schemas.InstructorCreate):
    db_instr = models.Instructor(
        name = instructor.name,
        department = instructor.department,
        email_id = instructor.email_id
    )

    db.add(db_instr)
    db.commit()
    db.refresh(db_instr)
    return db_instr

def remove_instructor_by_id(db:Session, inst_id: int):
    db_inst = db.query(models.Instructor).filter(models.Instructor.instructor_id == inst_id).first()

    if db_inst:
        db.delete(db_inst)
        db.commit()
        return True

    return False

def assign_instructor_to_course(db: Session, course_id: int, instructor_id: int):
    """Link instructor to course via the course_instructor_link table"""
    db.execute(
        models.course_instructor_link.insert().values(
            course_id=course_id,
            instructor_id=instructor_id
        )
    )
    db.commit()
    return True


""" System Admin Crud operations """

def create_admin(db:Session, admin:schemas.SystemAdminCreate):
    db_admin = models.SystemAdmin(
        name = admin.name,
        email_id = admin.email_id
    )

    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)

    return db_admin


""" Topic crud operations  """

def create_topic(db:Session, topic:schemas.TopicCreate):
    db_topic = models.Topic(
        topic_name = topic.topic_name,
    )
    db.add(db_topic)
    db.commit()
    db.refresh(db_topic)
    return db_topic

def remove_topic_by_id(db:Session, topic_id: int):
    db_top = db.query(models.Topic).filter(models.Topic.topic_id == topic_id).first()

    if db_top:
        db.delete(db_top)
        db.commit()
        return True

    return False


""" Materials crud operations """

def add_textbook(db: Session, textb:schemas.TextbookCreate, c_id: int):
    db_topic = models.Textbook(
        title = textb.title,
        author = textb.author,
        publisher = textb.publisher,
        course_id = c_id
    )
    db.add(db_topic)
    db.commit()
    db.refresh(db_topic)
    return db_topic

def add_notes(db: Session, notes: schemas.NotesCreate,c_id):
    db_notes = models.Notes(
        title = notes.title,
        url_link = notes.url_link,
        document_type = notes.document_type,
        course_id = c_id
    )
    db.add(db_notes)
    db.commit()
    db.refresh(db_notes)
    return db_notes

def add_videos(db: Session, videos: schemas.VideoCreate, c_id: int):
    db_video = models.Video(
        title = videos.title,
        duration = videos.duration,
        url_link = videos.url_link,
        course_id = c_id
    )
    db.add(db_video)
    db.commit()
    db.refresh(db_video)
    return db_video

def remove_textbook(db: Session, text_id: int):
    db_text = db.query(models.Textbook).filter(models.Textbook.textbook_id == text_id).first()

    if db_text:
        db.delete(db_text)
        db.commit()
        return True

    return False

def remove_notes(db: Session, note_id: int):
    db_note = db.query(models.Notes).filter(models.Notes.notes_id == note_id).first()

    if db_note:
        db.delete(db_note)
        db.commit()
        return True

    return False

def remove_videos(db: Session, vid_id: int):
    db_vid = db.query(models.Video).filter(models.Video.video_id == vid_id).first()

    if db_vid:
        db.delete(db_vid)
        db.commit()
        return True

    return False

""" Student CRUD operations """

def create_student(db: Session, student: schemas.StudentCreate):
    new_student = models.Student(
        name=student.name,
        email_id=student.email_id,
        specialization=student.specialization,
        country=student.country,
        skill_level=student.skill_level,
        dob=student.dob,
        contact_number=student.contact_number       
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return new_student

def update_student_contact(db:Session, student_id: int, new_contact_number: int):
    db_student = db.query(models.Student).filter(models.Student.student_id == student_id).first()

    if db_student:
        db_student.contact_number = new_contact_number
        db.commit()
        db.refresh(db_student)

    return db_student

def update_student_skill_level(db:Session, student_id: int, new_skill_level: str):
    db_student = db.query(models.Student).filter(models.Student.student_id == student_id).first()

    if db_student:
        db_student.skill_level = new_skill_level
        db.commit()
        db.refresh(db_student)

    return db_student

def delete_student(db:Session, student_id: int):
    db_student = db.query(models.Student).filter(models.Student.student_id == student_id).first()

    if db_student:
        db.delete(db_student)
        db.commit()
        return True
    
    return False


""" University CRUD operations """

def create_University(db:Session, university: schemas.UniversityCreate):
    new_University = models.University(
        name=university.name,
        city=university.city,
        country=university.country
    )
    db.add(new_University)
    db.commit()
    db.refresh(new_University)
    return new_University

def update_institutename(db:Session, institute_id: int, new_institute_name: str):
    db_university = db.query(models.University).filter(models.University.institute_id == institute_id).first()

    if db_university:
        db_university.name = new_institute_name
        db.commit()
        db.refresh(db_university)

    return db_university


def delete_university(db:Session, institute_id: int):
    db_university = db.query(models.University).filter(models.University.institute_id == institute_id).first()

    if db_university:
        db.delete(db_university)
        db.commit()
        return True
    
    return False

""" Data Analyst CRUD operations """

def create_dataanalyst(db:Session, dataanalyst: schemas.DataAnalystCreate):
    new_dataanalyst = models.DataAnalyst(
        name=dataanalyst.name,
        email_id=dataanalyst.email_id,
        )
    db.add(new_dataanalyst)
    db.commit()
    db.refresh(new_dataanalyst)
    return new_dataanalyst

def update_dataanalyst_name(db:Session, analyst_id: int, new_name: str):
    db_dataanalyst = db.query(models.DataAnalyst).filter(models.DataAnalyst.analyst_id == analyst_id).first()

    if db_dataanalyst:
        db_dataanalyst.name = new_name
        db.commit()
        db.refresh(db_dataanalyst)

    return db_dataanalyst

def delete_dataanalyst(db:Session, dataanalyst_id: int):
    db_dataanalyst = db.query(models.DataAnalyst).filter(models.DataAnalyst.analyst_id == dataanalyst_id).first()

    if db_dataanalyst:
        db.delete(db_dataanalyst)
        db.commit()
        return True
    
    return False

""" Program CRUD operations """

def create_program(db:Session, program: schemas.ProgramCreate):
    new_program = models.Program(
        program_type=program.program_type,
    )
    db.add(new_program)
    db.commit()
    db.refresh(new_program)
    return new_program

def delete_program(db:Session, program_id: int):
    db_program = db.query(models.Program).filter(models.Program.program_id == program_id).first()

    if db_program:
        db.delete(db_program)
        db.commit()
        return True
    
    return False

def get_program_by_id(db: Session,program_id: int):
    return db.query(models.Program).filter(models.Program.program_id == program_id).first()


""" Assignment CRUD operations """

def create_assignment(db: Session, assignment: schemas.AssignmentCreate,c_id : int):
    new_assignment = models.Assignment(
        title=assignment.title,
        description=assignment.description,
        due_date=assignment.due_date,
        assignment_url_link=assignment.assignment_url_link,
        course_id=c_id
    )
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)
    return new_assignment

def get_assignment_by_course_id(db: Session, course_id: int):
    return db.query(models.Assignment).filter(models.Assignment.course_id == course_id).all()

def get_assignment_by_id(db: Session, assignment_id: int):
    return db.query(models.Assignment).filter(models.Assignment.assignment_id == assignment_id).first()

def update_assignment(db: Session, assignment_id: int, submission_url: str):
    db_assignment = db.query(models.Assignment).filter(models.Assignment.assignment_id == assignment_id).first()

    if db_assignment:
        db_assignment.submission_url_link = submission_url
        db.commit()
        db.refresh(db_assignment)

    return db_assignment

def create_submission(db: Session, subm: schemas.SubmissionCreate, student_id: int):
    # Create the model instance
    db_submission = models.StudentSubmission(
        assignment_id=subm.assignment_id,
        submission_url=subm.submission_url,
        student_id=student_id,
        status="Submitted", # Default status
        submitted_at=datetime.utcnow()
    )
    
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    return db_submission


def delete_assignment(db: Session, assignment_id: int):
    db_assignment = db.query(models.Assignment).filter(models.Assignment.assignment_id == assignment_id).first()

    if db_assignment:
        db.delete(db_assignment)
        db.commit()
        return True
    
    return False

