# Generated migration for email verification system

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_userprofile_profile_picture_alter_userprofile_role'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='is_email_verified',
            field=models.BooleanField(default=False, help_text='Whether user has verified their email address'),
        ),
        migrations.CreateModel(
            name='EmailVerification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('otp_hash', models.CharField(help_text='Hashed OTP for email verification', max_length=128)),
                ('created_at', models.DateTimeField(auto_now=True, help_text='Timestamp when OTP was created')),
                ('attempts', models.IntegerField(default=0, help_text='Number of failed OTP verification attempts')),
                ('resent_at', models.DateTimeField(blank=True, help_text='Timestamp when OTP was last resent', null=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='email_verification', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Email Verification',
                'verbose_name_plural': 'Email Verifications',
                'app_label': 'accounts',
            },
        ),
    ]
