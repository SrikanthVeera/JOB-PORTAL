# Authentication and Profile Access Fix

This document provides solutions for the authentication issues in the Job Portal application, particularly the "Missing Authorization Header" error when accessing the profile endpoint.

## Issues Fixed

1. **Missing Authorization Header Error**: Updated the profile endpoints to provide clear error messages when authentication is missing.
2. **JWT Token Handling**: Improved JWT token validation and error handling.
3. **Authentication Testing**: Added tools to test authentication and profile access.

## How to Fix the Issues

### 1. Authentication Handling

We've updated the profile endpoints to:
- Check for the presence of the Authorization header
- Provide clear error messages when authentication is missing
- Handle token validation errors gracefully

The key changes include:

```python
@app.route('/api/profile', methods=['GET'])
def get_profile():
    # Get the JWT token from the Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        print("No Authorization header found")
        return jsonify({
            'error': 'Authentication required',
            'msg': 'Missing Authorization Header',
            'status': 401,
            'details': 'Please login to access this endpoint'
        }), 401
    
    # Rest of the function...
```

### 2. Debug Endpoint

We've enhanced the debug endpoint to provide more information about authentication:

```
/api/debug-profile
```

This endpoint:
- Shows token information if a token is provided
- Provides information about the admin user
- Includes instructions for authentication
- Works without authentication (for debugging purposes)

### 3. Authentication Test Page

We've created an HTML page to test authentication and profile access:

```
/auth-test
```

This page allows you to:
- Login to get a JWT token
- Test profile access with the token
- View debug information

## How to Test Authentication

1. Run the backend server:
   ```
   cd backend
   python app.py
   ```

2. Open the authentication test page:
   ```
   http://localhost:5000/auth-test
   ```
   
   Or run the provided batch file:
   ```
   test-auth-profile.bat
   ```

3. Follow the instructions on the page:
   - Click "Login" to get a token
   - Click "Get Profile" to test profile access with the token
   - Click "Get Debug Profile" to see detailed debug information

## Common Authentication Issues and Solutions

1. **Missing Authorization Header**:
   - Make sure you're including the Authorization header in your requests
   - The header should be in the format: `Authorization: Bearer <token>`
   - Get a valid token by logging in first

2. **Invalid Token**:
   - Tokens expire after a certain time (30 days in this application)
   - If your token is invalid, log in again to get a new one
   - Check the token format - it should be a JWT token

3. **CORS Issues with Authentication**:
   - Make sure your frontend is sending credentials with requests
   - The backend is configured to allow credentials from localhost:3000

## Frontend Integration

If you're using the React frontend, make sure:

1. The API client includes the Authorization header:
   ```javascript
   api.interceptors.request.use(
     (config) => {
       const token = localStorage.getItem('token');
       if (token) {
         config.headers.Authorization = `Bearer ${token}`;
       }
       return config;
     },
     (error) => Promise.reject(error)
   );
   ```

2. The login function stores the token:
   ```javascript
   const handleLogin = async (credentials) => {
     try {
       const response = await api.post('/api/login', credentials);
       localStorage.setItem('token', response.data.access_token);
       // Rest of the function...
     } catch (error) {
       // Handle error...
     }
   };
   ```

## Troubleshooting

If you still encounter authentication issues:

1. Check the backend console for error messages
2. Use the debug endpoint to get more information: `/api/debug-profile`
3. Try logging in again to get a fresh token
4. Clear your browser's local storage and try again