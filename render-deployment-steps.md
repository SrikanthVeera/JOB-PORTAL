# Step-by-Step Guide to Deploy Job Portal on Render.com

## Prerequisites
- Your code is already pushed to GitHub at: https://github.com/SrikanthVeera/JOB-PORTAL.git
- A Render.com account (sign up at https://render.com if you don't have one)

## Deployment Steps

### 1. Sign in to Render.com
- Go to https://render.com
- Sign in with your account or create a new one

### 2. Create a New Blueprint
- From your Render dashboard, click on the "New +" button in the top right
- Select "Blueprint" from the dropdown menu

### 3. Connect Your GitHub Repository
- Click "Connect account" next to GitHub (if not already connected)
- Grant Render access to your repositories
- Search for and select your repository: "SrikanthVeera/JOB-PORTAL"

### 4. Configure Your Blueprint
- Render will automatically detect the `render.yaml` file in the root of your repository
- Review the services that will be created:
  - job-portal-backend (Web Service)
  - job-portal-frontend (Static Site)
- Click "Apply" to create both services

### 5. Wait for Deployment
- Render will now deploy both your backend and frontend
- This process may take a few minutes
- You can monitor the deployment progress in the Render dashboard

### 6. Access Your Deployed Application
- Once deployment is complete, you'll see "Live" status for both services
- Click on the frontend service URL to access your deployed Job Portal application

### 7. Verify Everything Works
- Test user registration and login
- Test job listings and applications
- Test admin features

## Troubleshooting

If you encounter any issues during deployment:

1. **Check Logs**: In the Render dashboard, click on your service and then "Logs" to see what went wrong
2. **Database Issues**: If using SQLite, note that changes won't persist on Render's free tier. Consider upgrading to a paid plan or using PostgreSQL
3. **CORS Issues**: If you see CORS errors, verify that your backend CORS configuration includes your frontend URL
4. **Environment Variables**: Make sure all required environment variables are set in the Render dashboard

## Important Notes

- Your backend API will be available at: https://job-portal-backend.onrender.com
- Your frontend will be available at: https://job-portal-frontend.onrender.com
- The free tier of Render has some limitations:
  - Services on the free plan will spin down after 15 minutes of inactivity
  - The first request after inactivity may take a few seconds to respond
  - SQLite data will not persist between deployments (consider PostgreSQL for production)

## Next Steps

1. Consider adding a custom domain for your application
2. Set up PostgreSQL for persistent data storage
3. Configure automatic deployments for future updates