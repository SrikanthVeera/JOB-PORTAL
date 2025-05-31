@echo off
echo Starting Job Portal with MySQL database...

REM Set MySQL credentials
set /p MYSQL_USER=Enter MySQL username (default: root): 
if "%MYSQL_USER%"=="" set MYSQL_USER=root

set /p MYSQL_PASSWORD=Enter MySQL password: 

set /p MYSQL_HOST=Enter MySQL host (default: localhost): 
if "%MYSQL_HOST%"=="" set MYSQL_HOST=localhost

set /p MYSQL_PORT=Enter MySQL port (default: 3306): 
if "%MYSQL_PORT%"=="" set MYSQL_PORT=3306

set /p MYSQL_DATABASE=Enter MySQL database name (default: jobportal): 
if "%MYSQL_DATABASE%"=="" set MYSQL_DATABASE=jobportal

REM Enable MySQL
set USE_MYSQL=true

echo.
echo Using the following MySQL configuration:
echo   User: %MYSQL_USER%
echo   Password: %MYSQL_PASSWORD:~0,1%****
echo   Host: %MYSQL_HOST%
echo   Port: %MYSQL_PORT%
echo   Database: %MYSQL_DATABASE%
echo.

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