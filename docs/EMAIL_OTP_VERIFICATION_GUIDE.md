# Email OTP Verification System Implementation Guide

## 🎯 Overview

This document describes the production-ready Email OTP verification system implemented for the Django + React webinar management platform. Users must verify their email with a 6-digit OTP before they can log in.

**Status:** ✅ IMPLEMENTED & READY FOR TESTING

---

## 📋 What's New

### Backend Changes

1. **New Model: `EmailVerification`**
   - Stores OTP hash for each user
   - Tracks failed attempts (max 5)
   - Manages OTP expiration (10 minutes)
   - Tracks resend cooldown (60 seconds)

2. **Updated Model: `UserProfile`**
   - New field: `is_email_verified` (Boolean, default False)

3. **New Endpoints**
   - `POST /accounts/auth/register/` - Create user (is_active=False, is_email_verified=False)
   - `POST /accounts/auth/verify-email/` - Verify OTP and activate user
   - `POST /accounts/auth/resend-otp/` - Resend OTP with cooldown

4. **Updated Endpoints**
   - `POST /accounts/auth/login/` - Check is_email_verified before issuing token

5. **Email Configuration**
   - Gmail SMTP setup via environment variables
   - Beautiful HTML email templates
   - Plain text fallback

### Frontend Changes

1. **New Route**
   - `/verify-email` - Email verification page with OTP input

2. **New Component**
   - `VerifyEmailPage.tsx` - Complete verification UI with:
     - 6-digit OTP input (numbers only)
     - 60-second resend cooldown countdown
     - Attempt tracking (max 5)
     - Loading states
     - Success/error handling
     - Redirect to login on success

3. **Updated AuthPage**
   - Redirects to `/verify-email` after successful signup
   - Passes email via React Router state

---

## 🔧 Backend Setup

### 1. Install Dependencies

```bash
pip install python-dotenv
pip install -r requirements.txt
```

### 2. Configure Email (.env)

```bash
# Email Configuration (Gmail SMTP)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password-here
DEFAULT_FROM_EMAIL=your-email@gmail.com
```

**To get Gmail App Password:**
1. Enable 2-Factor Authentication on your Gmail account
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. Copy the generated 16-character password (remove spaces)
5. Paste into `.env` as `EMAIL_HOST_PASSWORD`

### 3. Create and Apply Migrations

```bash
# Create migration (already created: 0003_email_verification_system.py)
python manage.py makemigrations

# Apply migration
python manage.py migrate
```

### 4. Verify Models

Check that the new tables were created:

```bash
python manage.py dbshell

# Run these SQL commands
SELECT * FROM accounts_emailverification;
SELECT id, username, is_email_verified FROM auth_user;
```

---

## 🔐 Security Features

### OTP Security

- ✅ 6-digit OTP generated randomly
- ✅ OTP hashed using Django's `make_password()` (PBKDF2)
- ✅ Never stored in plain text
- ✅ Expires after 10 minutes
- ✅ Max 5 verification attempts
- ✅ Resend limited to 1 per 60 seconds
- ✅ OTP never exposed in API responses

### Account Activation

- ✅ New users created with `is_active=False`
- ✅ Users cannot log in until email verified
- ✅ Returns 403 Forbidden with `email_not_verified` error
- ✅ Verification record deleted after success

### Email Validation

- ✅ HTML email template with branding
- ✅ Plain text fallback
- ✅ Proper error handling
- ✅ Email send failures caught and reported

---

## 📡 API Endpoints

### 1. Register User

**Endpoint:** `POST /accounts/auth/register/`

**Request:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "password_confirm": "SecurePass123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Success Response (201):**
```json
{
  "message": "User registered successfully. Please check your email for the verification code.",
  "email": "john@example.com",
  "username": "johndoe"
}
```

**Error Responses:**
```json
// 400 - Invalid data
{
  "email": ["A user with this email already exists."]
}

// 400 - Email send failed (still creates user)
{
  "message": "User registered but email sending failed. Please try to resend OTP.",
  "email": "john@example.com",
  "error": "email_send_failed"
}
```

---

### 2. Verify Email

**Endpoint:** `POST /accounts/auth/verify-email/`

**Request:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "message": "Email verified successfully. You can now log in.",
  "email": "john@example.com",
  "username": "johndoe"
}
```

**Error Responses:**
```json
// 400 - Invalid OTP
{
  "detail": "Invalid OTP. 3 attempts remaining.",
  "error_code": "invalid_otp",
  "attempts_remaining": 3
}

// 429 - Max attempts exceeded
{
  "detail": "Maximum verification attempts exceeded. Please request a new OTP.",
  "error_code": "max_attempts_exceeded"
}

