# Job Portal Database and CORS Issues Fix

This document provides solutions for the database and CORS issues in the Job Portal application.

## Issues Fixed

1. **Database Connection Issues**: Fixed issues with the SQLite database connection.
2. **CORS Policy Errors**: Updated the CORS configuration to properly handle cross-origin requests.
3. **API Error Handling**: Improved error handling in API endpoints, particularly for the `/api/jobs` endpoint.

## How to Fix the Issues

### 1. Database Fixes

We've created a database repair script that:
- Checks if the database file exists
- Verifies all required tables are present
- Ensures the admin user exists
- Creates sample data if needed

To run the database repair script:

```
cd backend
python fix_database.py
```

### 2. CORS Configuration

We've updated the CORS configuration in `app.py` to:
- Properly expose headers
- Add CORS headers to all responses
- Handle OPTIONS requests correctly

The key changes include:

```python
# Enable CORS with specific configuration
CORS(app, supports_credentials=True, resources={
    r"/*": {
        "origins": ["https://job-portal-frontend.onrender.com", "http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
}, expose_headers=["Content-Type", "Authorization"])

# Add CORS headers to all responses
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    return response
```

### 3. API Error Handling

We've improved error handling in the `/api/jobs` endpoint to:
- Safely parse job tags
- Handle exceptions gracefully
- Return appropriate error codes
- Add detailed logging

## How to Restart the Backend

We've created a batch file to restart the backend server with the updated configuration:

```
restart_backend.bat
```

This will:
1. Stop any running Python processes
2. Start the backend server with the updated configuration

## Testing the Fixes

1. **Test Database Connection**:
   ```
   cd backend
   python test_db.py
   ```

2. **Test CORS Configuration**:
   - Open your browser to http://localhost:3000
   - Check the browser console for CORS errors
   - If you see CORS errors, try running the CORS test endpoint:
     ```
     http://localhost:5000/cors-test
     ```

3. **Test API Endpoints**:
   - Jobs API: http://localhost:5000/api/jobs
   - Profile API: http://localhost:5000/api/profile (requires authentication)

## Troubleshooting

If you still encounter issues:

1. **Database Issues**:
   - Delete the `jobportal.db` file and run `fix_database.py` to recreate it
   - Check file permissions on the database file
   - Ensure SQLite is properly installed

2. **CORS Issues**:
   - Check that both frontend and backend servers are running
   - Verify the frontend is running on http://localhost:3000
   - Check browser console for specific CORS error messages

3. **API Errors**:
   - Check the backend console for error messages
   - Verify JWT tokens for authenticated endpoints
   - Test with a tool like Postman to isolate frontend/backend issues