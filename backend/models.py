from backend.database import Base
from sqlalchemy import Column, Integer, String, Date, ForeignKey,DateTime, CheckConstraint, Table
from sqlalchemy.orm import relationship
from datetime import datetime
course_topic_link = Table(
    "course_topic_link",
    Base.metadata,
    Column("course_id", Integer, ForeignKey("course.course_id"), primary_key=True),
    Column("topic_id", Integer, ForeignKey("topic.topic_id"), primary_key=True)
)

course_student_link = Table(
    "course_student_link",
    Base.metadata,
    Column("course_id",Integer,ForeignKey("course.course_id"),primary_key=True),
    Column("student_id",Integer,ForeignKey("student.student_id"),primary_key=True)
)

# Relationship: Instructor "Teaches" Course (Many-to-Many)
course_instructor_link = Table(
    "course_instructor_link",
    Base.metadata,
    Column("course_id", Integer, ForeignKey("course.course_id"), primary_key=True),
    Column("instructor_id", Integer, ForeignKey("instructor.instructor_id"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="student")  # 'student', 'instructor', 'analyst', 'admin'
    
class Course(Base):
    __tablename__ = "course"

    course_id = Column(Integer, primary_key=True, index=True)
    course_name = Column(String(100), nullable=False)
    duration = Column(Integer)
    skill_level = Column(String(50))
    course_fees = Column(Integer)

    # One-to-Many Links
    program_id = Column(Integer, ForeignKey("program.program_id"))
    institute_id = Column(Integer, ForeignKey("university.institute_id"))
    # One - One
    textbook = relationship("Textbook", back_populates="course", uselist=False)
    # One - Many
    videos = relationship("Video",back_populates="course")
    notes = relationship("Notes",back_populates="course")
    assignment = relationship("Assignment",back_populates="course")
    university = relationship("University", back_populates="courses")
    program = relationship("Program", back_populates="courses")

class Student(Base):
    __tablename__ = "student"

    student_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    dob = Column(Date, nullable=False) 
    country = Column(String(50))
    skill_level = Column(String(50))
    email_id = Column(String(100), unique=True, index=True, nullable=False)
    contact_number = Column(String(20))
    specialization = Column(String(100))

class Instructor(Base):
    __tablename__ = "instructor"

    instructor_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    department = Column(String(100))
    email_id = Column(String(100), unique=True, nullable=False)

class Video(Base):
    __tablename__ = "video"

    video_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    duration = Column(Integer,nullable=False)
    url_link = Column(String, nullable=False)
    course_id = Column(Integer, ForeignKey("course.course_id"))
    course = relationship("Course", back_populates="videos")

class Notes(Base):
    __tablename__ = "notes"

    notes_id = Column(Integer, primary_key=True, index=True) 
    title = Column(String(100), nullable=False)
    url_link = Column(String, nullable=False)
    document_type = Column(String(20))
    course_id = Column(Integer, ForeignKey("course.course_id"))
    course = relationship("Course", back_populates="notes")

class Textbook(Base):
    __tablename__ = "textbook"

    textbook_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    author = Column(String(100))
    publisher = Column(String(100))

    course_id = Column(Integer, ForeignKey("course.course_id"),unique=True)
    # The Relationship Link
    course = relationship("Course",back_populates="textbook")

class University(Base):
    __tablename__ = "university"

    institute_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    city = Column(String(50))
    country = Column(String(50))

    # One to Many
    courses = relationship("Course",back_populates="university")


class SystemAdmin(Base):
    __tablename__ = "system_administrator"

    admin_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email_id = Column(String(100), unique=True)

class Topic(Base):
    __tablename__ = "topic"

    topic_id = Column(Integer, primary_key=True, index=True)
    topic_name = Column(String(100))

class Program(Base):
    __tablename__ = "program"

    program_id = Column(Integer, primary_key=True, index=True)
    program_type = Column(String(50)) 

    # One to Many
    courses = relationship("Course",back_populates="program")

class DataAnalyst(Base):
    __tablename__ = "data_analyst"

    analyst_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email_id = Column(String(100), unique=True, index=True, nullable=False)

class Evaluation(Base):
    __tablename__ = "evaluation"

    evaluation_id = Column(Integer, primary_key=True, index=True)
    marks = Column(Integer,CheckConstraint('marks >= 0 AND marks <= 100')) 
    pass_fail = Column(String(10))
    grade = Column(String(5))
    date_of_evaluation = Column(Date)

    student_id = Column(Integer, ForeignKey("student.student_id"), nullable=False)
    course_id = Column(Integer, ForeignKey("course.course_id"), nullable=False)

class Assignment(Base):
    __tablename__ = "assignment"

    assignment_id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(String(500))
    assignment_url_link = Column(String(200), nullable=False)
    marks = Column(Integer)
    due_date = Column(Date)
    course_id = Column(Integer, ForeignKey("course.course_id"))
    course = relationship("Course", back_populates="assignment")

class StudentSubmission(Base):
    __tablename__ = "student_submission"

    submission_id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignment.assignment_id"), nullable=False)
    student_id = Column(Integer, ForeignKey("student.student_id"), nullable=False)
    
    submission_url = Column(String(200), nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    obtained_marks = Column(Integer)  # Marks specifically for this student's work
    status = Column(String(20))       # e.g., "Graded", "Pending", "Late"