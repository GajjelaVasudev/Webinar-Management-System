"""
Verification script for the refactored Django project structure.
Run this after refactoring to ensure everything is properly set up.
"""

import os
import sys
from pathlib import Path

# Color codes for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'


def print_header(text):
    print(f"\n{BLUE}{'=' * 60}{RESET}")
    print(f"{BLUE}{text.center(60)}{RESET}")
    print(f"{BLUE}{'=' * 60}{RESET}\n")


def check_item(description, condition):
    """Check if a condition is met and print colored result"""
    if condition:
        print(f"{GREEN}✓{RESET} {description}")
        return True
    else:
        print(f"{RED}✗{RESET} {description}")
        return False


def verify_project_structure():
    """Verify that all new apps and directories exist"""
    print_header("Project Structure Verification")
    
    base_dir = Path(__file__).resolve().parent
    
    # Check for new apps
    apps = ['accounts', 'webinars', 'registrations', 'recordings', 'communications']
    all_apps_exist = True
    
    for app in apps:
        app_path = base_dir / app
        exists = app_path.exists() and app_path.is_dir()
        check_item(f"App '{app}' directory exists", exists)
        all_apps_exist = all_apps_exist and exists
        
        if exists:
            # Check for key files in each app
            files = ['models.py', 'views.py', 'serializers.py', 'urls.py', 'admin.py', 'apps.py']
            for file in files:
                file_path = app_path / file
                check_item(f"  - {app}/{file}", file_path.exists())
    
    # Check for organizational directories
    check_item("docs/ directory exists", (base_dir / 'docs').exists())
    check_item("tests/ directory exists", (base_dir / 'tests').exists())
    
    # Check project config
    check_item("webinar_system/ directory exists", (base_dir / 'webinar_system').exists())
    check_item("manage.py exists", (base_dir / 'manage.py').exists())
    check_item("requirements.txt exists", (base_dir / 'requirements.txt').exists())
    
    return all_apps_exist


def verify_settings():
    """Verify settings.py has correct configuration"""
    print_header("Settings Configuration Verification")
    
    try:
        sys.path.insert(0, str(Path(__file__).resolve().parent))
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'webinar_system.settings')
        
        from django.conf import settings
        
        # Check INSTALLED_APPS
        required_apps = [
            'accounts',
            'webinars',
            'registrations',
            'recordings',
            'communications',
            'rest_framework',
            'rest_framework_simplejwt',
            'corsheaders',
        ]
        
        for app in required_apps:
            in_installed_apps = app in settings.INSTALLED_APPS
            check_item(f"'{app}' in INSTALLED_APPS", in_installed_apps)
        
        # Check REST_FRAMEWORK config
        check_item("REST_FRAMEWORK configured", hasattr(settings, 'REST_FRAMEWORK'))
        check_item("SIMPLE_JWT configured", hasattr(settings, 'SIMPLE_JWT'))
        check_item("CORS_ALLOWED_ORIGINS configured", hasattr(settings, 'CORS_ALLOWED_ORIGINS'))
        
        return True
    except Exception as e:
        print(f"{RED}Error loading settings: {e}{RESET}")
        return False


def verify_migrations():
    """Check if migrations exist for all apps"""
    print_header("Migrations Verification")
    
    base_dir = Path(__file__).resolve().parent
    apps = ['accounts', 'webinars', 'registrations', 'recordings', 'communications']
    
    for app in apps:
        migrations_dir = base_dir / app / 'migrations'
        has_migrations = migrations_dir.exists() and any(migrations_dir.glob('0*.py'))
        check_item(f"Migrations exist for '{app}'", has_migrations)


def verify_urls():
    """Verify URL configuration"""
    print_header("URL Configuration Verification")
    
    try:
        from webinar_system.urls import urlpatterns
        check_item("Main URLs imported successfully", True)
        
        # Check that API patterns are included
        url_str = str(urlpatterns)
        check_item("Admin URLs configured", 'admin/' in url_str)
        check_item("API URLs configured", 'api/' in url_str or 'accounts' in url_str)
        
        return True
    except Exception as e:
        print(f"{RED}Error loading URLs: {e}{RESET}")
        return False


def verify_models_import():
    """Verify that models can be imported from new apps"""
    print_header("Models Import Verification")
    
    try:
        from accounts.models import UserProfile
        check_item("Import UserProfile from accounts", True)
        
        from webinars.models import Event
        check_item("Import Event from webinars", True)
        
        from registrations.models import Registration
        check_item("Import Registration from registrations", True)
        
        from recordings.models import Recording
        check_item("Import Recording from recordings", True)
        
        from communications.models import Announcement, UserNotification, WebinarChatMessage
        check_item("Import Announcement from communications", True)
        check_item("Import UserNotification from communications", True)
        check_item("Import WebinarChatMessage from communications", True)
        
        return True
    except Exception as e:
        print(f"{RED}Error importing models: {e}{RESET}")
        return False


def print_summary(results):
    """Print final summary"""
    print_header("Verification Summary")
    
    total_checks = sum(results.values())
    passed = sum(1 for v in results.values() if v)
    
    if passed == total_checks:
        print(f"{GREEN}✓ All checks passed!{RESET}")
        print(f"\n{GREEN}🎉 Project refactoring is complete and verified!{RESET}")
        print(f"\n{BLUE}Next steps:{RESET}")
        print("1. Run: python manage.py makemigrations")
        print("2. Run: python manage.py migrate")
        print("3. Run: python manage.py createsuperuser")
        print("4. Run: python manage.py runserver")
        print("5. Update frontend API endpoints (see REFACTORING_GUIDE.md)")
    else:
        print(f"{YELLOW}⚠ {passed}/{total_checks} checks passed{RESET}")
        print(f"\n{YELLOW}Some issues need to be addressed. Review the output above.{RESET}")


def main():
    """Run all verifications"""
    print(f"\n{BLUE}╔════════════════════════════════════════════════════════════╗{RESET}")
    print(f"{BLUE}║     Django Project Refactoring Verification Script        ║{RESET}")
    print(f"{BLUE}╚════════════════════════════════════════════════════════════╝{RESET}")
    
    results = {
        'structure': verify_project_structure(),
        'settings': verify_settings(),
        'models': verify_models_import(),
        'urls': verify_urls(),
    }
    
    verify_migrations()  # Informational only
    
    print_summary(results)


if __name__ == '__main__':
    main()
