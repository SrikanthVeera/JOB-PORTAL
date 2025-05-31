@echo off
echo Testing and fixing imports...

cd backend
python test_imports.py

echo.
echo If any imports failed, you can install the missing packages with:
echo pip install flask flask-jwt-extended flask-sqlalchemy flask-cors werkzeug

echo.
echo Press any key to exit...
pause > nul