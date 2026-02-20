#!/usr/bin/env python
"""
Local Verification Script for Render Deployment
Run this before deploying to Render to catch configuration issues

Usage:
    python verify_render_config.py
"""

import os
import sys
import json
from pathlib import Path

# Color codes for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def check_result(condition, message):
    """Print check result"""
    status = f"{Colors.GREEN}✓{Colors.RESET}" if condition else f"{Colors.RED}✗{Colors.RESET}"
    print(f"  {status} {message}")
    return condition

def main():
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BLUE}Render Deployment Configuration Checks{Colors.RESET}")
    print(f"{Colors.BLUE}{'='*60}{Colors.RESET}\n")
    
    base_path = Path(__file__).parent
    all_passed = True

    # ==================== Check 1: Frontend Config ====================
    print(f"{Colors.BLUE}1. Frontend Configuration{Colors.RESET}")
    
    env_prod_path = base_path / "frontend" / ".env.production"
    if env_prod_path.exists():
        with open(env_prod_path) as f:
            content = f.read()
            has_api = "/api" in content
            all_passed &= check_result(
                has_api,
                f"Frontend .env.production includes '/api' in URL"
            )
            if has_api:
                print(f"     Found: {content.strip()}")
    else:
        all_passed &= check_result(False, "frontend/.env.production exists")

    # ==================== Check 2: Requirements ====================
    print(f"\n{Colors.BLUE}2. Python Dependencies{Colors.RESET}")
    
    req_path = base_path / "requirements.txt"
    if req_path.exists():
        with open(req_path) as f:
            content = f.read()
            has_postgres = "psycopg2" in content and not content.split("psycopg2")[0].split("\n")[-1].strip().startswith("#")
            all_passed &= check_result(
                has_postgres,
                "psycopg2-binary is uncommented in requirements.txt"
            )
            
            has_drf = "djangorestframework" in content
            all_passed &= check_result(
                has_drf,
                "Django REST Framework is installed"
            )
            
            has_cors = "django-cors" in content and "corsheaders" in content
            all_passed &= check_result(
                has_cors,
                "django-cors-headers is installed"
            )
    else:
        all_passed &= check_result(False, "requirements.txt exists")

    # ==================== Check 3: Django Settings ====================
    print(f"\n{Colors.BLUE}3. Django Settings{Colors.RESET}")
    
    settings_path = base_path / "webinar_system" / "settings.py"
    if settings_path.exists():
        with open(settings_path) as f:
            content = f.read()
            
            # Check CORS includes Render domain
            has_cors_render = "webinar-management-system-odoq.onrender.com" in content
            all_passed &= check_result(
                has_cors_render,
                "CORS_ALLOWED_ORIGINS includes Render domain"
            )
            
            # Check trailing slash
            has_append_slash = "APPEND_SLASH" in content
            all_passed &= check_result(
                has_append_slash,
                "REST_FRAMEWORK APPEND_SLASH is configured"
            )
            
            # Check PostgreSQL support
            has_postgres_config = "django.db.backends.postgresql" in content
            all_passed &= check_result(
                has_postgres_config,
                "PostgreSQL database backend configured"
            )
            
            # Check accounts app
            has_accounts_app = "'accounts'" in content
            all_passed &= check_result(
                has_accounts_app,
                "accounts app is in INSTALLED_APPS"
            )
    else:
        all_passed &= check_result(False, "webinar_system/settings.py exists")

    # ==================== Check 4: URL Configuration ====================
    print(f"\n{Colors.BLUE}4. URL Configuration{Colors.RESET}")
    
    urls_path = base_path / "webinar_system" / "urls.py"
    if urls_path.exists():
        with open(urls_path) as f:
            content = f.read()
            
            has_api_pattern = "path('api/'," in content or 'path("api/",' in content
            all_passed &= check_result(
                has_api_pattern,
                "API URL pattern defined at /api/"
            )
            
            has_accounts_include = "'accounts'" in content and "include" in content
            all_passed &= check_result(
                has_accounts_include,
                "accounts app is included in URL patterns"
            )
    else:
        all_passed &= check_result(False, "webinar_system/urls.py exists")

    # ==================== Check 5: Accounts URLs ====================
    print(f"\n{Colors.BLUE}5. Accounts App Configuration{Colors.RESET}")
    
    accounts_urls = base_path / "accounts" / "urls.py"
    if accounts_urls.exists():
        with open(accounts_urls) as f:
            content = f.read()
            
            has_register = "'auth/register/'" in content or '"auth/register/"' in content
            all_passed &= check_result(
                has_register,
                "Register endpoint defined at /auth/register/"
            )
            
            has_me_endpoint = "def me(self" in content
            all_passed &= check_result(
                has_me_endpoint,
                "User 'me' endpoint defined in ViewSet"
            )
    else:
        all_passed &= check_result(False, "accounts/urls.py exists")

    # ==================== Check 6: Build Script ====================
    print(f"\n{Colors.BLUE}6. Render Deployment Configuration{Colors.RESET}")
    
    build_script = base_path / "render-build.sh"
    all_passed &= check_result(
        build_script.exists(),
        "render-build.sh exists"
    )
    
    render_yaml = base_path / "render.yaml"
    all_passed &= check_result(
        render_yaml.exists(),
        "render.yaml exists"
    )

    # ==================== Summary ====================
    print(f"\n{Colors.BLUE}{'='*60}{Colors.RESET}")
    if all_passed:
        print(f"{Colors.GREEN}✓ All checks passed! Ready for Render deployment.{Colors.RESET}")
        print(f"\n{Colors.YELLOW}Next steps:{Colors.RESET}")
        print(f"  1. Create PostgreSQL database on Render")
        print(f"  2. Add environment variables to Render Web Service")
        print(f"  3. Push code to GitHub")
        print(f"  4. Trigger deploy on Render")
        print(f"  5. Monitor logs: {Colors.BLUE}Dashboard → Logs{Colors.RESET}")
        return 0
    else:
        print(f"{Colors.RED}✗ Some checks failed. Review the issues above.{Colors.RESET}")
        print(f"\n{Colors.YELLOW}For detailed guidance, see:{Colors.RESET}")
        print(f"  - RENDER_404_FIX_GUIDE.md")
        print(f"  - RENDER_DEPLOYMENT_CHECKLIST.md")
        print(f"  - POSTGRESQL_RENDER_SETUP.md")
        return 1

if __name__ == "__main__":
    sys.exit(main())
