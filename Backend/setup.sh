#!/bin/bash

echo "Setting up MotionFrame Backend (Mac/Linux)..."

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "Error: Node.js is not installed. Please install it from https://nodejs.org/"
    exit 1
fi

# Navigate to backend directory
cd "$(dirname "$0")"

echo "Removing old dependencies (if needed)..."
rm -rf node_modules package-lock.json

echo "Installing dependencies..."
npm install --include=dev  # Ensures devDependencies are installed

echo "Compiling TypeScript..."
npx tsc

echo "Setup complete. Run 'npm run dev' to start the backend."
