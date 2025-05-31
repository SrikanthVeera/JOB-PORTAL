from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, verify_jwt_in_request, decode_token
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import timedelta, date, datetime
import pymysql
import json

# Initialize Flask app
app = Flask(__name__, template_folder='templates')

# Enable CORS for all routes
CORS(app,
     origins=["https://job-portal-3e7h.vercel.app", "https://job-portal-frontend.onrender.com", "http://localhost:3000"],
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     expose_headers=["Content-Type", "Authorization"])

# Add CORS headers to all responses
@app.after_request
def add_cors_headers(response):
    # Only add headers if it's not an OPTIONS preflight request that already has CORS headers
    if request.method != 'OPTIONS' or 'Access-Control-Allow-Origin' not in response.headers:
        # Check the origin of the request
        origin = request.headers.get('Origin', '')
        allowed_origins = ["https://job-portal-3e7h.vercel.app", "https://job-portal-frontend.onrender.com", "http://localhost:3000"]
        
        # Set the appropriate CORS headers based on the origin
        if origin in allowed_origins:
            response.headers['Access-Control-Allow-Origin'] = origin
        else:
            response.headers['Access-Control-Allow-Origin'] = 'https://job-portal-3e7h.vercel.app'
            
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    return response


# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key')

# Database configuration
# Check if MySQL credentials are provided in environment variables
mysql_user = os.environ.get('MYSQL_USER', 'root')
mysql_password = os.environ.get('MYSQL_PASSWORD', '')
mysql_host = os.environ.get('MYSQL_HOST', 'localhost')
mysql_port = os.environ.get('MYSQL_PORT', '3306')
mysql_database = os.environ.get('MYSQL_DATABASE', 'jobportal')

# Create MySQL connection string
mysql_uri = f"mysql+pymysql://{mysql_user}:{mysql_password}@{mysql_host}:{mysql_port}/{mysql_database}"

# Use environment variable if provided, otherwise use SQLite as default
database_url = os.environ.get('DATABASE_URL', 'sqlite:///jobportal.db')

# Check if we should use MySQL (set by environment variable)
use_mysql = os.environ.get('USE_MYSQL', 'false').lower() == 'true'

if use_mysql:
    try:
        # Test MySQL connection
        import pymysql
        connection = pymysql.connect(
            host=mysql_host,
            user=mysql_user,
            password=mysql_password,
            database=mysql_database,
            connect_timeout=5
        )
        connection.close()
        print("MySQL connection successful, using MySQL database")
        database_url = mysql_uri
    except Exception as e:
        print(f"MySQL connection failed: {str(e)}")
        print("Falling back to SQLite database")
        database_url = 'sqlite:///jobportal.db'
else:
    print("Using SQLite database (set USE_MYSQL=true to use MySQL)")

# Handle PostgreSQL URL format for Render.com
if database_url.startswith('postgres://'):
    database_url = database_url.replace('postgres://', 'postgresql://', 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)  # Increased to 30 days for testing
app.config['JWT_HEADER_TYPE'] = 'Bearer'
app.config['JWT_HEADER_NAME'] = 'Authorization'
app.config['UPLOAD_FOLDER'] = os.environ.get('UPLOAD_FOLDER', 'uploads')

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)

# Create uploads directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    full_name = db.Column(db.String(120))
    phone = db.Column(db.String(30))
    location = db.Column(db.String(120))
    role = db.Column(db.String(50), default='Admin')
    applications = db.relationship('Application', backref='user', lazy=True)
    resume_headline = db.Column(db.String(255), default='')
    educations = db.relationship('Education', backref='user', lazy=True, cascade='all, delete-orphan')
    experiences = db.relationship('Experience', backref='user', lazy=True, cascade='all, delete-orphan')
    skills = db.relationship('Skill', backref='user', lazy=True, cascade='all, delete-orphan')
    projects = db.relationship('Project', backref='user', lazy=True, cascade='all, delete-orphan')

class Job(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    company = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(100), nullable=False)
    salary = db.Column(db.String(50), nullable=False)
    tags = db.Column(db.Text, nullable=True)  # Store as JSON string
    date_posted = db.Column(db.Date, nullable=False, default=db.func.current_date())
    admin_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    applications = db.relationship('Application', backref='job', lazy=True, cascade="all, delete-orphan")
    referrals = db.relationship('Referral', backref='job', lazy=True, cascade="all, delete-orphan")

class Application(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('job.id'), nullable=False)
    resume_path = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

class Referral(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('job.id'), nullable=False)
    referrer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    referee_email = db.Column(db.String(120), nullable=False)
    message = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

