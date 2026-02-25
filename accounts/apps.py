from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'
    verbose_name = 'User Accounts'

    def ready(self):
        import accounts.models  # noqa: Import to register signals
        try:
            from django.contrib.auth import get_user_model

            User = get_user_model()

            # TEMPORARY DEMO CODE - REMOVE AFTER REVIEW
            if not User.objects.filter(username='admin').exists():
                User.objects.create_superuser(
                    username='admin',
                    email='admin@gmail.com',
                    password='admin123',
                    is_active=True,
                )

            if not User.objects.filter(username='student').exists():
                User.objects.create_user(
                    username='student',
                    email='student@gmail.com',
                    password='student123',
                    is_active=True,
                )
        except Exception:
            return
