@echo off
cd /d "%~dp0"
node tools\run_all.js %*
echo.
pause
