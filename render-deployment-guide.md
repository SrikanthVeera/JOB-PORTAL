# Render.com Deployment Guide for Job Portal

This guide will walk you through deploying both the backend and frontend of the Job Portal application on Render.com.

## Prerequisites

1. A Render.com account (sign up at https://render.com/)
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Deploy the Backend

1. Log in to your Render.com account
2. Click on "New +" and select "Web Service"
3. Connect your Git repository
4. Configure the service:
   - **Name**: job-portal-backend
   - **Environment**: Python
   - **Region**: Choose the region closest to your users
   - **Branch**: main (or your default branch)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn wsgi:app`
   - **Plan**: Free (or select a paid plan for production)

5. Add the following environment variables:
   - `SECRET_KEY`: Generate a secure random string
   - `JWT_SECRET_KEY`: Generate a secure random string
   - `DATABASE_URL`: Use Render's PostgreSQL or keep the SQLite database for simplicity
   - `UPLOAD_FOLDER`: `uploads`

6. Click "Create Web Service"

## Step 2: Deploy the Frontend

1. In your Render.com dashboard, click on "New +" and select "Static Site"
2. Connect your Git repository
3. Configure the service:
   - **Name**: job-portal-frontend
   - **Branch**: main (or your default branch)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Environment Variables**:
     - `REACT_APP_API_URL`: Your backend URL (e.g., https://job-portal-backend.onrender.com)

4. Click "Create Static Site"

## Step 3: Update Frontend API Configuration

Before deploying, update the `api.js` file in your frontend to use the deployed backend URL:

```javascript
import axios from 'axios';

// Use environment variable for API URL or fallback to local development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
console.log('Using API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
});

// Rest of the file remains the same...
```

## Step 4: Configure CORS in Backend

Make sure your backend allows requests from your frontend domain:

```python
# In app.py, update the CORS configuration
CORS(app, supports_credentials=True, resources={
    r"/*": {
        "origins": ["https://job-portal-frontend.onrender.com", "http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

## Step 5: Database Considerations

For a production deployment, consider:

1. Using a PostgreSQL database instead of SQLite:
   - Create a PostgreSQL database in Render.com
   - Update your `DATABASE_URL` environment variable
   - Install `psycopg2-binary` package (add to requirements.txt)

2. For file uploads:
   - Consider using a cloud storage service like AWS S3 for storing resumes and other files

## Step 6: Verify Deployment

1. Test your backend API by visiting: https://job-portal-backend.onrender.com/
2. Test your frontend by visiting: https://job-portal-frontend.onrender.com/
3. Test the login functionality and other features

## Troubleshooting

- Check Render logs for any deployment errors
- Ensure environment variables are correctly set
- Verify CORS configuration if you encounter cross-origin issues
- Check network requests in browser developer tools for API errors