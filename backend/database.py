import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker # type: ignore
from dotenv import load_dotenv

load_dotenv()

# Read DB URL from env, normalize quotes, fall back to a local sqlite file for development
db_url = os.getenv("SQLALCHEMY_DATABASE_URI")
if db_url:
    db_url = db_url.strip().strip('"').strip("'")

if not db_url:
    db_url = "sqlite:///./dev.db"

# For SQLite we need check_same_thread option
if db_url.startswith("sqlite"):
    engine = create_engine(db_url, connect_args={"check_same_thread": False})
else:
    engine = create_engine(db_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get DB session in routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()