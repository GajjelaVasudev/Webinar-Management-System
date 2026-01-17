import logging
import os

from django.apps import AppConfig
from django.contrib.auth import get_user_model
from django.db.utils import OperationalError, ProgrammingError

logger = logging.getLogger(__name__)


def _ensure_default_admin():
    """Create a default admin user when env vars are provided.

    This runs at startup so we can bootstrap a superuser on hosted platforms
    where shell access is not available.
    """
    username = os.environ.get("DEFAULT_ADMIN_USERNAME")
    password = os.environ.get("DEFAULT_ADMIN_PASSWORD")
    email = os.environ.get("DEFAULT_ADMIN_EMAIL", "")

    if not username or not password:
        return

    User = get_user_model()
    if User.objects.filter(username=username).exists():
        return

    User.objects.create_superuser(
        username=username,
        email=email or None,
        password=password,
    )
    logger.info("Created default admin user '%s' via env config", username)


class EventsConfig(AppConfig):
    name = 'events'
    default_auto_field = 'django.db.models.BigAutoField'
    
    def ready(self):
        import events.signals  # noqa

        try:
            _ensure_default_admin()
        except (OperationalError, ProgrammingError):
            # Database might not be ready during migrations
            pass
        except Exception as exc:  # pragma: no cover - best-effort bootstrapping
            logger.warning("Unable to create default admin: %s", exc)
