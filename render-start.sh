#!/usr/bin/env bash

set -e

echo "Starting Django app..."

echo "Running migrations at startup..."
python manage.py migrate --noinput

if [ -n "$DJANGO_SUPERUSER_USERNAME" ]; then
  echo "Ensuring superuser at startup..."
  python manage.py ensure_superuser --update-password
else
  echo "Skipping superuser sync at startup: DJANGO_SUPERUSER_USERNAME not set"
fi

echo "Launching gunicorn..."
exec gunicorn webinar_system.wsgi:application --bind 0.0.0.0:$PORT
