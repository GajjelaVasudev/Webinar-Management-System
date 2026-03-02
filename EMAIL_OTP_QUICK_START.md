# Email OTP Verification - Quick Start Guide

**Status:** ✅ READY FOR TESTING

---

## ⚡ 5-Minute Setup

### Step 1: Install Dependency

```bash
pip install python-dotenv
pip install -r requirements.txt
```

### Step 2: Configure Email

Add to your `.env` file:

```bash
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password-here
DEFAULT_FROM_EMAIL=your-email@gmail.com
```

**How to get Gmail App Password:**
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Copy the 16-character password
4. Paste into `.env`

### Step 3: Apply Migration

```bash
python manage.py migrate
```

### Step 4: Test It!

```bash
# Start backend
python manage.py runserver

# In another terminal, test signup
curl -X POST http://localhost:8000/accounts/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123",
    "password_confirm": "TestPass123"
  }'
```

Response should be:
```json
{
  "message": "User registered successfully. Please check your email...",
  "email": "test@example.com",
  "username": "testuser"
}
```

---

## 🧪 Quick Test Scenario

### Frontend Test (5 minutes)

1. **Visit signup page**
   ```
   http://localhost:3000/auth?mode=register
   ```

2. **Sign up with test credentials**
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `TestPass123`
   - Click "Create Account"

3. **Should redirect to verification page**
   - URL: `http://localhost:3000/verify-email`
   - Should show: "test@example.com"

4. **Get OTP from email or console**
   - Check inbox (wait 5 seconds)
   - Or check Django console output for OTP

5. **Enter OTP**
   - Example: `123456`
   - Click "Verify Email"

6. **Success!**
   - Should show checkmark
   - Should redirect to login page

7. **Log in**
   - Username: `testuser`
   - Password: `TestPass123`
   - Should work now!

---

## 🔍 Backend Test (5 minutes)

### Test Successful Flow

```bash
# 1. Sign up
POST /accounts/auth/register/
{
  "username": "john",
  "email": "john@example.com",
  "password": "SecurePass123",
  "password_confirm": "SecurePass123"
}

# Response: 201 Created (user created, inactive)

# 2. Get OTP (from email or console log)
# Example: 123456

# 3. Verify email
POST /accounts/auth/verify-email/
{
  "email": "john@example.com",
  "otp": "123456"
}

# Response: 200 OK with "Email verified successfully"

# 4. Log in
POST /accounts/auth/login/
{
  "username": "john",
  "password": "SecurePass123"
}

# Response: 200 OK with access_token
```

### Test Failed Flow

```bash
# 1. Try login before verification
POST /accounts/auth/login/
{
  "username": "john",
  "password": "SecurePass123"
}

# Response: 403 Forbidden with "Please verify your email first"

# 2. Try wrong OTP
POST /accounts/auth/verify-email/
{
  "email": "john@example.com",
  "otp": "000000"
}

# Response: 400 Bad Request with "Invalid OTP. 4 attempts remaining"

# 3. Try resend OTP
POST /accounts/auth/resend-otp/
{
  "email": "john@example.com"
}

# Response: 200 OK with new OTP sent
```

---

## 📊 What Changed

| Component | Before | After |
|-----------|--------|-------|
| **User Registration** | User created + active | User created + inactive |
| **Login** | Any registered user can log in | Only verified users can log in |
| **Database** | UserProfile has role | UserProfile has role + is_email_verified |
| **New Table** | N/A | EmailVerification stores OTP |
| **Email Sent** | No | Yes, OTP sent on signup |
| **Verification** | Not needed | 6-digit OTP in email |
| **Routes (Frontend)** | `/auth` | `/auth` + `/verify-email` |

---

## 🚦 User Flow Diagram

```
┌─────────────┐
│  User Signup │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│  POST /register/     │
│  - Create user       │
│  - is_active = False │
│  - Send OTP email    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Frontend Redirect   │
│  → /verify-email     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  User Enters OTP     │
│  (max 5 attempts)    │
└──────┬───────────────┘
       │
       ├─ Wrong OTP     ──→ Error message + retry
       │
       └─ Correct OTP   ──→ Verify email API
                            │
                            ▼
                        ┌──────────────────────┐
                        │ POST /verify-email/  │
                        │ - Set activated user │
                        │ - Delete OTP record  │
                        └──────┬───────────────┘
                               │
                               ▼
                        ┌──────────────────────┐
                        │  Success + Redirect  │
                        │  → /auth (login)     │
                        └──────┬───────────────┘
                               │
                               ▼
                        ┌──────────────────────┐
                        │  POST /login/        │
                        │  (now works!)        │
                        └──────┬───────────────┘
                               │
                               ▼
                        ┌──────────────────────┐
                        │ Dashboard / Portal   │
                        │ User fully logged in │
                        └──────────────────────┘
```

---

## 🔧 Troubleshooting

### "Email not sending"

**Problem:** OTP email not received

**Solution:**
1. Check Gmail app password is correct (no spaces!)
2. Check 2FA enabled on Gmail
3. Check `.env` has correct EMAIL_HOST_USER
4. Check Django console for errors
5. Try: `python manage.py test`

### "User keeps getting email_not_verified error"

**Problem:** Email marked as verified but login fails

**Solution:**
```bash
python manage.py shell
>>> from django.contrib.auth.models import User
>>> user = User.objects.get(username='john')
>>> print(user.profile.is_email_verified)  # Should be True
>>> print(user.is_active)  # Should be True
```

### "Resend button disabled forever"

**Problem:** Cooldown countdown stuck

**Solution:**
```bash
python manage.py shell
>>> from accounts.models import EmailVerification
>>> ev = EmailVerification.objects.get(user__username='john')
>>> ev.resent_at = None  # Clear resent time
>>> ev.save()
```

---

## 📋 Testing Checklist

- [ ] Backend: Environment variables configured
- [ ] Backend: Migration applied successfully
- [ ] Backend: New tables created in database
- [ ] Frontend: `/verify-email` route works
- [ ] Frontend: Can sign up and redirect to verification
- [ ] Backend: OTP sent to email (or console)
- [ ] Frontend: Can enter 6-digit OTP
- [ ] Frontend: Wrong OTP shows error
- [ ] Frontend: After 5 wrong attempts, blocked
- [ ] Backend: Correct OTP marks user as verified
- [ ] Backend: Verified user can log in
- [ ] Backend: Unverified user gets 403 on login
- [ ] Frontend: Success redirects to login
- [ ] Frontend: Resend button works after 60 seconds
- [ ] Backend: Email not sent, error handled gracefully

---

## 🎯 Next Steps

1. **Test**: Follow the 5-minute test scenario above
2. **Configure**: Set up Gmail app password
3. **Deploy**: Run migrations on production
4. **Monitor**: Watch for email delivery issues
5. **Optimize**: Add SMS verification (optional enhancement)

---

## 📞 Support

For issues:
1. Check the full guide: `docs/EMAIL_OTP_VERIFICATION_GUIDE.md`
2. Review error response in API
3. Check Django console/logs
4. Verify email configuration in `.env`

---

**Status:** ✅ READY TO TEST

See you in `/verify-email`! 🚀

