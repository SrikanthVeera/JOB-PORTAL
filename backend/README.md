# Job Portal Backend

This is the backend API for the Job Portal application.

## Local Development

1. Clone the repository
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Create a `.env` file based on `.env.example`
4. Run the application:
   ```
   python app.py
   ```

## Deployment

### Render.com (Recommended)

1. Sign up for a free account at [render.com](https://render.com/)
2. Click on "New" and select "Web Service"
3. Connect your GitHub repository or upload your code directly
4. Configure your service:
   - Name: job-portal-backend
   - Environment: Python
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`
5. Set up environment variables in the Render dashboard
6. Click "Create Web Service"

### Railway.app

1. Sign up for an account at [railway.app](https://railway.app/)
2. Install the Railway CLI or use their GitHub integration
3. Create a new project and deploy your backend code
4. Set up environment variables in the Railway dashboard

### PythonAnywhere

1. Sign up for a free account at [pythonanywhere.com](https://www.pythonanywhere.com/)
2. Upload your backend code
3. Set up a new web app with Flask
4. Configure your WSGI file to point to your app.py
5. Set up environment variables

## API Endpoints

- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get a specific job
- `POST /api/jobs` - Create a new job (requires admin authentication)
- `PUT /api/jobs/:id` - Update a job (requires admin authentication)
- `DELETE /api/jobs/:id` - Delete a job (requires admin authentication)
- `POST /api/register` - Register a new user
- `POST /api/login` - Login a user
- `GET /api/profile` - Get user profile (requires authentication)
- `PUT /api/profile` - Update user profile (requires authentication)
- `GET /api/my-applications` - Get user's job applications (requires authentication)
- `POST /api/applications` - Apply for a job (requires authentication)
- `DELETE /api/my-applications/:id` - Withdraw a job application (requires authentication)
- `GET /api/companies` - Get all companies
- `POST /api/companies` - Add a new company (requires admin authentication)
- `GET /api/companies/:id` - Get a specific company
- `PUT /api/companies/:id` - Update a company (requires admin authentication)
- `DELETE /api/companies/:id` - Delete a company (requires admin authentication)

## Environment Variables

- `SECRET_KEY` - Flask secret key
- `JWT_SECRET_KEY` - JWT secret key
- `DATABASE_URL` - Database connection string
- `UPLOAD_FOLDER` - Path to upload folder