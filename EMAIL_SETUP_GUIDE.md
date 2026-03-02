# Email OTP Verification - Environment Setup Guide

## 📧 Gmail Configuration

### Step 1: Enable 2-Factor Authentication

1. Go to https://myaccount.google.com/
2. Click "Security" in left sidebar
3. Scroll to "How you sign in to Google"
4. Click "2-Step Verification"
5. Follow the prompts to enable 2FA

### Step 2: Generate App Password

1. After 2FA is enabled, go back to Security
2. Scroll down to "Your app passwords"
3. For "Select app" choose "Mail"
4. For "Select device" choose "Windows Computer"
5. Click "Generate"
6. Google will show a 16-character password:
   ```
   abcd efgh ijkl mnop
   ```

### Step 3: Copy Password (Without Spaces)

Remove all spaces from the generated password:
```
Original:  abcd efgh ijkl mnop
Copy as:   abcdefghijklmnop
```

### Step 4: Add to .env

Create or update your `.env` file with:

```bash
# ========================================
# EMAIL CONFIGURATION (Gmail SMTP)
# ========================================

EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True

# Your Gmail address
EMAIL_HOST_USER=your-email@gmail.com

# App password generated from step 3 (NO SPACES)
EMAIL_HOST_PASSWORD=abcdefghijklmnop

# Email sender name
DEFAULT_FROM_EMAIL=your-email@gmail.com

```

---

## 🔍 Verify Configuration

### Test Email Sending

```bash
# Start Django shell
python manage.py shell

# Try sending a test email
from django.core.mail import send_mail

result = send_mail(
    'Test Email from Django',
    'This is a test message from your Django app.',
    'your-email@gmail.com',
    ['recipient@example.com'],
    fail_silently=False,
)

print(f"Email sent: {result}")  # Should print: Email sent: 1
```

### Test OTP Sending

```bash
# In Django shell
from accounts.email_utils import send_otp_email
from django.contrib.auth.models import User

# Get a user (or create test user)
user = User.objects.get(username='testuser')

# Send OTP email
result = send_otp_email(user, '123456')

print(f"OTP sent: {result}")  # Should print: OTP sent: True
```

---

## 📋 Complete .env Template

```bash
# ========================================
# DJANGO SETTINGS
# ========================================
DEBUG=True
SECRET_KEY=django-insecure-your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1,*.example.com

# ========================================
# DATABASE
# ========================================
# For SQLite (local development):
DATABASE_URL=sqlite:///db.sqlite3

# For PostgreSQL (production):
# DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# ========================================
# EMAIL CONFIGURATION (Gmail SMTP)
# ========================================
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-16-char-app-password
DEFAULT_FROM_EMAIL=your-email@gmail.com

# ========================================
# CORS & FRONTEND
# ========================================
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
FRONTEND_URL=http://localhost:3000

# ========================================
# SECURITY (Keep False in development)
# ========================================
SECURE_SSL_REDIRECT=False
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False
SECURE_BROWSER_XSS_FILTER=True
SECURE_CONTENT_SECURITY_POLICY=True
```

---

## 🧪 Testing Email Configuration

### Option 1: Console Output (Best for Testing)

Add to `accounts/email_utils.py`:

```python
def send_otp_email(user: User, otp: str) -> bool:
    try:
        # DEBUG: Print OTP to console
        import sys
        if hasattr(sys, 'ps1'):  # Only in interactive shell
            print(f"\n{'='*50}")
            print(f"🔐 OTP for {user.email}")
            print(f"📧 Email: {user.email}")
            print(f"🔒 OTP: {otp}")
            print(f"⏰ Expires: 10 minutes")
            print(f"{'='*50}\n")
        
        # Send actual email
        subject = "Email Verification Code"
        # ... rest of code ...
```

### Option 2: File Backend (Testing Without SMTP)

Update `.env`:

```bash
# For testing without sending actual emails
EMAIL_BACKEND=django.core.mail.backends.filebased.EmailBackend
EMAIL_FILE_PATH=/tmp/django-emails
```

Emails will be saved as text files in `/tmp/django-emails/` directory.

### Option 3: Memory Backend (Testing)

```bash
EMAIL_BACKEND=django.core.mail.backends.locmem.EmailBackend
```

Emails stored in memory for testing.

---

## ⚠️ Common Mistakes

### ❌ Incorrect: Space in App Password
```bash
# WRONG - has spaces
EMAIL_HOST_PASSWORD=abcd efgh ijkl mnop
```

### ✅ Correct: App Password Without Spaces
```bash
# RIGHT - no spaces
EMAIL_HOST_PASSWORD=abcdefghijklmnop
```

### ❌ Incorrect: Gmail Account Type
```bash
# WRONG - using 2-step verification code instead of app password
EMAIL_HOST_PASSWORD=123456  # This is wrong!
```

### ✅ Correct: Use Generated App Password
```bash
# RIGHT - use the 16-character app password from myaccount.google.com/apppasswords
EMAIL_HOST_PASSWORD=abcdefghijklmnop
```

