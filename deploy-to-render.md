# Deploying to Render.com

Follow these steps to deploy your Job Portal application to Render.com:

## 1. Prepare Your Repository

Make sure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket).

## 2. Sign Up for Render.com

If you don't have an account, sign up at [Render.com](https://render.com/).

## 3. Deploy Using Blueprint

The easiest way to deploy is using the Render Blueprint (render.yaml):

1. Log in to your Render dashboard
2. Click "New" and select "Blueprint"
3. Connect your Git repository
4. Render will automatically detect the render.yaml file and set up both services
5. Review the configuration and click "Apply"

## 4. Manual Deployment (Alternative)

If you prefer to deploy manually:

### Backend Deployment

1. In your Render dashboard, click "New" and select "Web Service"
2. Connect your Git repository
3. Configure the service:
   - **Name**: job-portal-backend
   - **Environment**: Python
   - **Region**: Choose the region closest to your users
   - **Branch**: main (or your default branch)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn wsgi:app`
   - **Plan**: Free (or select a paid plan for production)
   - **Root Directory**: `backend` (important!)

4. Add the following environment variables:
   - `SECRET_KEY`: Generate a secure random string
   - `JWT_SECRET_KEY`: Generate a secure random string
   - `UPLOAD_FOLDER`: `uploads`

5. Click "Create Web Service"

### Frontend Deployment

1. In your Render dashboard, click "New" and select "Static Site"
2. Connect your Git repository
3. Configure the service:
   - **Name**: job-portal-frontend
   - **Branch**: main (or your default branch)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Root Directory**: `frontend` (important!)
   - **Environment Variables**:
     - `REACT_APP_API_URL`: Your backend URL (e.g., https://job-portal-backend.onrender.com)

4. Click "Create Static Site"

## 5. Database Considerations

For a production deployment, consider:

1. Using a PostgreSQL database:
   - Create a PostgreSQL database in Render.com
   - Update your `DATABASE_URL` environment variable
   - The required PostgreSQL package is already in requirements.txt

## 6. Verify Deployment

1. Wait for both services to deploy (this may take a few minutes)
2. Test your backend API by visiting your backend URL
3. Test your frontend by visiting your frontend URL
4. Test the login functionality and other features

## Troubleshooting

- Check Render logs for any deployment errors
- Ensure environment variables are correctly set
- Verify CORS configuration if you encounter cross-origin issues