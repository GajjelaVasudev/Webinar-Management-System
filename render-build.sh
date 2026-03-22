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
# Step 4: (Optional) Ensure Superuser
# ============================================================
if [ -n "$DJANGO_SUPERUSER_USERNAME" ]; then
	echo "👤 Ensuring superuser exists..."
	python manage.py ensure_superuser
else
	echo "⏭️  Skipping superuser bootstrap (DJANGO_SUPERUSER_USERNAME not set)"
fi

echo "✅ Deployment preparation complete!"
echo "🎉 Your Django app is ready on Render"
