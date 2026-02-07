from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URI = "postgresql://neondb_owner:npg_LVh1MtnwyRq3@ep-plain-lab-ai0lqsi8-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

engine = create_engine(SQLALCHEMY_DATABASE_URI, connect_args={"check_same_thread": False})

Base = declarative_base()

sessionlocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)   