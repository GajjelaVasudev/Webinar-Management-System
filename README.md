# Webinar Management System - Refactored

A professional Django REST Framework + React application with **clean architecture**.

## 🎯 What's New

This project has been **refactored** from a monolithic single-app structure to a clean, modular architecture following Django best practices.

### Architecture: Before vs After

**Before:** All functionality in one `events` app  
**After:** 5 focused apps with clear separation of concerns

## 🏗️ Apps

| App | Purpose | Endpoints |
|-----|---------|-----------|
| **accounts** | User authentication & profiles | `/api/accounts/` |
| **webinars** | Event/webinar management | `/api/webinars/` |
| **registrations** | User registrations | `/api/registrations/` |
| **recordings** | Webinar recordings | `/api/recordings/` |
| **communications** | Announcements, notifications, chat | `/api/communications/` |

## 🚀 Quick Start

```powershell
# 1. Apply migrations
python manage.py migrate

# 2. Create admin user
python manage.py createsuperuser

# 3. Start backend (Port 8000)
python manage.py runserver

# 4. Start frontend (Port 5173)
cd frontend
npm run dev
```

## 📡 API Endpoints

All endpoints now use `/api/` prefix:

- `POST /api/accounts/auth/login/` - Login
- `POST /api/accounts/auth/register/` - Register
- `GET /api/webinars/` - List webinars
- `POST /api/registrations/register/` - Register for webinar
- `GET /api/recordings/` - List recordings
- `GET /api/communications/announcements/` - Announcements

See [API_REFERENCE.md](docs/API_REFERENCE.md) for complete documentation.

## 📚 Documentation

- **[QUICKSTART_REFACTORED.md](QUICKSTART_REFACTORED.md)** - Get started in 3 steps
- **[REFACTORING_GUIDE.md](REFACTORING_GUIDE.md)** - Complete migration guide
- **[REFACTORING_COMPLETE.md](REFACTORING_COMPLETE.md)** - What changed & why
- **[PROJECT_README.md](PROJECT_README.md)** - Detailed project overview
- **[docs/](docs/)** - All other documentation

## 🛠️ Tech Stack

- **Backend:** Django 6.0, Django REST Framework, JWT Auth
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Database:** SQLite (dev) / PostgreSQL (prod)

## ✨ Features

**For Users:**
- Browse & register for webinars
- Access recordings
- Participate in live chat
- Receive notifications

**For Admins:**
- Create & manage webinars
- Upload recordings
- Send announcements
- View analytics

## 🔐 Authentication

JWT-based authentication with:
- Login via username or email
- Access token (1 hour)
- Refresh token (7 days)
- Role-based permissions (admin/user)

## 📁 Project Structure

```
PFSD-PROJECT/
├── webinar_system/      # Django config
├── accounts/            # Authentication
├── webinars/            # Events
├── registrations/       # Sign-ups
├── recordings/          # Videos
├── communications/      # Messaging
├── frontend/            # React app
├── docs/                # Documentation
└── tests/               # Tests
```

## ⚙️ Environment Setup

Create `.env` file (use `.env.example` as template):

```env
SECRET_KEY=your-secret-key
DEBUG=True
USE_POSTGRESQL=False
```

## 🧪 Testing

```powershell
# Backend tests
python manage.py test

# Frontend tests
cd frontend
npm test

# Verify refactoring
python verify_refactoring.py
```

## 📦 Deployment

See [docs/DEPLOYMENT_STEP1_COMPLETE.md](docs/DEPLOYMENT_STEP1_COMPLETE.md) for deployment instructions.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes following the modular architecture
4. Submit pull request

## 📄 License

MIT License

## 🆘 Support

- Check documentation in `docs/` folder
- Run verification: `python verify_refactoring.py`
- Review Django logs: `python manage.py runserver --verbosity 3`

---

**Version 2.0.0** - Refactored with clean architecture  
Built with ❤️ using Django & React
