# 🌱 Firestore Database Seeding - Quick Reference

## TL;DR - Fast Setup

### Step 1: Get Your Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project → ⚙️ Project Settings → **Service Accounts**
3. Click **"Generate New Private Key"**
4. Save the file as **`serviceAccountKey.json`** in the project root (same directory as this file)

### Step 2: Run the Seed Script

```powershell
npm run seed
```

### Done! ✅

Your Firestore database is now populated with sample data.

---

## 📋 Complete Guide

See detailed guides:
- **SEEDING_GUIDE.md** - Complete setup and testing guide
- **SEEDING_SETUP.md** - Advanced configuration options

---

## ✨ What Gets Seeded

- **6 Users** - Different roles and permissions
- **8 Dataloggers** - Various types and statuses  
- **7 Usages** - Real-world usage scenarios
- **10 Audit Logs** - Complete traceability

**Total: 31+ documents**

---

## 🧪 Sample Login Data

After creating users in Firebase Auth, use these emails to login:

- `admin@datalogger.com` (Admin role)
- `quality@datalogger.com` (Quality Manager)
- `operator1@datalogger.com` (Operator)
- `operator2@datalogger.com` (Operator)
- `calibration@datalogger.com` (Technician)

> Set passwords via [Firebase Console](https://console.firebase.google.com/) → Authentication → Users

---

## ⚠️ Troubleshooting

### "Firebase Admin SDK could not be initialized"

**Solution:** Make sure you have **ONE** of these:

1. **serviceAccountKey.json** in project root, OR
2. **GOOGLE_APPLICATION_CREDENTIALS** environment variable set:
   ```powershell
   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccountKey.json"
   ```

### "Error seeding Firestore"

Check:
- ✅ Internet connection
- ✅ Firebase credentials are valid
- ✅ Firestore is accessible in Firebase Console
- ✅ Service account has write permissions to Firestore

---

## 🔄 Need to Reset?

Delete all seeded data:

```powershell
# Delete all collections
firebase firestore:delete --all-collections --project your-project-id
```

Then seed again: `npm run seed`

---

## 📁 Related Files

- `seed.js` - Main seeding script
- `SEEDING_GUIDE.md` - Detailed guide with examples
- `SEEDING_SETUP.md` - Configuration options
- `.env.example` - Environment variable template
- `setup.ps1` / `setup.bat` - Helper scripts

---

## 🚀 Next Steps

1. ✅ Run seeding: `npm run seed`
2. ✅ Start app: `npm run dev`
3. ✅ Log in with sample credentials
4. ✅ Explore with sample data

---

**Questions?** Check SEEDING_GUIDE.md or Firebase documentation.

