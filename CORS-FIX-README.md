# CORS and Server Error Fixes

This document explains the fixes applied to resolve CORS policy issues and internal server errors in the Job Portal application.

## Issues Fixed

1. **CORS Policy Errors**: The backend was not properly configured to allow cross-origin requests from the frontend.
2. **Internal Server Error (500) in Jobs API**: The `/api/jobs` endpoint was failing due to issues with JSON parsing.
3. **Profile API CORS Issues**: The profile endpoint was not handling preflight OPTIONS requests correctly.

## Changes Made

### Backend (app.py)

1. **Enhanced CORS Configuration**:
   - Added `expose_headers` to the CORS configuration
   - Added an `after_request` handler to ensure CORS headers are present on all responses

2. **Fixed Jobs API Error Handling**:
   - Improved error handling in the `/api/jobs` endpoint
   - Added safe parsing of job tags to handle both JSON and comma-separated formats

3. **Profile API CORS Support**:
   - Added a separate route handler for OPTIONS requests to the profile endpoint
   - Improved error handling in the profile endpoint

4. **Added CORS Testing Endpoint**:
   - Added a `/cors-test` endpoint to help diagnose CORS issues

### Frontend (api.js)

1. **Updated Axios Configuration**:
   - Added `withCredentials: true` to enable proper CORS with credentials

## How to Run

Use the provided `start-with-cors.bat` script to start both the frontend and backend servers with the correct configuration:

```
start-with-cors.bat
```

This will:
1. Start the backend server on port 5000
2. Start the frontend server on port 3000
3. Ensure proper CORS configuration between them

## Troubleshooting

If you still encounter CORS issues:

1. Check that both servers are running (backend on port 5000, frontend on port 3000)
2. Test the CORS configuration using the `/cors-test` endpoint: http://localhost:5000/cors-test
3. Check the browser console for specific error messages
4. Ensure you're using the latest version of the code with all fixes applied

## Technical Details

The main CORS configuration is in the backend's app.py file:

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

This ensures that the frontend at http://localhost:3000 can make API calls to the backend at http://localhost:5000.