// 404 - User not found
{
  "detail": "User with this email not found"
}
```

---

### 3. Resend OTP

**Endpoint:** `POST /accounts/auth/resend-otp/`

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "A new verification code has been sent to your email.",
  "email": "john@example.com"
}
```

**Error Responses:**
```json
// 429 - Cooldown active
{
  "detail": "Please wait before requesting a new OTP.",
  "error_code": "resend_cooldown_active"
}

// 400 - Already verified
{
  "detail": "This email is already verified. You can log in now.",
  "error_code": "already_verified"
}

// 500 - Email send failed
{
  "detail": "Failed to send email. Please try again later.",
  "error_code": "email_send_failed"
}
```

---

### 4. Login (Updated)

**Endpoint:** `POST /accounts/auth/login/`

**Request:**
```json
{
  "username": "johndoe",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "student",
    "profile_picture_url": "http://localhost:8000/media/profile_pictures/avatar_johndoe.png"
  }
}
```

**Error Response - Email not verified (403):**
```json
{
  "detail": "Please verify your email first.",
  "email": "john@example.com",
  "error_code": "email_not_verified"
}
```

---

## 🚀 Frontend Implementation

### New Route

**Path:** `/verify-email`

**State Required:**
```typescript
{
  state: {
    email: "john@example.com"
  }
}
```

### VerifyEmailPage Features

1. **OTP Input**
   - 6-digit numeric input only
   - Auto-cleared on invalid attempt
   - Disabled when max attempts exceeded

2. **Countdown Timer**
   - 60-second resend cooldown
   - Shows remaining seconds
   - Button disabled during cooldown

3. **Attempt Tracking**
   - Displays remaining attempts (max 5)
   - Shows error message on failure
   - Auto-disables input at 0 attempts

4. **Loading States**
   - Button shows spinner during verification
   - Inputs disabled during API call
   - Toast notifications for feedback

5. **Success Handling**
   - Shows success UI with checkmark
   - Auto-redirects to login after 2 seconds
   - Passes verification message to login

6. **Error Handling**
   - Invalid OTP: Shows attempts remaining
   - Max attempts: Shows "request new OTP" message
   - Already verified: Redirects to login
   - No email state: Redirects to signup

---

## 🧪 Testing Checklist

### Unit Test 1: Successful Registration & Verification

```bash
# 1. Sign up new user
POST /accounts/auth/register/
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "TestPass123"
}

# Expected: 201 Created
# Message: "User registered successfully. Please check your email..."

# 2. Check database
python manage.py shell
>>> from django.contrib.auth.models import User
>>> User.objects.filter(username='testuser').first()
User: testuser (is_active=False)  # Should be inactive

# 3. Get OTP from email (in development, check console/logs)
# OTP should be 6 digits, e.g., "123456"

# 4. Verify email
POST /accounts/auth/verify-email/
{
  "email": "test@example.com",
  "otp": "123456"
}

# Expected: 200 OK
# Message: "Email verified successfully. You can now log in."

# 5. Try login
POST /accounts/auth/login/
{
  "username": "testuser",
  "password": "TestPass123"
}

# Expected: 200 OK
# Returns: access_token, refresh_token, user data
```

### Unit Test 2: Wrong OTP with Attempt Tracking

```bash
# 1. Get OTP from email: "123456"

# 2. Submit wrong OTP (attempt 1)
POST /accounts/auth/verify-email/
{
  "email": "test@example.com",
  "otp": "000000"
}

# Expected: 400 Bad Request
# Message: "Invalid OTP. 4 attempts remaining."

# 3. Submit wrong OTP (attempt 2)
# Expected: "Invalid OTP. 3 attempts remaining."

# 4. Submit wrong OTP (attempt 3)
# Expected: "Invalid OTP. 2 attempts remaining."

# 5. Submit wrong OTP (attempt 4)
# Expected: "Invalid OTP. 1 attempt remaining."

# 6. Submit wrong OTP (attempt 5)
# Expected: 429 Too Many Requests
# Message: "Maximum verification attempts exceeded. Please request a new OTP."

# 7. Try to use correct OTP now
POST /accounts/auth/verify-email/
{
  "email": "test@example.com",
  "otp": "123456"
}

# Expected: 429 Too Many Requests
# Message: "Maximum verification attempts exceeded..."
```

### Unit Test 3: OTP Expiration

```bash
# 1. Sign up user
POST /accounts/auth/register/
{
  "username": "testuser2",
  "email": "test2@example.com",
  "password": "TestPass123"
}

# 2. Get OTP and wait 11 minutes (or modify DB for testing)

# 3. Try to verify with correct OTP
POST /accounts/auth/verify-email/
{
  "email": "test2@example.com",
  "otp": "123456"
}

# Expected: 400 Bad Request
# Message: "Invalid OTP. 4 attempts remaining."
```

