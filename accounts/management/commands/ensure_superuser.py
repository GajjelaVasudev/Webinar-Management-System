import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from decouple import config


class Command(BaseCommand):
    help = "Create or update a superuser from environment variables in an idempotent way."

    def add_arguments(self, parser):
        parser.add_argument("--username", type=str, help="Superuser username")
        parser.add_argument("--email", type=str, help="Superuser email")
        parser.add_argument("--password", type=str, help="Superuser password")
        parser.add_argument(
            "--update-password",
            action="store_true",
            help="Update password for existing user to provided value",
        )

    def handle(self, *args, **options):
        username = (
            options.get("username")
            or os.environ.get("DJANGO_SUPERUSER_USERNAME")
            or config("DJANGO_SUPERUSER_USERNAME", default="")
        )
        email = (
            options.get("email")
            or os.environ.get("DJANGO_SUPERUSER_EMAIL")
            or config("DJANGO_SUPERUSER_EMAIL", default="")
        )
        password = (
            options.get("password")
            or os.environ.get("DJANGO_SUPERUSER_PASSWORD")
            or config("DJANGO_SUPERUSER_PASSWORD", default="")
        )
        update_password = bool(options.get("update_password"))

        if not username:
            self.stdout.write(self.style.WARNING("Skipped: DJANGO_SUPERUSER_USERNAME is not set."))
            return

        if not email:
            raise CommandError("DJANGO_SUPERUSER_EMAIL is required.")

        if not password:
            raise CommandError("DJANGO_SUPERUSER_PASSWORD is required.")

        User = get_user_model()

        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": email,
                "is_staff": True,
                "is_superuser": True,
                "is_active": True,
            },
        )

        changed_fields = []

        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Created superuser: {username}"))
            return

        # Keep existing user but enforce superuser flags for consistency.
        if user.email != email:
            user.email = email
            changed_fields.append("email")

        if not user.is_active:
            user.is_active = True
            changed_fields.append("is_active")

        if not user.is_staff:
            user.is_staff = True
            changed_fields.append("is_staff")

        if not user.is_superuser:
            user.is_superuser = True
            changed_fields.append("is_superuser")

        if update_password:
            user.set_password(password)
            changed_fields.append("password")

        if changed_fields:
            user.save()
            if "password" in changed_fields:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Updated superuser {username}: {', '.join(changed_fields)}"
                    )
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Updated superuser {username}: {', '.join(changed_fields)}"
                    )
                )
        else:
            self.stdout.write(self.style.SUCCESS(f"Superuser already in sync: {username}"))
