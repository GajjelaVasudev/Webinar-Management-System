# 🚀 Quick Start - Refactored Django Project

## Welcome! Your project has been refactored to clean architecture.

### What Changed?
✅ Monolithic app split into 5 focused modules  
✅ Clean URL structure (`/api/` prefix)  
✅ Organized documentation (`docs/` folder)  
✅ Organized tests (`tests/` folder)  
✅ Industry-standard Django structure  

---

## 🏃 Get Started in 3 Steps

### Step 1: Apply Migrations
```powershell
python manage.py migrate
```

### Step 2: Create Admin User
```powershell
python manage.py createsuperuser
```

### Step 3: Start the Server
```powershell
python manage.py runserver
```

**Backend will run at:** `http://localhost:8000`  
**Admin panel:** `http://localhost:8000/admin`

---

## ⚛️ Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```

**Frontend will run at:** `http://localhost:5173`

---

## 🔑 Important API Changes

### Old Structure ❌
```
/events/
/register/
/recordings/
```

### New Structure ✅
```
/api/webinars/
/api/accounts/auth/register/
/api/recordings/
```

---

## 📱 Update Your Frontend

Search and replace in your frontend code:

**Authentication:**
- `/login/` → `/api/accounts/auth/login/`
- `/register/` → `/api/accounts/auth/register/`

**Webinars:**
- `/events/` → `/api/webinars/`

**Other endpoints:**
- Add `/api/` prefix to all endpoints

---

## 🧪 Test the Setup

1. **Check if backend works:**
   ```powershell
   python manage.py check
   ```

2. **Verify structure:**
   ```powershell
   python verify_refactoring.py
   ```

3. **Access admin panel:**
   - Go to `http://localhost:8000/admin`
   - Login with superuser credentials
   - You should see: Accounts, Webinars, Registrations, Recordings, Communications

4. **Test API:**
   ```powershell
   # Get webinars list
   curl http://localhost:8000/api/webinars/
   ```

---

## 📁 New Project Structure

```
PFSD-PROJECT/
├── 🔧 webinar_system/       # Project config
├── 👤 accounts/             # Users & auth
├── 🎥 webinars/             # Events
├── 📝 registrations/        # Sign-ups
├── 🎬 recordings/           # Videos
├── 💬 communications/       # Announcements & chat
├── ⚛️  frontend/            # React app
├── 📚 docs/                 # Documentation
└── 🧪 tests/                # Tests
```

---

##常見問題 Troubleshooting

### ❓ "No module named 'accounts'"
**Fix:** Make sure all apps are in `INSTALLED_APPS` in settings.py

### ❓ Frontend gets 404 errors
**Fix:** Update all API endpoints to include `/api/` prefix

### ❓ Migration errors
**Fix:** For fresh start:
```powershell
Remove-Item db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

### ❓ CORS errors
**Fix:** Check `CORS_ALLOWED_ORIGINS` in settings.py includes your frontend URL

---

## 📚 Documentation

- **Full migration guide:** `REFACTORING_GUIDE.md`
- **API reference:** `docs/API_REFERENCE.md`
- **Project overview:** `PROJECT_README.md`
- **Completion report:** `REFACTORING_COMPLETE.md`

---

## ✅ Quick Checklist

Before you start:
- [ ] Python 3.11+ installed
- [ ] Virtual environment activated
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Migrations applied (`python manage.py migrate`)
- [ ] Superuser created
- [ ] Backend running successfully
- [ ] Frontend endpoints updated

---

## 🎯 What's Next?

1. **Test Everything**
   - Create a webinar
   - Register for it
   - Upload a recording
   - Send an announcement

2. **Update Frontend**
   - Update API calls
   - Test authentication flow
   - Verify all features work

3. **Deploy**
   - See `docs/DEPLOYMENT_STEP1_COMPLETE.md`

---

## 🆘 Need Help?

1. Check `REFACTORING_GUIDE.md` for detailed instructions
2. Run `python verify_refactoring.py` to verify setup
3. Check Django logs: `python manage.py runserver --verbosity 3`
4. Review documentation in `docs/` folder

---

**🎉 Your project is now following Django best practices!**

Happy coding! 🚀
