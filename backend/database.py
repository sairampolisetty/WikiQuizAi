import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
from sqlalchemy.exc import OperationalError

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

DATABASE_URL = os.getenv("DATABASE_URL")

# Create engine temporarily without the database name to check/create it
# Assumes DATABASE_URL is in format: dialect+driver://user:password@host:port/dbname
# We need to split it to get the server url and db name
try:
    # simple parsing for typical urls
    if "sqlite" in DATABASE_URL:
        # SQLite doesn't need database creation like MySQL
        pass
    else:
        db_name = DATABASE_URL.split("/")[-1]
        server_url = DATABASE_URL.rsplit("/", 1)[0]
        
        # Connect to server to create DB if needed
        tmp_engine = create_engine(server_url)
        with tmp_engine.connect() as conn:
            conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {db_name}"))
            conn.commit()  # Ensure it is committed
except Exception as e:
    print(f"Warning: Could not check/create database automatically: {e}")

# Now connect normally
if "sqlite" in DATABASE_URL:
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