### Unit Test 4: Resend OTP Cooldown

```bash
# 1. Sign up user and DON'T verify

# 2. First resend (should work immediately)
POST /accounts/auth/resend-otp/
{
  "email": "test@example.com"
}

# Expected: 200 OK
# Message: "A new verification code has been sent to your email."

# 3. Immediate second resend
POST /accounts/auth/resend-otp/
{
  "email": "test@example.com"
}

# Expected: 429 Too Many Requests
# Message: "Please wait before requesting a new OTP."

# 4. Wait 61 seconds

# 5. Third resend (should work now)
POST /accounts/auth/resend-otp/
{
  "email": "test@example.com"
}

# Expected: 200 OK
```

### Unit Test 5: Login Blocked Without Verification

```bash
# 1. Sign up user (do NOT verify)

# 2. Try to login
POST /accounts/auth/login/
{
  "username": "testuser",
  "password": "TestPass123"
}

# Expected: 403 Forbidden
# Message: "Please verify your email first."
# error_code: "email_not_verified"
# Note: No access token returned
```

### Unit Test 6: Already Verified Users

```bash
# 1. Verify a user's email (from test 1)

# 2. Try resend OTP
POST /accounts/auth/resend-otp/
{
  "email": "test@example.com"
}

# Expected: 400 Bad Request
# Message: "This email is already verified. You can log in now."
# error_code: "already_verified"
```

---

## 🎨 Frontend Testing

### Test 1: Sign Up Flow

```
1. Click "Sign Up" on landing page
2. Fill in form:
   - Username: testuser
   - Email: test@example.com
   - Password: TestPass123
3. Click "Create Account"
4. Should redirect to /verify-email with email pre-filled
5. Verify email input shows: "test@example.com"
```

### Test 2: OTP Input

```
1. On verify-email page, enter numbers in OTP field
   - Should only accept digits (0-9)
   - Should be max 6 characters
   - Should auto-format as you type
2. Enter "123456"
3. Click "Verify Email"
4. Should show loading spinner on button
5. Wait for response
```

### Test 3: Invalid OTP

```
1. Enter "000000" in OTP field
2. Click "Verify Email"
3. Should show error: "Invalid OTP. 4 attempts remaining."
4. OTP field should be cleared
5. Attempts counter should update
```

### Test 4: Resend Button

```
1. On verify-email page, look for resend section
2. Should show countdown timer  "Resend available in 60 seconds"
3. "Resend" button should be disabled (greyed out)
4. Wait 60 seconds (or test in fast-forward)
5. Button should become clickable
6. Click "Resend Code"
7. Should show success toast: "A new verification code has been sent..."
8. Should reset 60-second countdown
```

### Test 5: Success Redirect

```
1. Enter correct OTP
2. Click "Verify Email"
3. Should show green checkmark and success message
4. Should auto-redirect to /auth?tab=login after 2 seconds
5. Should have success message in login page
```

### Test 6: Error Toast Notifications

```
1. At various error points, should show toast notifications:
   - Invalid OTP → red toast
   - Network error → red toast
   - Max attempts → red toast
   - Resend success → green toast
   - Email verified → green toast
2. Toasts should auto-dismiss after 4 seconds
```

---

## 📧 Testing Without Real Email

###Option 1: Console Output (Development)

In `email_utils.py`, add debug logging:

```python
def send_otp_email(user: User, otp: str) -> bool:
    """Send OTP to user's email"""
    try:
        # ... code ...
        
        if DEBUG:
            print(f"\n🔐 OTP for {user.email}: {otp}\n")  # Debug
        
        send_mail(...)
```

Then check Django console for OTP.

### Option 2: File Backend (Development)

Update `.env`:

```
EMAIL_BACKEND=django.core.mail.backends.filebased.EmailBackend
EMAIL_FILE_PATH=/tmp/app-messages
```

Emails saved to `/tmp/app-messages/` as text files.

### Option 3: Mock Email Service

```python
# In email_utils.py for testing
if not settings.EMAIL_HOST_USER:
    # Mock - just print OTP
    print(f"Mock Email Sent to {user.email}: OTP = {otp}")
    return True
```

---

## 📝 Database Queries

### Check Verification Status

```python
from django.contrib.auth.models import User

# Get user with verification info
user = User.objects.get(username='testuser')
print(f"Is active: {user.is_active}")
print(f"Is email verified: {user.profile.is_email_verified}")

# Check if verification record exists
try:
    verification = user.email_verification
    print(f"OTP attempts: {verification.attempts}")
    print(f"Created at: {verification.created_at}")
except:
    print("Verification record not found")
```

