import os
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"Testing connection to: {DATABASE_URL}")

try:
    engine = create_engine(DATABASE_URL)
    connection = engine.connect()
    print("SUCCESS: Connected to database!")
    connection.close()
except Exception as e:
    print(f"FAILURE: Could not connect to database.\nError: {e}")
