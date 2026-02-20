# PostgreSQL Setup Guide for Render Deployment

## Step 1: Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "Create New" → "PostgreSQL"
3. Configure:
   - **Name**: `webinar-db` (or your preference)
   - **Region**: Same as your web service (e.g., Oregon)
   - **PostgreSQL Version**: 15 (or latest)

4. Click "Create Database"

## Step 2: Get Connection String

Render will provide connection string in format:
```
postgres://user:password@host.postgres.render.com:5432/dbname
```

Also provided as individual components:
- **Hostname**: `dpg-xxxxx-a.postgres.render.com`
- **Port**: `5432`
- **Database**: `webinar_db`
- **Username**: `postgres`
- **Password**: (shown once, securely stored)

## Step 3: Update Render Service Environment Variables

In your Render Web Service settings → **Environment**:

### Option A: Using Individual Variables (Recommended)
```env
USE_POSTGRESQL=True
DB_NAME=webinar_db
DB_USER=postgres
DB_PASSWORD=your-password-from-render
DB_HOST=dpg-xxxxx-a.postgres.render.com
DB_PORT=5432
```

### Option B: Using DATABASE_URL
```env
DATABASE_URL=postgres://user:password@host.postgres.render.com:5432/dbname
```

Then update `settings.py` to parse it:
```python
import dj_database_url

DATABASES = {
    'default': dj_database_url.config(
        default=config('DATABASE_URL', default=''),
        conn_max_age=600
    )
}
```

## Step 4: Update Django Settings

Ensure `webinar_system/settings.py` has PostgreSQL support:

```python
from decouple import config
import dj_database_url

# Method 1: Individual variables (already configured)
if config('USE_POSTGRESQL', default=False, cast=bool):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': config('DB_NAME'),
            'USER': config('DB_USER'),
            'PASSWORD': config('DB_PASSWORD'),
            'HOST': config('DB_HOST'),
            'PORT': config('DB_PORT', default='5432'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Method 2: Using DATABASE_URL (if you prefer)
# Uncomment to use DATABASE_URL from Render
# if config('DATABASE_URL', default=None):
#     DATABASES = {
#         'default': dj_database_url.config(
#             default=config('DATABASE_URL'),
#             conn_max_age=600
#         )
#     }
```

## Step 5: Install PostgreSQL Driver

✅ Already added to `requirements.txt`:
```
psycopg2-binary==2.9.9
```

## Step 6: Run Migrations on Render

### Option A: Via Render Console
1. Go to your Render Web Service
2. Click "Shell" tab
3. Run:
```bash
python manage.py migrate --noinput
```

### Option B: Via Build Script
The `render-build.sh` already includes migration command:
```bash
python manage.py migrate --noinput
```

This runs automatically during deployment!

## Step 7: Verify Database Connection

Test connection with:
```bash
python manage.py dbshell
```

If you see `postgres=#>` prompt, database is correctly configured!

## Common Issues & Solutions

### Issue: "could not translate host name to address"
**Cause**: Database service not ready yet or hostname incorrect
**Solution**: 
- Wait 30 seconds for database to initialize
- Verify hostname from Render dashboard matches `DB_HOST`

### Issue: "password authentication failed"
**Cause**: Wrong password in environment variables
**Solution**:
- Copy password directly from Render (it's shown only once)
- Check for special characters that need escaping
- Re-create database if forgotten

### Issue: "relation does not exist"
**Cause**: Migrations not run
**Solution**:
```bash
# Via Render Console:
python manage.py migrate --noinput

# Or redeploy to trigger render-build.sh
```

### Issue: "could not connect to server: Connection timed out"
**Cause**: 
- Database on different region than web service
- Database not yet initialized (takes ~30 seconds)
**Solution**:
- Ensure DB region = Web Service region
- Wait for database to fully initialize
- Check Render status page for incidents

## Testing In Render Console

After migrations complete:

```bash
# Test database connection
python manage.py dbshell

# Create a test record
python manage.py shell
# In shell:
from accounts.models import UserProfile
from django.contrib.auth.models import User
user = User.objects.create(username='testuser', email='test@example.com')
profile = UserProfile.objects.create(user=user, role='user')
print(f"Created: {profile}")
```

## Backup Your Database

To backup PostgreSQL on Render:
1. Go to Database → Settings
2. Download backup file
3. Keep in safe location

## Useful PostgreSQL Commands

```bash
# Connect to database
psql "postgres://user:password@host:port/dbname"

# List tables
\dt

# Exit
\q

# Check migrations status
python manage.py showmigrations

# Create new migration
python manage.py makemigrations

# Apply migrations
python manage.py migrate
```

---

✅ **Your PostgreSQL database is now configured on Render!**

Next: Update environment variables on Render dashboard and redeploy.
