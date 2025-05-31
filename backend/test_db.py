import os
import sqlite3
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Test direct SQLite connection
print("Testing direct SQLite connection...")
try:
    conn = sqlite3.connect('jobportal.db')
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print(f"Tables in database: {tables}")
    conn.close()
    print("Direct SQLite connection successful!")
except Exception as e:
    print(f"Direct SQLite connection failed: {str(e)}")

# Test SQLAlchemy connection
print("\nTesting SQLAlchemy connection...")
try:
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///jobportal.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db = SQLAlchemy(app)
    
    with app.app_context():
        result = db.engine.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in result]
        print(f"Tables via SQLAlchemy: {tables}")
    print("SQLAlchemy connection successful!")
except Exception as e:
    print(f"SQLAlchemy connection failed: {str(e)}")

# Check file permissions
print("\nChecking file permissions...")
try:
    db_path = 'jobportal.db'
    if os.path.exists(db_path):
        print(f"Database file exists at {os.path.abspath(db_path)}")
        print(f"File size: {os.path.getsize(db_path)} bytes")
        print(f"File permissions: {oct(os.stat(db_path).st_mode)[-3:]}")
        print(f"Is readable: {os.access(db_path, os.R_OK)}")
        print(f"Is writable: {os.access(db_path, os.W_OK)}")
    else:
        print(f"Database file does not exist at {os.path.abspath(db_path)}")
except Exception as e:
    print(f"Error checking file permissions: {str(e)}")