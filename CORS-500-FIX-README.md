# CORS and 500 Internal Server Error Fix

This document provides solutions for CORS policy issues and 500 Internal Server Error in the Job Portal application.

## Issues Fixed

1. **CORS Policy Errors**: 
   - "Access to XMLHttpRequest has been blocked by CORS policy"
   - "The value of the 'Access-Control-Allow-Credentials' header in the response is '' which must be 'true'"

2. **500 Internal Server Error**: 
   - Server errors when accessing `/api/jobs` endpoint
   - Error handling issues in API endpoints

## How to Fix the Issues

### Quick Fix

Run the provided batch file to automatically fix CORS issues and restart the backend server:

```
fix-cors-and-restart.bat
```

### Manual Fixes

If the batch file doesn't work, you can apply these fixes manually:

#### 1. CORS Configuration

Update the CORS configuration in `backend/app.py`:

```python
# Enable CORS for all routes
CORS(app, 
     origins=["https://job-portal-frontend.onrender.com", "http://localhost:3000"],
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     expose_headers=["Content-Type", "Authorization"])

# Add CORS headers to all responses
@app.after_request
def add_cors_headers(response):
    # Only add headers if it's not an OPTIONS preflight request that already has CORS headers
    if request.method != 'OPTIONS' or 'Access-Control-Allow-Origin' not in response.headers:
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    return response
```

#### 2. OPTIONS Request Handling

Add OPTIONS request handling to API endpoints:

```python
@app.route('/api/profile', methods=['GET', 'OPTIONS'])
def get_profile():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        return response
    
    # Rest of the function...
```

#### 3. Error Handling in API Endpoints

Improve error handling in API endpoints:

```python
try:
    # API logic here...
    response = jsonify({'data': data})
    return response
except Exception as e:
    print(f"Error: {str(e)}")
    return jsonify({'error': str(e)}), 500
```

## Frontend Configuration

Make sure the frontend API client is configured correctly:

```javascript
const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true  // This is important for CORS with credentials
});
```

## Common CORS Issues and Solutions

1. **Missing Access-Control-Allow-Credentials header**:
   - Make sure the server sets `Access-Control-Allow-Credentials: true`
   - Make sure the frontend sets `withCredentials: true`

2. **Preflight OPTIONS requests failing**:
   - Add explicit handling for OPTIONS requests in your API endpoints
   - Return appropriate CORS headers for OPTIONS requests

3. **Origin not allowed**:
   - Make sure the server's `Access-Control-Allow-Origin` header includes the frontend origin
   - For development, this is typically `http://localhost:3000`

## Troubleshooting

If you still encounter CORS issues:

1. **Check the browser console** for specific error messages
2. **Verify server logs** for any errors during preflight requests
3. **Test with a CORS debugging tool** like the browser extension "CORS Unblock"
4. **Clear browser cache and cookies**
5. **Restart both frontend and backend servers**

## Testing the Fix

1. Run the backend server:
   ```
   cd backend
   python app.py
   ```

2. Run the frontend server:
   ```
   cd frontend
   npm start
   ```

3. Open the browser and navigate to `http://localhost:3000`
4. Check the browser console for any CORS errors
5. Try accessing protected endpoints like `/api/profile`