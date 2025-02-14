@echo off
echo Setting up MotionFrame Backend (Windows)...

REM Check if Node.js is installed
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed. Please install it from https://nodejs.org/
    exit /b 1
)

REM Navigate to backend directory
cd /d "%~dp0"

echo Removing old dependencies (if needed)...
rmdir /s /q node_modules
del package-lock.json

echo Installing dependencies...
npm install --include=dev

echo Compiling TypeScript...
npx tsc

echo Setup complete! Run "npm run dev" to start the backend.
pause
