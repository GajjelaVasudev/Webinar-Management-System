#!/usr/bin/env bash

# ============================================================
# Render Deployment Script
# Run this in your Render build command or manually
# ============================================================

set -e  # Exit on error

echo "🚀 Starting Django deployment on Render..."

# ============================================================
# Step 1: Install Dependencies
# ============================================================
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# ============================================================
# Step 2: Database Migrations
# ============================================================
echo "🗄️  Running database migrations..."
python manage.py migrate --noinput

# ============================================================
# Step 3: Collect Static Files
# ============================================================
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput --clear

# ============================================================
# Step 4: (Optional) Create Superuser
# ============================================================
# Uncomment if you want to auto-create a superuser
# python manage.py shell << END
# from django.contrib.auth.models import User
# if not User.objects.filter(username='admin').exists():
#     User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
#     print("✅ Superuser created!")
# else:
#     print("⏭️  Superuser already exists")
# END

echo "✅ Deployment preparation complete!"
echo "🎉 Your Django app is ready on Render"
