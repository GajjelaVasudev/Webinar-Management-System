import logging
from django.apps import AppConfig

logger = logging.getLogger(__name__)


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'
    verbose_name = 'User Accounts'

    def ready(self):
        import accounts.models  # noqa: Import to register signals
        
        # Log email configuration on startup
        from django.conf import settings
        logger.info("=" * 80)
        logger.info("STARTUP: Email Configuration Check")
        logger.info("=" * 80)
        
        if 'sendgrid' in settings.EMAIL_BACKEND:
            logger.info(f"EMAIL_BACKEND: SendGrid API")
            if hasattr(settings, 'SENDGRID_API_KEY') and settings.SENDGRID_API_KEY:
                logger.info(f"SendGrid API Key: [CONFIGURED]")
                logger.info("[OK] SendGrid is configured")
            else:
                logger.warning("SendGrid API Key not configured")
        else:
            logger.info(f"EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
            logger.info(f"EMAIL_HOST: {settings.EMAIL_HOST}")
            logger.info(f"EMAIL_PORT: {settings.EMAIL_PORT}")
            logger.info(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
            logger.info(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER or '(NOT SET)'}")
            logger.info(f"DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL or '(NOT SET)'}")
            
            # Verify SMTP credentials are set
            if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
                logger.warning("WARNING: EMAIL_HOST_USER or EMAIL_HOST_PASSWORD not configured - email sending will fail!")
            else:
                logger.info("[OK] Email credentials are configured")
        
        logger.info("=" * 80)
        
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
                logger.info("Created demo admin user")

            if not User.objects.filter(username='student').exists():
                User.objects.create_user(
                    username='student',
                    email='student@gmail.com',
                    password='student123',
                    is_active=True,
                )
                logger.info("Created demo student user")
        except Exception as e:
            logger.error(f"Error during app startup: {str(e)}")
            return
