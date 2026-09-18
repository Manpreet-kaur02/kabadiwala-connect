"""
Database connection setup.

Defaults to a local SQLite file (kabadiwala.db) so the backend runs with
zero external setup for a hackathon demo. For the "real" PostgreSQL
deployment described in the problem statement, just set an environment
variable before starting the server, e.g.:

    export DATABASE_URL="postgresql://user:password@localhost:5432/kabadiwala"

No code changes are needed to switch — SQLAlchemy handles both dialects.
You will need to `pip install psycopg2-binary` to use PostgreSQL.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./kabadiwala.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
