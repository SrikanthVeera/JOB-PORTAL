@echo off
echo Fixing CORS issues and restarting the backend server...

REM Kill any existing Python processes running the app.py
taskkill /f /im python.exe /t

REM Wait a moment for processes to terminate
timeout /t 2

REM Run the CORS fix script
cd backend
python cors_fix.py

REM Wait for user to read the output
echo.
echo Press any key to restart the backend server...
pause > nul

REM Start the backend server
start python app.py

echo.
echo Backend server restarted with fixed CORS configuration!
echo Server is running at http://localhost:5000
echo.
echo If you still encounter CORS issues:
echo 1. Make sure the frontend is running on http://localhost:3000
echo 2. Check the browser console for specific error messages
echo 3. Try clearing your browser cache and cookies
echo.
echo Press any key to exit...
pause > nul