#!/usr/bin/env python
"""
Script to fix admin role for existing superusers
Run this with: python fix_superuser_role.py
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'webinar_system.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import UserProfile


def fix_superuser_roles():
    """Update all superusers and staff to have admin role"""
    superusers = User.objects.filter(is_superuser=True) | User.objects.filter(is_staff=True)
    
    updated_count = 0
    for user in superusers.distinct():
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        if profile.role != 'admin':
            profile.role = 'admin'
            profile.save()
            updated_count += 1
            print(f"✅ Updated {user.username} to admin role")
        else:
            print(f"ℹ️  {user.username} already has admin role")
    
    print(f"\n✅ Updated {updated_count} user(s) to admin role")
    print(f"📊 Total superusers/staff: {superusers.distinct().count()}")


if __name__ == '__main__':
    print("🔧 Fixing superuser roles...\n")
    fix_superuser_roles()
    print("\n✅ Done!")
