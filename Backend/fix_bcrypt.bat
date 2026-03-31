@echo off
echo Upgrading bcrypt to fix compatibility issue...
python -m pip install --upgrade bcrypt==4.1.2
echo.
echo Done! Now try running the server again.
pause
