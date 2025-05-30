# Job Portal Application

A full-stack job portal application with user and admin interfaces, job listings, applications, and profile management.

## Features

- User registration and authentication
- Job listings and search
- Job application submission with resume upload
- User profile management
- Admin dashboard for job and application management
- Company management

## Tech Stack

- **Backend**: Flask, SQLAlchemy, JWT Authentication
- **Frontend**: React, Material-UI, Tailwind CSS
- **Database**: SQLite (development), PostgreSQL (production option)

## Deployment on Render.com

This project is configured for easy deployment on Render.com. Follow these steps:

1. Fork or clone this repository to your GitHub account
2. Sign up for a Render.com account
3. Connect your GitHub repository to Render
4. Deploy using the Blueprint (render.yaml)

For detailed deployment instructions, see [render-deployment-guide.md](./render-deployment-guide.md).

## Local Development

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The backend will run on http://localhost:5000

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will run on http://localhost:3000

## Environment Variables

### Backend

- `SECRET_KEY`: Flask secret key
- `JWT_SECRET_KEY`: JWT token secret key
- `DATABASE_URL`: Database connection string (defaults to SQLite)
- `UPLOAD_FOLDER`: Directory for file uploads

### Frontend

- `REACT_APP_API_URL`: Backend API URL

## License

MIT