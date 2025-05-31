# Manual Deployment Guide for Render.com

If the Blueprint deployment doesn't work, you can manually deploy the backend and frontend services:

## 1. Deploy the Backend

1. Log in to your Render.com account
2. Click on "New +" and select "Web Service"
3. Connect your GitHub repository if you haven't already
4. Configure the service:
   - **Name**: job-portal-backend
   - **Environment**: Python
   - **Region**: Choose the region closest to your users
   - **Branch**: master (or your default branch)
   - **Root Directory**: backend
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn wsgi:app`
   - **Plan**: Free (or select a paid plan for production)

5. Add the following environment variables:
   - `SECRET_KEY`: Generate a secure random string (or click "Generate" in Render)
   - `JWT_SECRET_KEY`: Generate a secure random string (or click "Generate" in Render)
   - `UPLOAD_FOLDER`: `uploads`

6. Click "Create Web Service"

## 2. Deploy the Frontend

1. Wait for the backend to deploy and note its URL
2. In your Render dashboard, click on "New +" and select "Static Site"
3. Connect your GitHub repository if you haven't already
4. Configure the service:
   - **Name**: job-portal-frontend
   - **Branch**: master (or your default branch)
   - **Root Directory**: frontend
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Environment Variables**:
     - `REACT_APP_API_URL`: Your backend URL (e.g., https://job-portal-backend.onrender.com)

5. Click "Create Static Site"

## 3. Wait for Deployment

- Both services will take a few minutes to deploy
- You can monitor the deployment progress in the Render dashboard

## 4. Access Your Application

- Once deployment is complete, your application will be available at:
  - Backend: https://job-portal-backend.onrender.com
  - Frontend: https://job-portal-frontend.onrender.com

## 5. Verify Everything Works

- Test user registration and login
- Test job listings and applications
- Test admin features