class Education(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    degree = db.Column(db.String(120), nullable=False)
    field = db.Column(db.String(120), nullable=False)
    institution = db.Column(db.String(200), nullable=False)
    year = db.Column(db.String(50), nullable=False)
    grade = db.Column(db.String(50))

class Experience(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    company = db.Column(db.String(200), nullable=False)
    position = db.Column(db.String(120), nullable=False)
    duration = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)

class Skill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    technologies = db.Column(db.String(500))  # Store as comma-separated values

# Create database tables
with app.app_context():
    db.create_all()
    
    # Create admin user if it doesn't exist
    admin = User.query.filter_by(email='srikanthveera160@gmail.com').first()
    if not admin:
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
        
        # Add a sample job if there are no jobs
        if Job.query.count() == 0 and admin.id:
            sample_job = Job(
                company="Sample Company",
                title="Software Developer",
                description="This is a sample job posting for a software developer position.",
                location="Remote",
                salary="$80,000 - $100,000",
                tags=json.dumps(["Python", "JavaScript", "React"]),
                admin_id=admin.id
            )
            db.session.add(sample_job)
            db.session.commit()

# Routes
@app.route('/', methods=['GET'])
def index():
    # Check if the request accepts HTML
    if 'text/html' in request.headers.get('Accept', ''):
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Job Portal API</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                h1 { color: #333; }
                .success { color: green; }
                .info { color: blue; }
                pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
                a { color: #0066cc; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <h1>Job Portal API</h1>
            <p class="success">✅ API is running!</p>
            <p>This is the backend API for the Job Portal application.</p>
            <p>For more detailed testing, visit <a href="/railway-test">/railway-test</a></p>
            <p>API Version: 1.0.0</p>
        </body>
        </html>
        """
    else:
        # Return JSON for API clients
        return jsonify({
            'message': 'Job Portal API is running',
            'status': 'OK',
            'version': '1.0.0'
        })

@app.route('/test', methods=['GET'])
def test():
    return jsonify({
        'message': 'Test endpoint is working',
        'status': 'OK'
    })

@app.route('/cors-test', methods=['GET', 'OPTIONS'])
def cors_test():
    if request.method == 'OPTIONS':
        return '', 200
    return jsonify({
        'message': 'CORS test successful',
        'status': 'OK',
        'headers_received': dict(request.headers)
    })

@app.route('/login-test', methods=['GET'])
def login_test():
    return render_template('login-test.html')

@app.route('/auth-test', methods=['GET'])
def auth_test():
    return render_template('auth-test.html')

@app.route('/api/token-test', methods=['GET'])
def token_test():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header:
        return jsonify({
            'message': 'No Authorization header found',
            'status': 'error',
            'has_token': False
        }), 401
    
    try:
        # Extract token from Bearer format
        token = auth_header.split(' ')[1] if ' ' in auth_header else auth_header
        
        # Try to decode the token
        try:
            decoded = decode_token(token)
            return jsonify({
                'message': 'Token received and decoded successfully',
                'status': 'OK',
                'has_token': True,
                'token_length': len(token),
                'decoded': {
                    'identity': decoded.get('sub'),
                    'exp': decoded.get('exp'),
                    'iat': decoded.get('iat'),
                    'type': decoded.get('type')
                }
            })
        except Exception as decode_error:
            return jsonify({
                'message': f'Token received but failed to decode: {str(decode_error)}',
                'status': 'error',
                'has_token': True,
                'token_length': len(token)
            }), 401
    except Exception as e:
        return jsonify({
            'message': f'Error processing token: {str(e)}',
            'status': 'error',
            'has_token': True
        }), 500

@app.route('/api/debug-profile', methods=['GET'])
def debug_profile():
    """Debug endpoint that doesn't require JWT authentication"""
    auth_header = request.headers.get('Authorization', '')
    token_info = "No token provided"
    
    if auth_header:
        try:
            token = auth_header.split(' ')[1] if ' ' in auth_header else auth_header
            token_info = f"Token received (length: {len(token)})"
            
            # Try to decode the token
            try:
                decoded = decode_token(token)
                token_info = f"Valid token for user: {decoded.get('sub')}"
            except Exception as decode_error:
                token_info = f"Invalid token: {str(decode_error)}"
        except Exception as e:
            token_info = f"Error extracting token: {str(e)}"
    
    # Get admin user for reference
    try:
        admin = User.query.filter_by(email='srikanthveera160@gmail.com').first()
        admin_info = {
            'id': admin.id,
            'email': admin.email,
            'is_admin': admin.is_admin,
            'role': admin.role
        } if admin else "Admin user not found"
    except Exception as e:
        admin_info = f"Error fetching admin: {str(e)}"
    
    return jsonify({
        'message': 'Debug profile endpoint',
        'status': 'OK',
        'token_info': token_info,
        'admin_info': admin_info,
        'request_headers': dict(request.headers),
        'auth_instructions': {
            'login_url': '/api/login',
            'login_payload': {
                'email': 'srikanthveera160@gmail.com',
                'password': 'Srikanth@123'
            },
            'token_usage': 'Include token in Authorization header as "Bearer <token>"'
        },
        'sample_user': {
            'id': 1,
            'email': 'sample@example.com',
            'full_name': 'Sample User',
            'phone': '123-456-7890',
            'location': 'Sample Location',
            'is_admin': False,
            'role': 'user',
            'resume_headline': 'Sample Resume Headline'
        }
    })

@app.route('/railway-test', methods=['GET'])
def railway_test():
    # Return a simple HTML page for testing
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Railway Test</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            h1 { color: #333; }
            .success { color: green; }
            .info { color: blue; }
            pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
        </style>
    </head>
    <body>
        <h1>Railway Test Page</h1>
        <p class="success">✅ If you can see this page, your Flask app is running correctly!</p>
        <p class="info">Server Information:</p>
        <pre>
Flask Version: {flask_version}
Python Version: {python_version}
Environment: {environment}
Port: {port}
        </pre>
        <p>Try these endpoints:</p>
        <ul>
            <li><a href="/test">/test</a> - JSON test endpoint</li>
            <li><a href="/api/jobs">/api/jobs</a> - Jobs API endpoint</li>
            <li><a href="/api/companies">/api/companies</a> - Companies API endpoint</li>
        </ul>
    </body>
    </html>
    """
    import flask
    import sys
    import platform
    
    return html.format(
        flask_version=flask.__version__,
        python_version=sys.version,
        environment=os.environ.get('RAILWAY_ENVIRONMENT', 'Unknown'),
        port='5000'
    )
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    hashed_password = generate_password_hash(data['password'])
    new_user = User(
        email=data['email'],
        password=hashed_password,
        is_admin=data.get('is_admin', False),
        full_name=data.get('full_name'),
        phone=data.get('phone'),
        location=data.get('location')
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        print(f"Login attempt with data: {data}")
        
        if not data:
            print("No JSON data received")
            return jsonify({'error': 'No JSON data received'}), 400
            
        if 'email' not in data or 'password' not in data:
            print("Email or password missing")
            return jsonify({'error': 'Email and password are required'}), 400

        # Check if trying to log in as admin
        if data['email'] == 'srikanthveera160@gmail.com':
            print("Admin login attempt")
            
            # Use direct MySQL connection for admin authentication if MySQL is enabled
            if use_mysql:
                try:
                    import pymysql
                    
                    # Connect to MySQL database
                    connection = pymysql.connect(
                        host=mysql_host,
                        user=mysql_user,
                        password=mysql_password,
                        database=mysql_database,
                        charset='utf8mb4',
                        cursorclass=pymysql.cursors.DictCursor,
                        connect_timeout=5
                    )
                    
                    with connection.cursor() as cursor:
                        # Check if admin exists in MySQL
                        sql = "SELECT * FROM user WHERE email = %s"
                        cursor.execute(sql, ('srikanthveera160@gmail.com',))
                        admin_record = cursor.fetchone()
                        
                        if admin_record:
                            # Verify password
                            if check_password_hash(admin_record['password'], data['password']):
                                # Admin exists and password is correct
                                print("Admin authenticated via MySQL")
                                
                                # Create identity object for JWT
                                identity = {
                                    'id': admin_record['id'],
                                    'is_admin': True,
                                    'role': 'Super Admin'
                                }
                                access_token = create_access_token(identity=identity)
                                
                                return jsonify({
                                    'access_token': access_token,
                                    'is_admin': True,
                                    'user_id': admin_record['id'],
                                    'message': 'Admin login successful via MySQL'
                                }), 200
                            else:
                                # Password incorrect
                                print("Admin password incorrect")
                                return jsonify({'error': 'Wrong password for admin'}), 401
                        else:
                            # Admin doesn't exist in MySQL, create it
                            print("Admin not found in MySQL, creating...")
                            hashed_password = generate_password_hash(data['password'])
                            
                            sql = """
                            INSERT INTO user (email, password, is_admin, full_name, role, resume_headline)
                            VALUES (%s, %s, %s, %s, %s, %s)
                            """
                            cursor.execute(sql, (
                                'srikanthveera160@gmail.com',
                                hashed_password,
                                1,  # is_admin = True
                                'Srikanth Veera',
                                'Super Admin',
                                ''  # empty resume_headline
                            ))
                            connection.commit()
                            
                            # Get the newly created admin ID
                            cursor.execute("SELECT LAST_INSERT_ID() as id")
                            admin_id = cursor.fetchone()['id']
                            
                            # Create identity object for JWT
                            identity = {
                                'id': admin_id,
                                'is_admin': True,
                                'role': 'Super Admin'
                            }
                            access_token = create_access_token(identity=identity)
                            
                            print(f"Admin created in MySQL with ID: {admin_id}")
                            
                            return jsonify({
                                'access_token': access_token,
                                'is_admin': True,
                                'user_id': admin_id,
                                'message': 'Admin created and login successful via MySQL'
                            }), 200
                            
                    # Close the connection
                    connection.close()
                    
                except Exception as mysql_error:
                    print(f"MySQL error: {str(mysql_error)}")
                    # Fallback to SQLAlchemy if MySQL connection fails
                    print("Falling back to SQLAlchemy for admin login")
                
            # If MySQL is not enabled or connection failed, use SQLAlchemy
            print("Using SQLAlchemy for admin login")
            
            user = User.query.filter_by(email='srikanthveera160@gmail.com').first()
            # If user does not exist, create admin user
            if not user:
                print("Creating admin user via SQLAlchemy")
                hashed_password = generate_password_hash(data['password'])
                user = User(email='srikanthveera160@gmail.com', password=hashed_password, is_admin=True, full_name='Srikanth Veera', role='Super Admin')
                db.session.add(user)
                db.session.commit()
            # Ensure is_admin is True and role is set
            if not user.is_admin or user.role != 'Super Admin':
                user.is_admin = True
                user.role = 'Super Admin'
                db.session.commit()
            
            # Verify password
            if not check_password_hash(user.password, data['password']):
                print("Admin password incorrect")
                return jsonify({'error': 'Wrong password for admin'}), 401
            
            # Create identity object for JWT
            identity = {'id': user.id, 'is_admin': True, 'role': 'Super Admin'}
            access_token = create_access_token(identity=identity)
            
            print(f"Admin login successful via SQLAlchemy. Token created for user ID: {user.id}")
            
            return jsonify({
                'access_token': access_token,
                'is_admin': True,
                'user_id': user.id,
                'message': 'Admin login successful via SQLAlchemy'
            }), 200

        # For all other users, use SQLAlchemy
        print(f"Regular user login attempt for email: {data['email']}")
        user = User.query.filter_by(email=data['email']).first()
        if user and check_password_hash(user.password, data['password']):
            # Force is_admin to False for all except the admin email
            identity = {
                'id': user.id,
                'is_admin': False,
                'role': 'user'
            }
            access_token = create_access_token(identity=identity)
            
            print(f"User login successful. Token created for user ID: {user.id}")
            
            return jsonify({
                'access_token': access_token,
                'is_admin': False,
                'user_id': user.id,
                'message': 'User login successful'
            }), 200

        print("Invalid credentials")
        return jsonify({'error': 'Wrong email or password'}), 401
    except Exception as e:
        print(f"Exception in login: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/jobs', methods=['GET', 'OPTIONS'])
def get_jobs():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        origin = request.headers.get('Origin', '')
        allowed_origins = ["https://job-portal-3e7h.vercel.app", "https://job-portal-frontend.onrender.com", "http://localhost:3000"]
        
        if origin in allowed_origins:
            response.headers['Access-Control-Allow-Origin'] = origin
        else:
            response.headers['Access-Control-Allow-Origin'] = 'https://job-portal-3e7h.vercel.app'
            
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        return response
    
    try:
        print("Fetching jobs...")
        jobs = Job.query.all()
        print(f"Found {len(jobs)} jobs")
        
        job_list = []
        for job in jobs:
            try:
                job_data = {
                    'id': job.id,
                    'company': job.company,
                    'title': job.title,
                    'description': job.description,
                    'location': job.location,
                    'salary': job.salary,
                    'tags': [],
                    'date_posted': job.date_posted.strftime('%d %b, %Y') if job.date_posted else None,
                    'admin_id': job.admin_id
                }
                
                # Safely parse tags
                if job.tags:
                    try:
                        job_data['tags'] = json.loads(job.tags)
                    except json.JSONDecodeError:
                        # If tags is not valid JSON, treat it as a comma-separated string
                        job_data['tags'] = [tag.strip() for tag in job.tags.split(',') if tag.strip()]
                    except Exception as tag_error:
                        print(f"Error parsing tags for job {job.id}: {str(tag_error)}")
                        job_data['tags'] = []
                
                job_list.append(job_data)
                print(f"Processed job {job.id}: {job.title}")
            except Exception as job_error:
                print(f"Error processing job {job.id}: {str(job_error)}")
                # Continue processing other jobs
        
        response = jsonify({'jobs': job_list})
        return response, 200
    except Exception as e:
        print(f"Error in get_jobs: {str(e)}")
        return jsonify({'jobs': [], 'error': str(e)}), 500

@app.route('/api/jobs/<int:job_id>', methods=['GET'])
def get_job(job_id):
    job = Job.query.get_or_404(job_id)
    return jsonify({
        'id': job.id,
        'title': job.title,
        'description': job.description,
        'location': job.location,
        'salary': job.salary
    }), 200

@app.route('/api/jobs', methods=['POST'])
@jwt_required()
def create_job():
    current_user = get_jwt_identity()
    if not current_user['is_admin']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    new_job = Job(
        company=data['company'],
        title=data['title'],
        description=data['description'],
        location=data['location'],
        salary=data['salary'],
        tags=json.dumps(data.get('tags', [])),
        date_posted=data.get('date_posted'),
        admin_id=current_user['id']
    )
    
    db.session.add(new_job)
    db.session.commit()
    
    return jsonify({'message': 'Job created successfully'}), 201

@app.route('/api/jobs/<int:job_id>', methods=['DELETE'])
@jwt_required()
def delete_job(job_id):
    current_user = get_jwt_identity()
    if not current_user['is_admin']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    job = Job.query.get_or_404(job_id)
    # Delete related applications and referrals
    Application.query.filter_by(job_id=job.id).delete()
    Referral.query.filter_by(job_id=job.id).delete()
    db.session.delete(job)
    db.session.commit()
    
    return jsonify({'message': 'Job deleted successfully'}), 200

@app.route('/api/jobs/<int:job_id>', methods=['PUT'])
@jwt_required()
def edit_job(job_id):
    current_user = get_jwt_identity()
    if not current_user['is_admin']:
        return jsonify({'error': 'Unauthorized'}), 403
    job = Job.query.get_or_404(job_id)
    data = request.get_json()
    job.title = data.get('title', job.title)
    job.company = data.get('company', job.company)
    job.location = data.get('location', job.location)
    job.salary = data.get('salary', job.salary)
    job.description = data.get('description', job.description)
    # Save tags as JSON string
    tags = data.get('tags')
    if tags is not None:
        if isinstance(tags, list):
            job.tags = json.dumps(tags)
        elif isinstance(tags, str):
            job.tags = json.dumps([t.strip() for t in tags.split(',') if t.strip()])
    db.session.commit()
    return jsonify({'message': 'Job updated successfully'}), 200

@app.route('/api/jobs/<int:job_id>/applications', methods=['GET'])
@jwt_required()
def get_job_applications(job_id):
    current_user = get_jwt_identity()
    if not current_user['is_admin']:
        return jsonify({'error': 'Unauthorized'}), 403
    job = Job.query.get_or_404(job_id)
    applications = Application.query.filter_by(job_id=job.id).all()
    return jsonify([
        {
            'id': app.id,
            'user': {
                'id': app.user.id,
                'email': app.user.email
            },
            'resume_path': app.resume_path,
            'status': app.status
        }
        for app in applications
    ]), 200

@app.route('/api/applications', methods=['GET'])
@jwt_required()
def get_applications():
    current_user = get_jwt_identity()
    if not current_user['is_admin']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    applications = Application.query.all()
    return jsonify([{
        'id': app.id,
        'job': {
            'id': app.job.id,
            'title': app.job.title
        },
        'user': {
            'id': app.user.id,
            'email': app.user.email
        },
        'resume_path': app.resume_path,
        'status': app.status
    } for app in applications]), 200

@app.route('/api/applications', methods=['POST'])
@jwt_required()
def create_application():
    current_user = get_jwt_identity()
    if current_user['is_admin']:
        return jsonify({'error': 'Admins cannot apply for jobs'}), 403
    
    if 'resume' not in request.files:
        return jsonify({'error': 'No resume file provided'}), 400
    
    resume = request.files['resume']
    if resume.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if not resume.filename.endswith('.pdf'):
        return jsonify({'error': 'Only PDF files are allowed'}), 400
    
    job_id = request.form.get('job_id')
    if not job_id:
        return jsonify({'error': 'Job ID is required'}), 400
    
    # Save the resume file
    filename = f"{current_user['id']}_{job_id}_{resume.filename}"
    resume_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    resume.save(resume_path)
    
    # Create the application
    new_application = Application(
        user_id=current_user['id'],
        job_id=job_id,
        resume_path=resume_path,
        status='pending'
    )
    
    db.session.add(new_application)
    db.session.commit()
    
    return jsonify({'message': 'Application submitted successfully'}), 201

@app.route('/api/referrals', methods=['POST'])
@jwt_required()
def create_referral():
    current_user = get_jwt_identity()
    data = request.get_json()
    job_id = data.get('job_id')
    referee_email = data.get('referee_email')
    message = data.get('message', '')

    if not job_id or not referee_email:
        return jsonify({'error': 'Job ID and referee email required'}), 400

    referral = Referral(
        job_id=job_id,
        referrer_id=current_user['id'],
        referee_email=referee_email,
        message=message
    )
    db.session.add(referral)
    db.session.commit()
    return jsonify({'message': 'Referral sent successfully'}), 201

@app.route('/api/referrals', methods=['GET'])
@jwt_required()
def get_referrals():
    current_user = get_jwt_identity()
    if not current_user['is_admin']:
        return jsonify({'error': 'Unauthorized'}), 403
    referrals = Referral.query.all()
    return jsonify([
        {
            'id': r.id,
            'job_id': r.job_id,
            'referrer_id': r.referrer_id,
            'referee_email': r.referee_email,
            'message': r.message,
            'timestamp': r.timestamp.isoformat()
        } for r in referrals
    ])

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    admin = User.query.filter_by(email=email, is_admin=True).first()

    if not admin or not check_password_hash(admin.password, password):
        return jsonify({'message': 'Invalid credentials'}), 401

    token = create_access_token(identity={'role': 'admin', 'id': admin.id, 'email': admin.email})
    return jsonify({'token': token}), 200

@app.route('/api/profile', methods=['GET', 'OPTIONS'])
def get_profile():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        origin = request.headers.get('Origin', '')
        allowed_origins = ["https://job-portal-3e7h.vercel.app", "https://job-portal-frontend.onrender.com", "http://localhost:3000"]
        
        if origin in allowed_origins:
            response.headers['Access-Control-Allow-Origin'] = origin
        else:
            response.headers['Access-Control-Allow-Origin'] = 'https://job-portal-3e7h.vercel.app'
            
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        return response
    
    # Get the JWT token from the Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        print("No Authorization header found")
        return jsonify({
            'error': 'Authentication required',
            'msg': 'Missing Authorization Header',
            'status': 401,
            'details': 'Please login to access this endpoint'
        }), 401
    
    try:
        # Extract token from Bearer format
        token = auth_header.split(' ')[1] if ' ' in auth_header else auth_header
        
        # Verify and decode the token
        try:
            # This will raise an exception if the token is invalid
            verify_jwt_in_request()
            current_user = get_jwt_identity()
            
            print(f"Profile request for user: {current_user}")
            
            if not isinstance(current_user, dict) or 'id' not in current_user:
                print(f"Invalid user identity format: {current_user}")
                return jsonify({'error': 'Invalid user identity format'}), 400
            
            user = User.query.get(current_user['id'])
            if not user:
                print(f"User not found with ID: {current_user['id']}")
                return jsonify({'error': 'User not found'}), 404
            
            print(f"Profile found for user ID: {user.id}, email: {user.email}")
            response = jsonify({
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'phone': user.phone,
                'location': user.location,
                'is_admin': user.is_admin,
                'role': user.role,
                'resume_headline': user.resume_headline
            })
            return response
        except Exception as token_error:
            print(f"Token validation error: {str(token_error)}")
            return jsonify({
                'error': 'Invalid or expired token',
                'msg': 'Token validation failed',
                'status': 401,
                'details': str(token_error)
            }), 401
    except Exception as e:
        print(f"Exception in get_profile: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/profile', methods=['PUT', 'OPTIONS'])
def update_profile():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        origin = request.headers.get('Origin', '')
        allowed_origins = ["https://job-portal-3e7h.vercel.app", "https://job-portal-frontend.onrender.com", "http://localhost:3000"]
        
        if origin in allowed_origins:
            response.headers['Access-Control-Allow-Origin'] = origin
        else:
            response.headers['Access-Control-Allow-Origin'] = 'https://job-portal-3e7h.vercel.app'
            
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        return response
    
    # Get the JWT token from the Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        print("No Authorization header found")
        return jsonify({
            'error': 'Authentication required',
            'msg': 'Missing Authorization Header',
            'status': 401,
            'details': 'Please login to access this endpoint'
        }), 401
    
    try:
        # Verify JWT token
        verify_jwt_in_request()
        current_user = get_jwt_identity()
        
        user = User.query.get(current_user['id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        user.full_name = data.get('full_name', user.full_name)
        user.phone = data.get('phone', user.phone)
        user.location = data.get('location', user.location)
        user.resume_headline = data.get('resume_headline', user.resume_headline)
        db.session.commit()
        
        response = jsonify({'message': 'Profile updated successfully'})
        return response
    except Exception as e:
        print(f"Exception in update_profile: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/my-applications', methods=['GET'])
@jwt_required()
def my_applications():
    current_user = get_jwt_identity()
    apps = Application.query.filter_by(user_id=current_user['id']).all()
    return jsonify([
        {
            'id': app.id,
            'job_id': app.job_id,
            'job_title': app.job.title,
            'status': app.status,
            'resume_path': app.resume_path
        } for app in apps
    ])

@app.route('/api/my-applications/<int:app_id>', methods=['DELETE'])
@jwt_required()
def withdraw_application(app_id):
    current_user = get_jwt_identity()
    app = Application.query.filter_by(id=app_id, user_id=current_user['id']).first()
    if not app:
        return jsonify({'error': 'Application not found'}), 404
    db.session.delete(app)
    db.session.commit()
    return jsonify({'message': 'Application withdrawn successfully'})

# In-memory static companies list for demo
companies_data = [
    {"id": 1, "name": "Zoho", "industry": "Software Product", "description": "Zoho Corp", "status": True, "logo_url": "https://logo.clearbit.com/zoho.com"},
    {"id": 2, "name": "Wipro", "industry": "IT Services & Consulting", "description": "Wipro Ltd", "status": True, "logo_url": "https://logo.clearbit.com/wipro.com"},
    {"id": 3, "name": "Crestocode Product", "industry": "Software Product", "description": "Crestocode", "status": True, "logo_url": "/uploads/crestocode-logo.png"},
    {"id": 4, "name": "Paytm", "industry": "Fintech", "description": "Paytm", "status": True, "logo_url": "https://logo.clearbit.com/paytm.com"},
    {"id": 5, "name": "Tata Consultancy Services", "industry": "IT Services & Consulting", "description": "TCS", "status": True, "logo_url": "https://logo.clearbit.com/tcs.com"},
    {"id": 6, "name": "Infosys", "industry": "IT Services & Consulting", "description": "Infosys", "status": True, "logo_url": "https://logo.clearbit.com/infosys.com"},
    {"id": 7, "name": "Amazon", "industry": "E-commerce", "description": "Amazon", "status": True, "logo_url": "https://logo.clearbit.com/amazon.com"},
    {"id": 8, "name": "Google", "industry": "Software Product", "description": "Google", "status": True, "logo_url": "https://logo.clearbit.com/google.com"},
    {"id": 9, "name": "HCL Technologies", "industry": "IT Services & Consulting", "description": "HCL", "status": True, "logo_url": "https://logo.clearbit.com/hcltech.com"},
    {"id": 10, "name": "Flipkart", "industry": "E-commerce", "description": "Flipkart", "status": True, "logo_url": "https://logo.clearbit.com/flipkart.com"}
]

@app.route('/api/companies', methods=['GET'])
def get_companies():
    return jsonify(companies_data)

@app.route('/api/companies', methods=['POST'])
def add_company():
    data = request.form.to_dict()
    # Handle file upload if present
    logo_url = ""
    if 'logo' in request.files:
        logo = request.files['logo']
        # For demo, just use the filename (in production, save the file and use the path)
        logo_url = f"/uploads/{logo.filename}"
    new_id = max([c['id'] for c in companies_data]) + 1 if companies_data else 1
    company = {
        "id": new_id,
        "name": data.get("name", ""),
        "email": data.get("email", ""),
        "phone": data.get("phone", ""),
        "address": data.get("address", ""),
        "website": data.get("website", ""),
        "industry": data.get("industry", ""),
        "description": data.get("description", ""),
        "status": data.get("status", "true") in ["true", "True", True],
        "logo_url": logo_url
    }
    companies_data.append(company)
    return jsonify({"message": "Company added successfully!", "company": company}), 201

@app.route('/api/companies/<int:company_id>', methods=['GET'])
def get_company(company_id):
    company = next((c for c in companies_data if c['id'] == company_id), None)
    if company:
        return jsonify(company)
    else:
        return jsonify({'error': 'Company not found'}), 404

@app.route('/api/companies/<int:company_id>', methods=['PUT'])
def update_company(company_id):
    data = request.form.to_dict()
    company = next((c for c in companies_data if c['id'] == company_id), None)
    if not company:
        return jsonify({'error': 'Company not found'}), 404
    # Update fields
    for key in ['name', 'email', 'phone', 'address', 'website', 'industry', 'description']:
        if key in data:
            company[key] = data[key]
    if 'status' in data:
        company['status'] = data['status'] in ['true', 'True', True]
    # Handle logo update if present
    if 'logo' in request.files:
        logo = request.files['logo']
        company['logo_url'] = f'/uploads/{logo.filename}'
    return jsonify({'message': 'Company updated successfully!', 'company': company}), 200

@app.route('/api/companies/<int:company_id>', methods=['DELETE'])
def delete_company(company_id):
    global companies_data
    before = len(companies_data)
    companies_data = [c for c in companies_data if c['id'] != company_id]
    after = len(companies_data)
    if before == after:
        return jsonify({'error': 'Company not found'}), 404
    return jsonify({'message': 'Company deleted successfully!'}), 200

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/profile/education', methods=['GET'])
@jwt_required()
def get_education():
    current_user = get_jwt_identity()
    educations = Education.query.filter_by(user_id=current_user['id']).all()
    return jsonify([{
        'id': edu.id,
        'degree': edu.degree,
        'field': edu.field,
        'institution': edu.institution,
        'year': edu.year,
        'grade': edu.grade
    } for edu in educations])

@app.route('/api/profile/education', methods=['POST'])
@jwt_required()
def add_education():
    current_user = get_jwt_identity()
    data = request.get_json()
    education = Education(
        user_id=current_user['id'],
        degree=data['degree'],
        field=data['field'],
        institution=data['institution'],
        year=data['year'],
        grade=data.get('grade')
    )
    db.session.add(education)
    db.session.commit()
    return jsonify({'message': 'Education added successfully', 'id': education.id}), 201

@app.route('/api/profile/education/<int:edu_id>', methods=['PUT'])
@jwt_required()
def update_education(edu_id):
    current_user = get_jwt_identity()
    education = Education.query.filter_by(id=edu_id, user_id=current_user['id']).first()
    if not education:
        return jsonify({'error': 'Education not found'}), 404
    data = request.get_json()
    education.degree = data.get('degree', education.degree)
    education.field = data.get('field', education.field)
    education.institution = data.get('institution', education.institution)
    education.year = data.get('year', education.year)
    education.grade = data.get('grade', education.grade)
    db.session.commit()
    return jsonify({'message': 'Education updated successfully'})

@app.route('/api/profile/education/<int:edu_id>', methods=['DELETE'])
@jwt_required()
def delete_education(edu_id):
    current_user = get_jwt_identity()
    education = Education.query.filter_by(id=edu_id, user_id=current_user['id']).first()
    if not education:
        return jsonify({'error': 'Education not found'}), 404
    db.session.delete(education)
    db.session.commit()
    return jsonify({'message': 'Education deleted successfully'})

@app.route('/api/profile/experience', methods=['GET'])
@jwt_required()
def get_experience():
    current_user = get_jwt_identity()
    experiences = Experience.query.filter_by(user_id=current_user['id']).all()
    return jsonify([{
        'id': exp.id,
        'company': exp.company,
        'position': exp.position,
        'duration': exp.duration,
        'description': exp.description
    } for exp in experiences])

@app.route('/api/profile/experience', methods=['POST'])
@jwt_required()
def add_experience():
    current_user = get_jwt_identity()
    data = request.get_json()
    experience = Experience(
        user_id=current_user['id'],
        company=data['company'],
        position=data['position'],
        duration=data['duration'],
        description=data.get('description')
    )
    db.session.add(experience)
    db.session.commit()
    return jsonify({'message': 'Experience added successfully', 'id': experience.id}), 201

@app.route('/api/profile/experience/<int:exp_id>', methods=['PUT'])
@jwt_required()
def update_experience(exp_id):
    current_user = get_jwt_identity()
    experience = Experience.query.filter_by(id=exp_id, user_id=current_user['id']).first()
    if not experience:
        return jsonify({'error': 'Experience not found'}), 404
    data = request.get_json()
    experience.company = data.get('company', experience.company)
    experience.position = data.get('position', experience.position)
    experience.duration = data.get('duration', experience.duration)
    experience.description = data.get('description', experience.description)
    db.session.commit()
    return jsonify({'message': 'Experience updated successfully'})

@app.route('/api/profile/experience/<int:exp_id>', methods=['DELETE'])
@jwt_required()
def delete_experience(exp_id):
    current_user = get_jwt_identity()
    experience = Experience.query.filter_by(id=exp_id, user_id=current_user['id']).first()
    if not experience:
        return jsonify({'error': 'Experience not found'}), 404
    db.session.delete(experience)
    db.session.commit()
    return jsonify({'message': 'Experience deleted successfully'})

@app.route('/api/profile/skills', methods=['GET'])
@jwt_required()
def get_skills():
    current_user = get_jwt_identity()
    skills = Skill.query.filter_by(user_id=current_user['id']).all()
    return jsonify([{'id': skill.id, 'name': skill.name} for skill in skills])

@app.route('/api/profile/skills', methods=['POST'])
@jwt_required()
def add_skill():
    current_user = get_jwt_identity()
    data = request.get_json()
    skill = Skill(user_id=current_user['id'], name=data['name'])
    db.session.add(skill)
    db.session.commit()
    return jsonify({'message': 'Skill added successfully', 'id': skill.id}), 201

@app.route('/api/profile/skills/<int:skill_id>', methods=['DELETE'])
@jwt_required()
def delete_skill(skill_id):
    current_user = get_jwt_identity()
    skill = Skill.query.filter_by(id=skill_id, user_id=current_user['id']).first()
    if not skill:
        return jsonify({'error': 'Skill not found'}), 404
    db.session.delete(skill)
    db.session.commit()
    return jsonify({'message': 'Skill deleted successfully'})

@app.route('/api/profile/projects', methods=['GET'])
@jwt_required()
def get_projects():
    current_user = get_jwt_identity()
    projects = Project.query.filter_by(user_id=current_user['id']).all()
    return jsonify([{
        'id': proj.id,
        'title': proj.title,
        'description': proj.description,
        'technologies': proj.technologies.split(',') if proj.technologies else []
    } for proj in projects])

@app.route('/api/profile/projects', methods=['POST'])
@jwt_required()
def add_project():
    current_user = get_jwt_identity()
    data = request.get_json()
    project = Project(
        user_id=current_user['id'],
        title=data['title'],
        description=data.get('description'),
        technologies=','.join(data.get('technologies', []))
    )
    db.session.add(project)
    db.session.commit()
    return jsonify({'message': 'Project added successfully', 'id': project.id}), 201

@app.route('/api/profile/projects/<int:proj_id>', methods=['PUT'])
@jwt_required()
def update_project(proj_id):
    current_user = get_jwt_identity()
    project = Project.query.filter_by(id=proj_id, user_id=current_user['id']).first()
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    data = request.get_json()
    project.title = data.get('title', project.title)
    project.description = data.get('description', project.description)
    if 'technologies' in data:
        project.technologies = ','.join(data['technologies'])
    db.session.commit()
    return jsonify({'message': 'Project updated successfully'})

@app.route('/api/profile/projects/<int:proj_id>', methods=['DELETE'])
@jwt_required()
def delete_project(proj_id):
    current_user = get_jwt_identity()
    project = Project.query.filter_by(id=proj_id, user_id=current_user['id']).first()
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    db.session.delete(project)
    db.session.commit()
    return jsonify({'message': 'Project deleted successfully'})

@app.route('/api/applications/count/today', methods=['GET'])
@jwt_required()
def count_applications_today():
    current_user = get_jwt_identity()
    if not current_user['is_admin']:
        return jsonify({'error': 'Unauthorized'}), 403
    today = date.today()
    count = Application.query.filter(db.func.date(Application.created_at) == today).count()
    return jsonify({'count': count})

@app.route('/api/uploads/count', methods=['GET'])
@jwt_required()
def uploads_count():
    current_user = get_jwt_identity()
    if not current_user['is_admin']:
        return jsonify({'error': 'Unauthorized'}), 403
    uploads_dir = app.config['UPLOAD_FOLDER']
    try:
        files = [f for f in os.listdir(uploads_dir) if os.path.isfile(os.path.join(uploads_dir, f))]
        return jsonify({'count': len(files)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Run the app on port 5000
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
    print("Running on port 5000")