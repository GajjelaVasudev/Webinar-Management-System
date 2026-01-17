from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from events.models import UserProfile


class Command(BaseCommand):
    help = 'Make a user an admin'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username of the user to make admin')

    def handle(self, *args, **options):
        username = options['username']
        
        try:
            user = User.objects.get(username=username)
            
            # Get or create profile
            profile, created = UserProfile.objects.get_or_create(user=user)
            profile.role = 'admin'
            profile.save()
            
            # Also make them staff and superuser for Django admin access
            user.is_staff = True
            user.is_superuser = True
            user.save()
            
            self.stdout.write(self.style.SUCCESS(f'Successfully made {username} an admin!'))
            
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'User "{username}" does not exist'))