### Reset Verification for Testing

```python
from django.contrib.auth.models import User
from accounts.models import EmailVerification

# Get user
user = User.objects.get(username='testuser')

# Reset to unverified state
user.is_active = False
user.save()

user.profile.is_email_verified = False
user.profile.save()

# Delete existing verification record
try:
    EmailVerification.objects.get(user=user).delete()
except:
    pass

# Create new verification
from accounts.email_utils import create_or_update_email_verification
verification, otp = create_or_update_email_verification(user)
print(f"New OTP (plain): {otp}")
```

---

## 🐛 Troubleshooting

### Issue: OTP not sent

**Check 1:** Email settings in `.env`
```bash
cat .env | grep EMAIL_
```

**Check 2:** Gmail App Password correct
- Verify no spaces in password
- Check 2FA enabled on Gmail
- Check app password generated for "Mail"

**Check 3:** Django console for error
```
python manage.py runserver
# Look for email errors
```

**Check 4:** Test email send
```python
from django.core.mail import send_mail

send_mail(
    'Test',
    'This is a test email.',
    'your-email@gmail.com',
    ['test@example.com'],
    fail_silently=False,
)
```

### Issue: "Invalid OTP" but OTP is correct

**Check 1:** OTP cache cleared?
- OTP is hashed anew on each resend
- Old OTP becomes invalid

**Check 2:** Whitespace in OTP?
- Make sure no spaces: "123456" not "123 456"

**Check 3:** OTP expired?
- OTP expires after 10 minutes
- Check created_at timestamp

### Issue: Can't resend OTP

**Check 1:** Cooldown active?
- Wait 60 seconds between resends

**Check 2:** Already verified?
- Can't resend if email already verified
- Try resend on unverified account

**Check 3:** User doesn't exist?
- Check email is correct

### Issue: Frontend not redirecting after signup

**Check 1:** Register function returns true?

```typescript
// In AuthContext
const result = await register(...);
if (result) { // Should be true
  navigate('/verify-email', { state: { email } });
}
```

**Check 2:** Email passed in state?

```typescript
navigate('/verify-email', { state: { email: formData.email } });
```

**Check 3:** VerifyEmailPage imported?

```typescript
import VerifyEmailPage from './pages/VerifyEmailPage';
```

---

## 🔄 Production Deployment

### Pre-Production Checklist

- [ ] Email credentials set in production `.env`
- [ ] Gmail App Password generated and secured
- [ ] OTP expiration time set (10 minutes)
- [ ] Max attempts set (5 attempts)
- [ ] Resend cooldown set (60 seconds)
- [ ] Email templates reviewed
- [ ] Error messages user-friendly
- [ ] Frontend build tested: `npm run build`
- [ ] Backend migrations applied: `python manage.py migrate`
- [ ] Static files collected: `python manage.py collectstatic`

### Environment Variables

```bash
# Required in production
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password-here
DEFAULT_FROM_EMAIL=your-email@gmail.com

# Security
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

### Monitoring

- Monitor failed login attempts (403 email_not_verified)
- Monitor email send failures
- Monitor OTP verification success rate
- Set up alerts for email service issues

---

## 📚 Code Structure

```
accounts/
├── migrations/
│   └── 0003_email_verification_system.py
├── models.py
│   ├── UserProfile (added is_email_verified)
│   └── EmailVerification (new)
├── email_utils.py (new)
│   ├── generate_otp()
│   ├── send_otp_email()
│   └── create_or_update_email_verification()
├── serializers.py
│   ├── VerifyEmailSerializer (new)
│   ├── ResendOTPSerializer (new)
│   └── EmailVerificationResponseSerializer (new)
├── views.py
│   ├── RegisterView (updated)
│   ├── CustomTokenObtainPairView (updated)
│   ├── VerifyEmailView (new)
│   └── ResendOTPView (new)
└── urls.py (updated)

frontend/src/
├── pages/
│   └── VerifyEmailPage.tsx (new)
├── App.tsx (updated with /verify-email route)
└── AuthPage.tsx (updated redirect)
```

---

## 🎓 Learning Resources

- Django Email: https://docs.djangoproject.com/en/6.0/topics/email/
- Gmail App Passwords: https://support.google.com/accounts/answer/185833
- OTP Best Practices: https://tools.ietf.org/html/rfc4226
- React Router State: https://reactrouter.com/

---

## ✅ Completion Status

- ✅ Backend models created
- ✅ Email utility functions
- ✅ API endpoints implemented
- ✅ Frontend components created
- ✅ Routing configured
- ✅ Security measures implemented
- ✅ Error handling complete
- ✅ Documentation written
- ✅ Testing guide provided

**Next Step:** Run the testing checklist above to verify everything works!