### ❌ Incorrect: Not Storing in .env
```python
# WRONG - hardcoding in code
EMAIL_HOST_PASSWORD = "abcdefghijklmnop"
```

### ✅ Correct: Use Environment Variable
```python
from decouple import config

# RIGHT - load from .env
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')
```

---

## 🔒 Security Best Practices

### For Development

1. ✅ Use test Gmail account (separate from personal)
2. ✅ Store app password in `.env` only
3. ✅ Never commit `.env` file to git
4. ✅ Add `.env` to `.gitignore`

### For Production

1. ✅ Use separate production Gmail account
2. ✅ Generate unique app password for production
3. ✅ Store in production environment variables
4. ✅ Use HTTPS only (SECURE_SSL_REDIRECT=True)
5. ✅ Rotate app password periodically
6. ✅ Monitor email delivery logs
7. ✅ Set up alerts for failures

---

## 📞 Troubleshooting Email Configuration

### Problem: "SMTP authentication failed"

**Solution:**
1. Verify app password is correct (copy-paste from Google)
2. Remove all spaces from password
3. Confirm EMAIL_HOST_USER is your Gmail address
4. Check 2-Factor Authentication is enabled

**Debug:**
```bash
python manage.py shell
>>> import smtplib
>>> server = smtplib.SMTP('smtp.gmail.com', 587)
>>> server.starttls()
>>> server.login('your-email@gmail.com', 'your-app-password')
# If this works, config is correct
```

### Problem: "SMTP connection refused"

**Solution:**
1. Check EMAIL_HOST is `smtp.gmail.com` (not `mail.gmail.com`)
2. Check EMAIL_PORT is `587` (not 465 for SMTP)
3. Check EMAIL_USE_TLS is `True`
4. Verify internet connection

**Debug:**
```bash
# Try connecting manually
telnet smtp.gmail.com 587
```

### Problem: Email sends but never arrives

**Solution:**
1. Check recipient email is correct
2. Check spam folder
3. Try sending to different provider (not Gmail)
4. Verify sender is whitelisted

**Debug:**
```python
# Test with console backend
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
# Check console output for email
```

### Problem: "Less secure apps" error (Older Gmail)

**Solution:**
Use app password (not account password).

Previously Gmail had "Less Secure App" setting, now they only support:
1. 2-Step Verification + App Password (RECOMMENDED)
2. OAuth2 (for advanced users)

---

## 🚀 Quick Setup Checklist

- [ ] Enable 2-Factor Authentication on Gmail
- [ ] Go to https://myaccount.google.com/apppasswords
- [ ] Select "Mail" and "Windows Computer"
- [ ] Copy 16-character app password (no spaces)
- [ ] Add to `.env` as EMAIL_HOST_PASSWORD
- [ ] Add other email settings to `.env`
- [ ] Add `.env` to `.gitignore`
- [ ] Test with: `python manage.py shell`
- [ ] Verify migration applied: `python manage.py migrate`
- [ ] Start Django: `python manage.py runserver`
- [ ] Test signup and OTP email

---

## 📧 Sample Email Configuration

### Development
```bash
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=test-email-123@gmail.com
EMAIL_HOST_PASSWORD=abcdefghijklmnop
DEFAULT_FROM_EMAIL=test-email-123@gmail.com
```

### Staging
```bash
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=staging@company.com
EMAIL_HOST_PASSWORD=xyz1234567abcdef
DEFAULT_FROM_EMAIL=staging@company.com
```

### Production
```bash
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=noreply@company.com
EMAIL_HOST_PASSWORD=secret-app-password-here
DEFAULT_FROM_EMAIL=WebinarSystem <noreply@company.com>
```

---

## ✅ Verification Checklist

After setup, verify everything works:

```bash
# 1. Check .env is loaded
python manage.py shell
>>> import os
>>> os.getenv('EMAIL_HOST_USER')
'your-email@gmail.com'  # Should show your email

# 2. Test email send
>>> from django.core.mail import send_mail
>>> send_mail('Test', 'Test message', 'noreply@company.com', ['test@example.com'])
1  # Should return 1 (success)

# 3. Test OTP email
>>> from accounts.email_utils import send_otp_email
>>> from django.contrib.auth import User
>>> user = User.objects.first()
>>> send_otp_email(user, '123456')
True  # Should return True

# 4. Check migration applied
>>> from accounts.models import EmailVerification
>>> EmailVerification.objects.count()
0  # Should work without error
```

---

## 🎯 Next Steps

1. **Setup:** Follow steps above
2. **Test:** Run `python manage.py test`
3. **Verify:** Use checklist above
4. **Deploy:** See deployment guide

---

## 📖 Additional Resources

- Django Email Documentation: https://docs.djangoproject.com/en/6.0/topics/email/
- Gmail App Passwords: https://support.google.com/accounts/answer/185833
- SMTP Security: https://en.wikipedia.org/wiki/SMTP_Authentication

---

**Status:** Ready to Setup & Test ✅

