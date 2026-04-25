# 🌱 Firestore Seeding - Quick Start Card

## 30-Second Setup

### 1️⃣ Get Credentials (2 min)
```
Firebase Console → Project Settings → Service Accounts → 
Generate New Private Key → Save as serviceAccountKey.json
```

### 2️⃣ Validate Setup (5 sec)
```powershell
npm run check-seed
```

### 3️⃣ Seed Database (10 sec)
```powershell
npm run seed
```

### ✅ Done!

---

## What You Get

| Item | Count | Includes |
|------|-------|----------|
| Users | 6 | Admin, Quality, Operators, Technician |
| Dataloggers | 8 | ATEX, NON_ATEX, various statuses |
| Usages | 7 | Real-world scenarios |
| Audit Logs | 10 | Complete traceability |

---

## 🐛 If It Doesn't Work

**Error:** "Firebase Admin SDK could not be initialized"
```
Solution: Place serviceAccountKey.json in project root
```

**Error:** "Cannot connect"
```
Solution: Check Firebase credentials are valid
```

**Need Help?**
```
Read: FIRESTORE_SEEDING_COMPLETE_GUIDE.md
```

---

## Commands Reference

| Command | What It Does |
|---------|-------------|
| `npm run check-seed` | Validate setup (run this first!) |
| `npm run seed` | Populate Firestore |
| `npm run dev` | Start the app |

---

## Sample Login (After Setup)

**Email:** `admin@datalogger.com`  
**Password:** Set in Firebase Console → Authentication

---

## Next: Set Passwords

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Go to **Authentication** → **Users**
3. For each user, click ⋮ → **Reset Password**
4. Set a temporary password
5. Users can log in and change it

---

## Start the App

```powershell
npm run dev
```

Visit: `http://localhost:5173`

---

## 📖 Full Documentation

- **Complete Guide:** `FIRESTORE_SEEDING_COMPLETE_GUIDE.md`
- **Quick Ref:** `SEEDING_README.md`
- **Setup Details:** `SEEDING_GUIDE.md`

---

**You're all set! Happy seeding! 🌱**

