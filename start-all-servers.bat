@echo off
echo ==========================================
echo   MU-21 SHOWBOOK - Starting All Servers
echo ==========================================
echo.

:: Start Showbook Server (port 8080)
echo Starting Showbook Server...
start "Showbook Server" cmd /k "cd /d %~dp0showbook-server && npm start"

:: Wait a moment
timeout /t 2 /nobreak > nul

:: Start Kaleido Bridge (port 3001)
echo Starting Kaleido Bridge...
start "Kaleido Bridge" cmd /k "cd /d %~dp0kaleido-bridge && npm start"

:: Wait a moment
timeout /t 1 /nobreak > nul

:: Start Tallyman Bridge (port 3002)
echo Starting Tallyman Bridge...
start "Tallyman Bridge" cmd /k "cd /d %~dp0tallyman-bridge && npm start"

:: Wait a moment
timeout /t 1 /nobreak > nul

:: Start NV9000 Bridge (port 3003)
echo Starting NV9000 Bridge...
start "NV9000 Bridge" cmd /k "cd /d %~dp0nv9000-bridge && npm start"

echo.
echo ==========================================
echo   All servers starting...
echo.
echo   Showbook:  http://localhost:8080
echo   Kaleido:   http://localhost:3001
echo   Tallyman:  http://localhost:3002
echo   NV9000:    http://localhost:3003
echo ==========================================
echo.
echo Press any key to close this window...
pause > nul
