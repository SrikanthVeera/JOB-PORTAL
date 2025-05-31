@echo off
echo Testing Authentication and Profile Access...

REM Start the browser with the auth-test page
start http://localhost:5000/auth-test

echo.
echo Authentication test page opened in your browser.
echo.
echo Instructions:
echo 1. Click "Login" to get a token
echo 2. Click "Get Profile" to test profile access with the token
echo 3. Click "Get Debug Profile" to see detailed debug information
echo.
echo Press any key to exit...
pause > nul