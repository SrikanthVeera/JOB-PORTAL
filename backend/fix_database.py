import os
import sqlite3
import json
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash

# Initialize Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///jobportal.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define models (simplified versions for repair)
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    full_name = db.Column(db.String(120))
    phone = db.Column(db.String(30))
    location = db.Column(db.String(120))
    role = db.Column(db.String(50), default='Admin')
    resume_headline = db.Column(db.String(255), default='')

class Job(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    company = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(100), nullable=False)
    salary = db.Column(db.String(50), nullable=False)
    tags = db.Column(db.Text, nullable=True)
    date_posted = db.Column(db.Date, nullable=False, default=db.func.current_date())
    admin_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

def check_database():
    """Check if database exists and has the expected tables"""
    print("Checking database...")
    
    # Check if database file exists
    if not os.path.exists('jobportal.db'):
        print("Database file not found. Creating new database.")
        create_database()
        return
    
    # Check if tables exist
    try:
        conn = sqlite3.connect('jobportal.db')
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [table[0] for table in cursor.fetchall()]
        conn.close()
        
        expected_tables = ['user', 'job', 'application', 'referral', 'education', 'experience', 'skill', 'project']
        missing_tables = [table for table in expected_tables if table not in tables]
        
        if missing_tables:
            print(f"Missing tables: {missing_tables}")
            print("Recreating database schema...")
            create_database()
        else:
            print("All expected tables found.")
            check_admin_user()
    except Exception as e:
        print(f"Error checking database: {str(e)}")
        print("Recreating database...")
        create_database()

def create_database():
    """Create database tables and add admin user"""
    try:
        with app.app_context():
            db.create_all()
            print("Database tables created successfully.")
            create_admin_user()
    except Exception as e:
        print(f"Error creating database: {str(e)}")

def check_admin_user():
    """Check if admin user exists, create if not"""
    try:
        with app.app_context():
            admin = User.query.filter_by(email='srikanthveera160@gmail.com').first()
            if not admin:
                print("Admin user not found. Creating admin user...")
                create_admin_user()
            else:
                print("Admin user exists.")
                check_sample_job()
    except Exception as e:
        print(f"Error checking admin user: {str(e)}")

def create_admin_user():
    """Create admin user"""
    try:
        with app.app_context():
            hashed_password = generate_password_hash('Srikanth@123')
            admin = User(
                email='srikanthveera160@gmail.com',
                password=hashed_password,
                is_admin=True,
                full_name='Srikanth Veera',
                role='Super Admin'
            )
            db.session.add(admin)
            db.session.commit()
            print("Admin user created successfully.")
            create_sample_job(admin.id)
    except Exception as e:
        print(f"Error creating admin user: {str(e)}")

def check_sample_job():
    """Check if sample job exists, create if not"""
    try:
        with app.app_context():
            job_count = Job.query.count()
            if job_count == 0:
                print("No jobs found. Creating sample job...")
                admin = User.query.filter_by(email='srikanthveera160@gmail.com').first()
                create_sample_job(admin.id)
            else:
                print(f"Found {job_count} jobs in database.")
    except Exception as e:
        print(f"Error checking sample job: {str(e)}")

def create_sample_job(admin_id):
    """Create a sample job"""
    try:
        with app.app_context():
            from datetime import date
            sample_job = Job(
                company="Sample Company",
                title="Software Developer",
                description="This is a sample job posting for a software developer position.",
                location="Remote",
                salary="$80,000 - $100,000",
                tags=json.dumps(["Python", "JavaScript", "React"]),
                date_posted=date.today(),
                admin_id=admin_id
            )
            db.session.add(sample_job)
            db.session.commit()
            print("Sample job created successfully.")
    except Exception as e:
        print(f"Error creating sample job: {str(e)}")

if __name__ == "__main__":
    check_database()
    print("Database check and repair completed.")