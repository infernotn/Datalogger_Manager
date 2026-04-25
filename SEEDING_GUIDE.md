# 🌱 DataLogger Manager - Firestore Seeding Guide

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Firebase project created
- Firebase CLI installed: `npm install -g firebase-tools`

### Step 1: Get Firebase Credentials

**Option A: Using Service Account Key (Recommended)**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project → Project Settings ⚙️
3. Go to "Service Accounts" tab
4. Click "Generate New Private Key"
5. Save the JSON file as `serviceAccountKey.json` in the project root

**Option B: Using Environment Variable**

```powershell
# Get the path to your serviceAccountKey.json
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\full\path\to\serviceAccountKey.json"
```

### Step 2: Run the Seed Script

```powershell
npm run seed
```

### Expected Output
```
📚 Firestore Seeding Script
============================

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
```

---

## 📊 What Gets Seeded

### Users (6)
| Email | Role | Permissions | Status |
|-------|------|-------------|--------|
| admin@datalogger.com | ADMIN | All | ✅ Active |
| quality@datalogger.com | USER | Manage calibration & usage | ✅ Active |
| operator1@datalogger.com | USER | Assign/close usage | ✅ Active |
| operator2@datalogger.com | USER | Assign/close usage | ✅ Active |
| calibration@datalogger.com | USER | Calibration only | ✅ Active |
| inactive@datalogger.com | USER | View audit | ❌ Inactive |

### Dataloggers (8)
- 4 ATEX devices (Explosive atmospheres compliant)
- 4 NON_ATEX devices
- Mixed measurement types (Temperature, Temp+Humidity)
- Various statuses (AVAILABLE, IN_USE, OUT_OF_SERVICE)

### Usages (7)
- Real-world usage scenarios:
  - Cycle validation
  - Temperature mapping (cartography)
  - Local monitoring
  - Manufacturing/WC validation
  - Product export/shipping
  - Ad-hoc testing
- Both completed and ongoing usages

### Audit Logs (10)
- Complete audit trail examples:
  - User creation
  - Datalogger creation/updates
  - Calibration updates
  - Usage assignment/closure
  - Status changes

---

## 🔑 Sample Login Credentials

After seeding, you can log in with:

| Email | Password | Role | Notes |
|-------|----------|------|-------|
| admin@datalogger.com | (set via Firebase Auth) | ADMIN | Full access |
| quality@datalogger.com | (set via Firebase Auth) | USER | Quality manager |
| operator1@datalogger.com | (set via Firebase Auth) | USER | Operator |

> **Note:** Passwords must be set via Firebase Console → Authentication → Users

---

## 🛠️ Troubleshooting

### ❌ "Firebase Admin SDK could not be initialized"

**Solution:** Ensure one of these is set:
1. `serviceAccountKey.json` exists in project root, OR
2. `GOOGLE_APPLICATION_CREDENTIALS` environment variable is set

**Check if it's set:**
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS
```

### ❌ "Permission denied" errors

**Solution:** 
- Verify your service account has Firestore write permissions
- Check Firebase Console → Firestore → Security Rules

### ❌ "Collection not found" or empty data

**Solution:**
- Ensure you ran the seed script successfully
- Check Firebase Console → Firestore → Data tab to verify collections exist

---

## 🔄 Resetting the Database

### Option 1: Delete via Firebase Console
1. Go to Firebase Console → Firestore
2. For each collection: Click ⋮ → Delete collection

### Option 2: Using Firebase CLI
```powershell
firebase firestore:delete --all-collections --project your-project-id
```

### Option 3: Reset Specific Collection
```powershell
firebase firestore:delete users --project your-project-id
```

---

## ✏️ Customizing Sample Data

To modify the seeded data:

1. Open `seed.js`
2. Edit the arrays:
   - `sampleUsers`
   - `sampleDataloggers`
   - `sampleUsages`
   - `sampleAuditLogs`
3. Save and run `npm run seed` again

**Example: Adding a new user**
```javascript
{
  id: "user_custom_001",
  email: "custom@datalogger.com",
  username: "custom_user",
  role: "USER",
  pinCode: "$2b$10$...", // bcrypt hash
  permissions: ["ASSIGN_USAGE", "CLOSE_USAGE"],
  active: true,
  createdAt: new Date().toISOString(),
}
```

---

## 🧪 Testing with Sample Data

### Test Scenarios

**1. Login & Dashboard**
- Log in as admin
- Verify KPIs load
- Check calibration alerts

**2. Datalogger Management**
- View all dataloggers
- Check status indicators (color-coded)
- Try filtering by type/status

**3. Usage Management**
- Assign a datalogger to usage
- Complete a usage entry
- Verify audit trail

**4. Calibration Tracking**
- View due/overdue items
- Check color-coding (green/orange/red)
- Update calibration date

**5. Audit Trail**
- Filter by action type
- Compare before/after values
- Verify immutability

**6. User Management (Admin Only)**
- Create new user
- Modify permissions
- Activate/deactivate users

---

## 📝 Seeding Script Details

The script (`seed.js`) performs the following:

1. **Initialization**
   - Checks for service account key or env variable
   - Initializes Firebase Admin SDK

2. **Data Seeding**
   - Uses batch writes for efficiency
   - Seeds 4 collections in order
   - Tracks success/failure for each collection

3. **Cleanup**
   - Closes Firebase connection
   - Exits with status code (0 = success, 1 = error)

---

## 🚀 Next Steps

After seeding:

1. **Start the app:**
   ```powershell
   npm run dev
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Fill in your Firebase config

3. **Set user passwords:**
   - Go to Firebase Console → Authentication
   - Set passwords for sample users

4. **Explore the UI:**
   - Try different user roles
   - Test permission restrictions
   - Verify audit trail entries

---

## 📞 Support

For issues:
- Check [Firebase Documentation](https://firebase.google.com/docs)
- Review [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/start)
- Check console errors in DevTools

---

**Happy seeding! 🌱**

