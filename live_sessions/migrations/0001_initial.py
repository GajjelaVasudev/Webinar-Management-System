# Generated migration for live_sessions app

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('webinars', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='LiveSession',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('room_name', models.CharField(help_text='Jitsi Meet room name', max_length=255, unique=True)),
                ('is_active', models.BooleanField(default=False, help_text='Whether the live session is currently active')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('started_at', models.DateTimeField(blank=True, help_text='When the live session was started', null=True)),
                ('started_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='started_live_sessions', to=settings.AUTH_USER_MODEL)),
                ('webinar', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='live_session', to='webinars.event')),
            ],
            options={
                'verbose_name': 'Live Session',
                'verbose_name_plural': 'Live Sessions',
                'app_label': 'live_sessions',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='livesession',
            index=models.Index(fields=['webinar'], name='live_sessio_webinar_idx'),
        ),
        migrations.AddIndex(
            model_name='livesession',
            index=models.Index(fields=['is_active'], name='live_sessio_is_acti_idx'),
        ),
    ]
