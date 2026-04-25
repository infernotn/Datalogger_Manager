# 🚀 DataLogger Manager - Firestore Database Seeding

Complete guide to setting up and using the Firestore database seeding functionality.

---

## 📖 Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Setup Methods](#setup-methods)
4. [Running the Seed](#running-the-seed)
5. [Sample Data](#sample-data)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)
8. [Advanced Options](#advanced-options)

---

## ⚡ Quick Start

### For the Impatient (5 minutes)

1. **Get Firebase credentials:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Project Settings → Service Accounts → Generate New Private Key
   - Save as `serviceAccountKey.json` in project root

2. **Check setup:**
   ```powershell
   npm run check-seed
   ```

3. **Seed database:**
   ```powershell
   npm run seed
   ```

4. **Done!** ✅ Your database is populated with sample data

---

## 📋 Prerequisites

### Required
- ✅ Node.js 18+ installed
- ✅ Firebase project created ([console.firebase.google.com](https://console.firebase.google.com))
- ✅ Firestore enabled in Firebase project
- ✅ npm dependencies installed: `npm install`

### Optional
- 🔧 Firebase CLI: `npm install -g firebase-tools`
- 🐳 Docker (if using Firebase Emulator)

---

## 🔧 Setup Methods

### Method 1: Service Account Key (Recommended) ⭐

**Best for:** Production-like setup, easiest to use

**Steps:**
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Go to your project
3. Click ⚙️ (Project Settings) → **Service Accounts**
4. Click **"Generate New Private Key"**
5. Save the downloaded JSON file as **`serviceAccountKey.json`** in the project root
6. Run: `npm run seed`

**Pros:**
- ✅ Simple and fast
- ✅ Works everywhere
- ✅ No environment variables needed

**Cons:**
- ⚠️ Credentials stored locally (keep it safe!)
- ⚠️ Don't commit to version control

### Method 2: Environment Variable

**Best for:** CI/CD pipelines, shared machines

**Steps:**

**PowerShell:**
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccountKey.json"
npm run seed
```

**Command Prompt:**
```cmd
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\serviceAccountKey.json
npm run seed
```

**Linux/Mac:**
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
npm run seed
```

**Pros:**
- ✅ Keeps credentials out of source code
- ✅ Easy in CI/CD
- ✅ Can be temporary

**Cons:**
- ⚠️ More setup steps
- ⚠️ Need to set before each run

### Method 3: Firebase Emulator

**Best for:** Local development without production access

**Requirements:**
- Java 21+ installed
- Firebase CLI: `npm install -g firebase-tools`

**Steps:**
1. Terminal 1 - Start emulator:
   ```powershell
   firebase emulators:start --only firestore
   ```

2. Terminal 2 - Run seed:
   ```powershell
   npm run seed
   ```

**Pros:**
- ✅ No Firebase project needed
- ✅ Completely local
- ✅ Data auto-resets

**Cons:**
- ⚠️ Java 21+ required (can be complex to install)
- ⚠️ Data lost when emulator stops
- ⚠️ Only for local development

---

## 🌱 Running the Seed

### Pre-flight Check

Before seeding, validate your setup:

```powershell
npm run check-seed
```

**Output:**
```
✅ Passed:  5
❌ Failed:  0
⚠️  Warnings: 0

✨ Everything looks good! Ready to seed.

🌱 To seed the database, run:
   npm run seed
```

### Run Seeding

```powershell
npm run seed
```

### Expected Output

```
📚 Firestore Seeding Script
============================

🔑 Initializing Firebase Admin SDK...

✅ Firebase initialized with service account key

🌱 Starting to seed Firestore...

📝 Seeding users...
   ✅ 6 users seeded

📝 Seeding dataloggers...
   ✅ 8 dataloggers seeded

📝 Seeding usages...
   ✅ 7 usages seeded

📝 Seeding audit logs...
   ✅ 10 audit logs seeded

🎉 Firestore seeding completed successfully!
   Total documents seeded: 31

============================================================
```

---

## 📊 Sample Data

### Collections Seeded

#### 1. Users (6 documents)
| Email | Role | Permissions | Status |
|-------|------|-------------|--------|
| admin@datalogger.com | ADMIN | All permissions | ✅ Active |
| quality@datalogger.com | USER | Calibration, Usage | ✅ Active |
| operator1@datalogger.com | USER | Usage management | ✅ Active |
| operator2@datalogger.com | USER | Usage management | ✅ Active |
| calibration@datalogger.com | USER | Calibration only | ✅ Active |
| inactive@datalogger.com | USER | View audit only | ❌ Inactive |

**Note:** Passwords must be set in Firebase Console → Authentication → Users

#### 2. Dataloggers (8 documents)
- **ATEX Types:** EXX-001, EXX-002, EXX-003, EXX-004 (explosive atmosphere certified)
- **NON_ATEX Types:** EN-001, EN-002, EN-003, EN-004 (standard equipment)
- **Measurement Types:** Temperature, Temperature + Humidity
- **Statuses:** AVAILABLE, IN_USE, OUT_OF_SERVICE
- **Calibration:** 6-12 month periods

#### 3. Usages (7 documents)
Real-world scenarios including:
- Cycle validation
- Temperature mapping (Cartography)
- Local monitoring
- Manufacturing validation
- Export/shipping
- Lab testing

Both active and completed usages with location and project references.

#### 4. Audit Logs (10 documents)
Complete traceability including:
- User creation
- Datalogger CRUD operations
- Calibration updates
- Usage assignment/closure
- Status changes

All with before/after values and timestamps.

### Total Data Summary
```
Users:        6 documents
Dataloggers:  8 documents
Usages:       7 documents
Audit Logs:   10 documents
─────────────────────────
TOTAL:        31 documents
```

---

## 🧪 Testing After Seeding

### Step 1: Verify Data in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database**
4. Check collections: `users`, `dataloggers`, `usages`, `auditLogs`

### Step 2: Set Passwords for Sample Users

1. Go to **Authentication** → **Users**
2. For each user, click ⋮ → Reset password
3. Create passwords for testing

**Suggested passwords:**
- Admin: `Admin@12345`
- Quality: `Quality@12345`
- Operator 1: `Operator@12345`
- Operator 2: `Operator@12345`
- Technician: `Tech@12345`

### Step 3: Start the Application

```powershell
npm run dev
```

Access at: `http://localhost:5173`

### Step 4: Test Features

**As Admin:**
- ✅ Create new users
- ✅ Manage all dataloggers
- ✅ View all audit logs
- ✅ Modify calibrations

**As Quality Manager:**
- ✅ Assign/close usage
- ✅ Update calibrations
- ✅ View dataloggers

**As Operator:**
- ✅ Assign/close usage
- ✅ View basic info

**As Technician:**
- ✅ Update calibrations only

---

## 🐛 Troubleshooting

### Problem: "Firebase Admin SDK could not be initialized"

**Cause:** No credentials found

**Solutions:**
1. Place `serviceAccountKey.json` in project root, OR
2. Set environment variable:
   ```powershell
   $env:GOOGLE_APPLICATION_CREDENTIALS="path/to/key.json"
   ```
3. Start Firebase Emulator:
   ```powershell
   firebase emulators:start --only firestore
   ```

### Problem: "Cannot read properties of undefined (reading 'length')"

**Cause:** Firebase Admin SDK not properly initialized

**Solution:**
- Run `npm run check-seed` to validate setup
- Ensure credentials are valid and accessible
- Try re-downloading serviceAccountKey.json from Firebase Console

### Problem: "Permission denied" errors

**Cause:** Service account lacks Firestore permissions

**Solutions:**
1. Go to Firebase Console → Firestore → Rules
2. Ensure rules allow writes:
   ```
   match /databases/{database}/documents {
     match /{document=**} {
       allow read, write: if request.auth != null;
     }
   }
   ```
3. Or give service account "Editor" role in Google Cloud Console

### Problem: "Collection not found" in app

**Cause:** Data wasn't seeded properly

**Solutions:**
1. Check Firebase Console → Firestore to see collections
2. Re-run seeding: `npm run seed`
3. Check browser console for errors
4. Verify Firestore Security Rules

### Problem: Slow seeding performance

**Cause:** Network latency or database limits

**Solutions:**
- Ensure stable internet connection
- Wait for seeding to complete (takes ~10-30 seconds)
- Check Firebase console for rate limit warnings
- Try again later if hitting quotas

---

## 🔧 Advanced Options

### Customizing Sample Data

Edit `seed.js` and modify arrays:
- `sampleUsers`
- `sampleDataloggers`
- `sampleUsages`
- `sampleAuditLogs`

Example - Adding a new user:
```javascript
{
  id: "user_custom_001",
  email: "custom@example.com",
  username: "custom_user",
  role: "USER",
  pinCode: "$2b$10$...", // bcrypt hash
  permissions: ["ASSIGN_USAGE", "CLOSE_USAGE"],
  active: true,
  createdAt: new Date().toISOString(),
}
```

Then re-run: `npm run seed`

### Batch Operations

The script uses Firestore batch writes for efficiency:
- Batches up to 500 writes per batch
- Atomic operations
- Better performance than individual writes

### Incremental Seeding

To add more data without clearing existing:
1. Edit `seed.js` to add new items with unique IDs
2. Run `npm run seed` again
3. New items will be added alongside existing data

**Warning:** Duplicate IDs will overwrite existing documents

### Deleting Seeded Data

```powershell
# Delete all collections
firebase firestore:delete --all-collections

# Or delete specific collection
firebase firestore:delete users
firebase firestore:delete dataloggers
```

---

## 📞 Getting Help

### Check Documentation
- `SEEDING_README.md` - Quick reference
- `SEEDING_GUIDE.md` - Detailed guide
- `SEEDING_SETUP.md` - Configuration options

### Useful Links
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Reference](https://firebase.google.com/docs/firestore)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/start)

### Common Commands
```powershell
# Check setup
npm run check-seed

# Seed database
npm run seed

# Start app
npm run dev

# Delete all data
firebase firestore:delete --all-collections

# View Firestore rules
firebase firestore:indexes:list
```

---

## ✅ Success Checklist

After seeding, verify:
- [ ] `npm run check-seed` shows no errors
- [ ] `npm run seed` completes successfully
- [ ] Firebase Console shows seeded collections
- [ ] Can log in with sample users
- [ ] Dashboard displays sample data
- [ ] Audit logs show entries
- [ ] Can perform CRUD operations

---

## 📝 Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run check-seed` | Validate setup before seeding |
| `npm run seed` | Populate Firestore with sample data |
| `npm run dev` | Start development app |
| `npm run build` | Build production bundle |
| `firebase firestore:delete --all-collections` | Clear all data |

---

**Last Updated:** April 2026
**Status:** ✅ Ready for Production

