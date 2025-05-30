# Deployment Checklist for Render.com

Use this checklist to ensure your Job Portal application is ready for deployment:

## Backend Preparation

- [ ] All dependencies are listed in requirements.txt
- [ ] CORS is configured to allow requests from the frontend domain
- [ ] Environment variables are properly handled with defaults
- [ ] Database connection is configured for both development and production
- [ ] File upload handling is properly configured
- [ ] wsgi.py file is present and correctly imports the app

## Frontend Preparation

- [ ] API URL is configured to use environment variables
- [ ] Build process is working (run `npm run build` locally to test)
- [ ] All dependencies are listed in package.json
- [ ] Environment variables are documented in .env.example

## Render.com Configuration

- [ ] render.yaml file is present and correctly configured
- [ ] Environment variables are set up in render.yaml or manually in the Render dashboard
- [ ] Build and start commands are correct
- [ ] Root directories are specified if needed

## Final Checks

- [ ] Git repository is up to date with all changes
- [ ] Test the application locally before deploying
- [ ] Documentation is updated with deployment instructions
- [ ] Sensitive information is not hardcoded in the codebase

## Post-Deployment

- [ ] Verify the backend API is accessible
- [ ] Verify the frontend is accessible
- [ ] Test user registration and login
- [ ] Test job listing and application features
- [ ] Test admin features
- [ ] Monitor logs for any errors