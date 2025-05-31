@echo off
echo Starting Job Portal with SQLite database...

REM Ensure we're using SQLite
set USE_MYSQL=false

REM Start the backend server
cd backend
start python app.py

REM Wait for backend to initialize
timeout /t 5

REM Start the frontend server
cd ../frontend
start npm start

echo Both servers are starting. Please wait...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000

echo.
echo Press any key to exit...
pause > nul