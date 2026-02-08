from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
import models, database, os
from sqlalchemy.orm import Session


# This tells FastAPI where to look for the token (the /login URL)
# looks at the header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

def get_curr_student(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid Email")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid Token")

    # 1. Verify role in User table
    user_account = db.query(models.User).filter(
        models.User.email == email, 
        models.User.role == "student"
    ).first()
    
    if not user_account:
        raise HTTPException(status_code=403, detail="Not a student account")

    # 2. Fetch and return the actual STUDENT object
    student_profile = db.query(models.Student).filter(models.Student.email_id == email).first()
    
    if not student_profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    return student_profile


def get_curr_instructor(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid Token")

    # 1. Verify role in User table
    user_account = db.query(models.User).filter(
        models.User.email == email, 
        models.User.role == "instructor"
    ).first()
    
    if not user_account:
        raise HTTPException(status_code=403, detail="Not an instructor account")

    # 2. Fetch and return the actual INSTRUCTOR object
    instructor_profile = db.query(models.Instructor).filter(models.Instructor.email_id == email).first()
    
    return instructor_profile

def get_curr_analyst(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid Token")

    # 1. Verify role in User table
    user_account = db.query(models.User).filter(
        models.User.email == email, 
        models.User.role == "analyst"
    ).first()
    
    if not user_account:
        raise HTTPException(status_code=403, detail="Not a data analyst account")

    # 2. Fetch and return the actual ANALYST object
    analyst_profile = db.query(models.DataAnalyst).filter(models.DataAnalyst.email_id == email).first()
    
    if not analyst_profile:
        raise HTTPException(status_code=404, detail="Analyst profile not found")
    
    return analyst_profile


def get_curr_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid Token")

    # 1. Verify role in User table
    user_account = db.query(models.User).filter(
        models.User.email == email, 
        models.User.role == "admin"
    ).first()
    
    if not user_account:
        raise HTTPException(status_code=403, detail="Not an admin account")

    # 2. Fetch and return the actual ADMIN object
    admin_profile = db.query(models.SystemAdmin).filter(models.SystemAdmin.email_id == email).first()
    
    if not admin_profile:
        raise HTTPException(status_code=404, detail="Admin profile not found")
        
    return admin_profile