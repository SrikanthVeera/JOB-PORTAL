@echo off
echo Initializing MySQL Database for Job Portal...

REM Set MySQL credentials (modify these as needed)
set /p MYSQL_USER=Enter MySQL username (default: root): 
if "%MYSQL_USER%"=="" set MYSQL_USER=root

set /p MYSQL_PASSWORD=Enter MySQL password: 

set /p MYSQL_HOST=Enter MySQL host (default: localhost): 
if "%MYSQL_HOST%"=="" set MYSQL_HOST=localhost

set /p MYSQL_PORT=Enter MySQL port (default: 3306): 
if "%MYSQL_PORT%"=="" set MYSQL_PORT=3306

set /p MYSQL_DATABASE=Enter MySQL database name (default: jobportal): 
if "%MYSQL_DATABASE%"=="" set MYSQL_DATABASE=jobportal

echo.
echo Using the following MySQL configuration:
echo   User: %MYSQL_USER%
echo   Password: %MYSQL_PASSWORD:~0,1%****
echo   Host: %MYSQL_HOST%
echo   Port: %MYSQL_PORT%
echo   Database: %MYSQL_DATABASE%
echo.

cd backend
python init_mysql.py

echo.
echo If you encountered any errors, please check:
echo 1. MySQL server is running
echo 2. MySQL credentials are correct
echo 3. You have permissions to create databases and tables

echo.
echo Press any key to exit...
pause > nul