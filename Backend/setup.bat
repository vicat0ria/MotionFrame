@echo off
echo Checking for Node.js installation...

REM Check if Node.js is installed
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed. Please install it from https://nodejs.org/
    exit /b 1
)

echo Node.js is installed. Proceeding with setup...

REM Navigate to backend directory (ensure it's run from the right place)
cd /d "%~dp0"

REM Ensure a clean install (Optional: Uncomment to force reinstallation)
REM echo Removing existing dependencies...
REM rmdir /s /q node_modules
REM del package-lock.json

echo Installing dependencies...
npm install

echo Compiling TypeScript...
npx tsc

echo Setup complete! Run "npm run dev" to start the backend.
pause
