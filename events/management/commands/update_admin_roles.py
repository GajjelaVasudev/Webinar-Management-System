from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db import models
from events.models import UserProfile


class Command(BaseCommand):
    help = 'Update user profiles to set superusers and staff as admins'

    def handle(self, *args, **options):
        # Get all superusers and staff
        admin_users = User.objects.filter(models.Q(is_superuser=True) | models.Q(is_staff=True))
        
        updated_count = 0
        created_count = 0
        
        for user in admin_users:
            profile, created = UserProfile.objects.get_or_create(user=user)
            
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created profile for {user.username}'))
            
            if profile.role != 'admin':
                profile.role = 'admin'
                profile.save()
                updated_count += 1
                self.stdout.write(self.style.SUCCESS(f'Updated {user.username} to admin role'))
        
        self.stdout.write(self.style.SUCCESS(f'\nTotal profiles created: {created_count}'))
        self.stdout.write(self.style.SUCCESS(f'Total profiles updated to admin: {updated_count}'))
