@echo off
echo Starting Job Portal with CORS support...

REM Start the backend server
start cmd /k "cd backend && python app.py"

REM Wait for backend to initialize
timeout /t 5

REM Start the frontend server
start cmd /k "cd frontend && npm start"

echo Both servers are starting. Please wait...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000