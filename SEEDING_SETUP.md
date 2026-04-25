# Firestore Seeding Setup Guide

## Overview
The `seed.js` script populates your Firestore database with sample data for development and testing.

## Prerequisites

### Option 1: Using Firebase Emulator (Recommended for Development)

1. **Start Firebase Emulator Suite:**
   ```powershell
   firebase emulators:start --only firestore
   ```
   This will start the Firestore emulator on `localhost:8080`

2. **In another terminal, run the seed script:**
   ```powershell
   node seed.js
   ```

### Option 2: Using Your Firebase Project

1. **Download Service Account Key:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Project Settings → Service Accounts → Generate New Private Key
   - Save the JSON file as `serviceAccountKey.json` in the project root

2. **Run the seed script:**
   ```powershell
   node seed.js
   ```

### Option 3: Using Environment Variable

1. **Set the environment variable (one-time or in .env):**
   ```powershell
   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccountKey.json"
   ```

2. **Run the seed script:**
   ```powershell
   node seed.js
   ```

## What Gets Seeded

The script seeds the following collections with sample data:

- **users** (6 documents)
  - 1 Admin user
  - 1 Quality Manager
  - 2 Operators
  - 1 Calibration Technician
  - 1 Inactive user (for testing)

- **dataloggers** (8 documents)
  - Mix of ATEX and NON_ATEX types
  - Various measurement types (TEMPERATURE, TEMP_HUMIDITY)
  - Different statuses (AVAILABLE, IN_USE, OUT_OF_SERVICE)

- **usages** (7 documents)
  - Various usage types and locations
  - Both active and completed usages
  - Project references and comments

- **auditLogs** (10 documents)
  - Sample audit trail entries
  - Different action types (CREATE, UPDATE, DELETE)
  - Before/after value comparisons

**Total: 31+ documents**

## Troubleshooting

### "Firebase Admin SDK could not be initialized"
- Ensure you have either:
  - `serviceAccountKey.json` in the project root, OR
  - `GOOGLE_APPLICATION_CREDENTIALS` environment variable set, OR
  - Firebase Emulator running

### "Cannot connect to Firestore"
- If using emulator, ensure `firebase emulators:start --only firestore` is running
- Check your internet connection if using production Firebase

### "Permission denied" errors
- If using production Firebase, ensure your service account has Firestore write permissions
- Check Firestore Security Rules in Firebase Console

## Resetting the Database

To clear the seeded data:

### Option 1: Using Firebase Console
- Go to Firestore → Delete Collection for each collection

### Option 2: Using Firebase CLI
```powershell
firebase firestore:delete --all-collections
```

### Option 3: For Emulator
- Stop the emulator and restart it (data is cleared automatically)

## Next Steps

1. Start your React development server:
   ```powershell
   npm run dev
   ```

2. Log in with one of the sample users:
   - Email: `admin@datalogger.com` (or others in seed.js)
   - Password: Set via Firebase Auth

3. Explore the application with sample data

## Modifying Sample Data

To add more sample data, edit `seed.js` and modify the arrays:
- `sampleUsers`
- `sampleDataloggers`
- `sampleUsages`
- `sampleAuditLogs`

Then run the script again.

