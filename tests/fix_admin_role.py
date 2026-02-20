import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'webinar_system.settings')
django.setup()

from django.contrib.auth.models import User
from events.models import UserProfile

print("=" * 50)
print("CHECKING AND FIXING ADMIN ROLES")
print("=" * 50)
print()

# Get all superusers
superusers = User.objects.filter(is_superuser=True)

if not superusers.exists():
    print("❌ No superusers found!")
    print("Please create a superuser first: python manage.py createsuperuser")
else:
    for user in superusers:
        print(f"User: {user.username}")
        
        # Get or create profile
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        if created:
            print(f"  ✅ Created new profile")
        
        # Check current role
        if profile.role != 'admin':
            print(f"  ⚠️  Current role: {profile.role}")
            profile.role = 'admin'
            profile.save()
            print(f"  ✅ Updated role to: admin")
        else:
            print(f"  ✅ Already admin")
        
        print()

print("=" * 50)
print("✅ ALL SUPERUSERS NOW HAVE ADMIN ROLE!")
print("=" * 50)
print()
print("NEXT STEPS:")
print("1. In your browser, logout from the current session")
print("2. Login again with your superuser credentials")
print("3. You should now see the admin dashboard!")
print()
