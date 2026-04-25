# DataLogger Manager - Setup Script for PowerShell
# This script helps set up Firebase credentials and seed the database

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DataLogger Manager - Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if serviceAccountKey.json exists
if (Test-Path "serviceAccountKey.json") {
    Write-Host "[✓] serviceAccountKey.json found" -ForegroundColor Green
    Write-Host ""
    Write-Host "To seed the database, run:" -ForegroundColor Yellow
    Write-Host "  npm run seed" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 0
}

# Service account not found
Write-Host "[✗] serviceAccountKey.json not found!" -ForegroundColor Red
Write-Host ""
Write-Host "To proceed with seeding, you need Firebase credentials." -ForegroundColor Yellow
Write-Host ""

Write-Host "Option 1: Manual Setup (Recommended)" -ForegroundColor Green
Write-Host "  1. Go to Firebase Console: https://console.firebase.google.com/"
Write-Host "  2. Select your project"
Write-Host "  3. Go to Project Settings (⚙️) → Service Accounts"
Write-Host "  4. Click 'Generate New Private Key'"
Write-Host "  5. Save the JSON file as 'serviceAccountKey.json' in this directory"
Write-Host "  6. Re-run this script"
Write-Host ""

Write-Host "Option 2: Set Environment Variable" -ForegroundColor Green
Write-Host "  Run in PowerShell:"
Write-Host "  `$env:GOOGLE_APPLICATION_CREDENTIALS='C:\path\to\serviceAccountKey.json'" -ForegroundColor Cyan
Write-Host "  Then run: npm run seed" -ForegroundColor Cyan
Write-Host ""

Write-Host "Option 3: Use Firebase Emulator" -ForegroundColor Green
Write-Host "  Terminal 1:"
Write-Host "    firebase emulators:start --only firestore" -ForegroundColor Cyan
Write-Host "  Terminal 2:"
Write-Host "    npm run seed" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit"
exit 1

