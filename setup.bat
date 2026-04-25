@echo off
REM DataLogger Manager - Setup Script for Windows
REM This script helps set up Firebase credentials and seed the database

setlocal enabledelayedexpansion

echo.
echo ========================================
echo DataLogger Manager - Setup Script
echo ========================================
echo.

REM Check if serviceAccountKey.json exists
if exist "serviceAccountKey.json" (
    echo [INFO] serviceAccountKey.json found in current directory
    echo.
    echo To seed the database, run:
    echo   npm run seed
    echo.
    pause
    exit /b 0
)

echo [WARNING] serviceAccountKey.json not found!
echo.
echo To proceed with seeding, you need Firebase credentials.
echo.
echo Option 1: Manual Setup (Recommended)
echo   1. Go to Firebase Console: https://console.firebase.google.com/
echo   2. Select your project
echo   3. Go to Project Settings (gear icon) ^> Service Accounts
echo   4. Click "Generate New Private Key"
echo   5. Save the JSON file as "serviceAccountKey.json" in this directory
echo   6. Re-run this script
echo.
echo Option 2: Set Environment Variable
echo   Run this command in PowerShell:
echo   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccountKey.json"
echo   Then run: npm run seed
echo.
echo Option 3: Use Firebase Emulator
echo   Run: firebase emulators:start --only firestore
echo   Then in another terminal: npm run seed
echo.
pause

