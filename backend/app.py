from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import timedelta, date, datetime
import pymysql
import json

# Initialize Flask app
app = Flask(__name__)

# Enable CORS
CORS(app, supports_credentials=True, resources={
    r"/*": {
        "origins": [
            "http://localhost:3000",
            "https://job-portal-3e7h.vercel.app"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})


# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///jobportal.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
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
    return jsonify({
        'message': 'Job Portal API is running',
        'status': 'OK',
        'version': '1.0.0'
    })
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
        if data['email'] == 'srikanthveera160@gmail.com' and data['password'] == 'Srikanth@123':
            print("Admin login attempt")
            user = User.query.filter_by(email='srikanthveera160@gmail.com').first()
            # If user does not exist, create admin user
            if not user:
                print("Creating admin user")
                hashed_password = generate_password_hash('Srikanth@123')
                user = User(email='srikanthveera160@gmail.com', password=hashed_password, is_admin=True, full_name='Srikanth Veera', role='Super Admin')
                db.session.add(user)
                db.session.commit()
            # Ensure is_admin is True and role is set
            if not user.is_admin or user.role != 'Super Admin':
                user.is_admin = True
                user.role = 'Super Admin'
                db.session.commit()
            access_token = create_access_token(identity={'id': user.id, 'is_admin': True})
            return jsonify({
                'access_token': access_token,
                'is_admin': True
            }), 200

        # For all other users, do NOT allow admin login
        print(f"Regular user login attempt for email: {data['email']}")
        user = User.query.filter_by(email=data['email']).first()
        if user and check_password_hash(user.password, data['password']):
            # Force is_admin to False for all except the admin email
            access_token = create_access_token(identity={
                'id': user.id,
                'is_admin': False,
                'role': 'user'
            })
            return jsonify({
                'access_token': access_token,
                'is_admin': False
            }), 200

        print("Invalid credentials")
        return jsonify({'error': 'Wrong email or password'}), 401
    except Exception as e:
        print(f"Exception in login: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    try:
        jobs = Job.query.all()
        return jsonify({'jobs': [{
            'id': job.id,
            'company': job.company,
            'title': job.title,
            'description': job.description,
            'location': job.location,
            'salary': job.salary,
            'tags': json.loads(job.tags) if job.tags else [],
            'date_posted': job.date_posted.strftime('%d %b, %Y') if job.date_posted else None,
            'admin_id': job.admin_id
        } for job in jobs]}), 200
    except Exception as e:
        print(f"Error in get_jobs: {str(e)}")
        return jsonify({'jobs': [], 'error': str(e)}), 200

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

@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user = get_jwt_identity()
    user = User.query.get(current_user['id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({
        'id': user.id,
        'email': user.email,
        'full_name': user.full_name,
        'phone': user.phone,
        'location': user.location,
        'is_admin': user.is_admin,
        'role': user.role,
        'resume_headline': user.resume_headline
    })

@app.route('/api/profile', methods=['PUT'])
@jwt_required()
def update_profile():
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
    return jsonify({'message': 'Profile updated successfully'})

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


if __name__ == '__main__':
    port = os.environ.get('PORT', 10000)
    app.run(host='0.0.0.0', port=int(port), debug=False)