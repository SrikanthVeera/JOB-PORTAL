@echo off
echo Restarting Job Portal Backend...

REM Kill any existing Python processes running the app.py
taskkill /f /im python.exe /t

REM Wait a moment for processes to terminate
timeout /t 2

REM Start the backend server
cd backend
start python app.py

echo Backend server restarted!
echo Server is running at http://localhost:5000
echo Press any key to exit...
pause > nul