from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
from django.utils import timezone


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('live_sessions', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='livesession',
            name='start_time',
            field=models.DateTimeField(auto_now_add=True, default=timezone.now, help_text='When the live session was created'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='livesession',
            name='end_time',
            field=models.DateTimeField(blank=True, help_text='When the live session ended', null=True),
        ),
        migrations.AlterField(
            model_name='livesession',
            name='is_active',
            field=models.BooleanField(default=True, help_text='Whether the live session is currently active'),
        ),
        migrations.CreateModel(
            name='LiveSessionParticipant',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('joined_at', models.DateTimeField(auto_now_add=True)),
                ('session', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='participants', to='live_sessions.livesession')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Live Session Participant',
                'verbose_name_plural': 'Live Session Participants',
                'app_label': 'live_sessions',
            },
        ),
        migrations.AddConstraint(
            model_name='livesessionparticipant',
            constraint=models.UniqueConstraint(fields=('session', 'user'), name='unique_session_user'),
        ),
        migrations.AddIndex(
            model_name='livesessionparticipant',
            index=models.Index(fields=['session', 'user'], name='live_sessio_session_user_idx'),
        ),
    ]
