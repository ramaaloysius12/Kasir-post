from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()
# Menggunakan SQLite, file otomatis bernama coffeepos.db
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./coffeepos.db")

# check_same_thread=False diperlukan untuk SQLite agar tidak bentrok di Flask
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
