@echo off
echo Starting Authentication Test...

echo Starting Backend Server on port 5000...
start cmd /k "cd backend && python app.py"

echo Waiting for backend to initialize...
timeout /t 5

echo Opening login test page in browser...
start http://localhost:5000/login-test

echo.
echo Instructions:
echo 1. Use the login test page to test authentication
echo 2. Click "Login" to get a token
echo 3. Click "Test Token" to verify the token is valid
echo 4. Click "Get Profile" to test the profile endpoint
echo 5. Check the console output for any errors