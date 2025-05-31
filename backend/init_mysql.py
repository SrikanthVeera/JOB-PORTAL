"""
Initialize MySQL database and tables for Job Portal application.
This script creates the necessary database and tables for the Job Portal application.
"""

import os
import pymysql
from werkzeug.security import generate_password_hash

# MySQL configuration
mysql_user = os.environ.get('MYSQL_USER', 'root')
mysql_password = os.environ.get('MYSQL_PASSWORD', '')
mysql_host = os.environ.get('MYSQL_HOST', 'localhost')
mysql_port = int(os.environ.get('MYSQL_PORT', '3306'))
mysql_database = os.environ.get('MYSQL_DATABASE', 'jobportal')

# Print configuration for debugging
print(f"MySQL Configuration:")
print(f"  User: {mysql_user}")
print(f"  Password: {'*' * len(mysql_password) if mysql_password else 'None'}")
print(f"  Host: {mysql_host}")
print(f"  Port: {mysql_port}")
print(f"  Database: {mysql_database}")
print()

def create_database():
    """Create the database if it doesn't exist"""
    try:
        # Connect to MySQL server without specifying a database
        connection = pymysql.connect(
            host=mysql_host,
            user=mysql_user,
            password=mysql_password,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        
        try:
            with connection.cursor() as cursor:
                # Check if database exists
                cursor.execute(f"SHOW DATABASES LIKE '{mysql_database}'")
                result = cursor.fetchone()
                
                if not result:
                    print(f"Creating database '{mysql_database}'...")
                    cursor.execute(f"CREATE DATABASE {mysql_database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
                    print(f"Database '{mysql_database}' created successfully!")
                else:
                    print(f"Database '{mysql_database}' already exists.")
        finally:
            connection.close()
            
        return True
    except Exception as e:
        print(f"Error creating database: {str(e)}")
        return False

def create_tables():
    """Create the necessary tables if they don't exist"""
    try:
        # Connect to the database
        connection = pymysql.connect(
            host=mysql_host,
            user=mysql_user,
            password=mysql_password,
            database=mysql_database,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        
        try:
            with connection.cursor() as cursor:
                # Create user table
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS user (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(120) UNIQUE NOT NULL,
                    password VARCHAR(200) NOT NULL,
                    is_admin BOOLEAN DEFAULT FALSE,
                    full_name VARCHAR(120),
                    phone VARCHAR(30),
                    location VARCHAR(120),
                    role VARCHAR(50) DEFAULT 'User',
                    resume_headline VARCHAR(255) DEFAULT ''
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """)
                
                # Create job table
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS job (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    company VARCHAR(100) NOT NULL,
                    title VARCHAR(100) NOT NULL,
                    description TEXT NOT NULL,
                    location VARCHAR(100) NOT NULL,
                    salary VARCHAR(50) NOT NULL,
                    tags TEXT,
                    date_posted DATE NOT NULL,
                    admin_id INT NOT NULL,
                    FOREIGN KEY (admin_id) REFERENCES user(id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """)
                
                # Create application table
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS application (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    job_id INT NOT NULL,
                    resume_path VARCHAR(200) NOT NULL,
                    status VARCHAR(20) DEFAULT 'pending',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES user(id),
                    FOREIGN KEY (job_id) REFERENCES job(id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """)
                
                # Create referral table
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS referral (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    job_id INT NOT NULL,
                    referrer_id INT NOT NULL,
                    referee_email VARCHAR(120) NOT NULL,
                    message TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (job_id) REFERENCES job(id),
                    FOREIGN KEY (referrer_id) REFERENCES user(id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """)
                
                # Create education table
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS education (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    degree VARCHAR(120) NOT NULL,
                    field VARCHAR(120) NOT NULL,
                    institution VARCHAR(200) NOT NULL,
                    year VARCHAR(50) NOT NULL,
                    grade VARCHAR(50),
                    FOREIGN KEY (user_id) REFERENCES user(id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """)
                
                # Create experience table
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS experience (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    company VARCHAR(200) NOT NULL,
                    position VARCHAR(120) NOT NULL,
                    duration VARCHAR(100) NOT NULL,
                    description TEXT,
                    FOREIGN KEY (user_id) REFERENCES user(id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """)
                
                # Create skill table
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS skill (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    name VARCHAR(100) NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES user(id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """)
                
                # Create project table
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS project (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    title VARCHAR(200) NOT NULL,
                    description TEXT,
                    technologies VARCHAR(500),
                    FOREIGN KEY (user_id) REFERENCES user(id)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """)
                
                print("All tables created successfully!")
        finally:
            connection.close()
            
        return True
    except Exception as e:
        print(f"Error creating tables: {str(e)}")
        return False

def create_admin_user():
    """Create admin user if it doesn't exist"""
    try:
        # Connect to the database
        connection = pymysql.connect(
            host=mysql_host,
            user=mysql_user,
            password=mysql_password,
            database=mysql_database,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        
        try:
            with connection.cursor() as cursor:
                # Check if admin user exists
                cursor.execute("SELECT * FROM user WHERE email = %s", ('srikanthveera160@gmail.com',))
                admin = cursor.fetchone()
                
                if not admin:
                    print("Creating admin user...")
                    hashed_password = generate_password_hash('Srikanth@123')
                    
                    cursor.execute("""
                    INSERT INTO user (email, password, is_admin, full_name, role, resume_headline)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """, (
                        'srikanthveera160@gmail.com',
                        hashed_password,
                        1,  # is_admin = True
                        'Srikanth Veera',
                        'Super Admin',
                        ''  # empty resume_headline
                    ))
                    connection.commit()
                    
                    print("Admin user created successfully!")
                else:
                    print("Admin user already exists.")
                    
                    # Ensure admin user has correct role and is_admin flag
                    if not admin['is_admin'] or admin['role'] != 'Super Admin':
                        cursor.execute("""
                        UPDATE user SET is_admin = 1, role = 'Super Admin'
                        WHERE email = 'srikanthveera160@gmail.com'
                        """)
                        connection.commit()
                        print("Admin user updated with correct role and permissions.")
        finally:
            connection.close()
            
        return True
    except Exception as e:
        print(f"Error creating admin user: {str(e)}")
        return False

def create_sample_job():
    """Create a sample job if no jobs exist"""
    try:
        # Connect to the database
        connection = pymysql.connect(
            host=mysql_host,
            user=mysql_user,
            password=mysql_password,
            database=mysql_database,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        
        try:
            with connection.cursor() as cursor:
                # Check if any jobs exist
                cursor.execute("SELECT COUNT(*) as count FROM job")
                job_count = cursor.fetchone()['count']
                
                if job_count == 0:
                    # Get admin user ID
                    cursor.execute("SELECT id FROM user WHERE email = 'srikanthveera160@gmail.com'")
                    admin = cursor.fetchone()
                    
                    if admin:
                        print("Creating sample job...")
                        import json
                        from datetime import date
                        
                        cursor.execute("""
                        INSERT INTO job (company, title, description, location, salary, tags, date_posted, admin_id)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        """, (
                            'Sample Company',
                            'Software Developer',
                            'This is a sample job posting for a software developer position.',
                            'Remote',
                            '$80,000 - $100,000',
                            json.dumps(["Python", "JavaScript", "React"]),
                            date.today().isoformat(),
                            admin['id']
                        ))
                        connection.commit()
                        
                        print("Sample job created successfully!")
                    else:
                        print("Admin user not found, cannot create sample job.")
                else:
                    print(f"Jobs already exist ({job_count} jobs found).")
        finally:
            connection.close()
            
        return True
    except Exception as e:
        print(f"Error creating sample job: {str(e)}")
        return False

def main():
    """Main function"""
    print("=== Initializing MySQL Database for Job Portal ===")
    
    # Create database
    if create_database():
        # Create tables
        if create_tables():
            # Create admin user
            if create_admin_user():
                # Create sample job
                create_sample_job()
    
    print("=== MySQL Database Initialization Complete ===")

if __name__ == "__main__":
    main()