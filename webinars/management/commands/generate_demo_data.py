from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import datetime, timedelta
from webinars.models import Event
from recordings.models import Recording
from communications.models import Announcement, UserNotification, WebinarChatMessage
from registrations.models import Registration
from decimal import Decimal
import random


class Command(BaseCommand):
    help = 'Generate realistic demo data for review purposes'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Starting demo data generation...'))

        # Get or create admin user for organizing webinars
        admin_user, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@gmail.com',
                'is_staff': True,
                'is_superuser': True,
            }
        )

        # Get the student user
        try:
            student_user = User.objects.get(username='student')
        except User.DoesNotExist:
            student_user = User.objects.create_user(
                username='student',
                email='student@gmail.com',
                password='student123'
            )
            self.stdout.write(self.style.WARNING(f'Created student user: {student_user.username}'))

        # Demo webinar data with future dates
        base_date = timezone.now().date()
        
        webinar_data = [
            {
                'title': 'Python for Data Science: Fundamentals',
                'description': 'Learn the essentials of Python programming for data analysis and visualization. This comprehensive course covers NumPy, Pandas, and Matplotlib.',
                'dates_offset': [7, 14, 21],  # 7, 14, 21 days from now
                'price': 49.99,
            },
            {
                'title': 'Web Development with Django & React',
                'description': 'Master full-stack web development using Django REST Framework and React. Build modern, scalable web applications from scratch.',
                'dates_offset': [5, 12, 19],
                'price': 79.99,
            },
            {
                'title': 'Cloud Computing on AWS: A Practical Guide',
                'description': 'Explore AWS services, EC2, S3, Lambda, and RDS. Learn to deploy and manage applications at scale in the cloud.',
                'dates_offset': [10, 17, 24],
                'price': 59.99,
            },
            {
                'title': 'Machine Learning: From Theory to Practice',
                'description': 'Understand ML algorithms, scikit-learn, TensorFlow, and real-world applications. Build predictive models and deploy them.',
                'dates_offset': [6, 13, 20],
                'price': 99.99,
            },
            {
                'title': 'DevOps & CI/CD: Modern Deployment Strategies',
                'description': 'Learn Docker, Kubernetes, GitHub Actions, and Jenkins. Automate your entire deployment pipeline.',
                'dates_offset': [8, 15, 22],
                'price': 69.99,
            },
        ]

        created_events = []
        registered_webinar_ids = []

        # Create webinars and sessions
        for idx, webinar_info in enumerate(webinar_data):
            self.stdout.write(f'\n📚 Creating webinar: {webinar_info["title"]}')
            
            for session_num, days_offset in enumerate(webinar_info['dates_offset'], 1):
                event_date = base_date + timedelta(days=days_offset)
                event_time_hour = 10 + (idx % 4)  # Vary times: 10 AM to 1 PM
                event_time_minute = random.choice([0, 30])
                
                # Modify title for sessions
                if len(webinar_info['dates_offset']) > 1:
                    event_title = f"{webinar_info['title']} - Session {session_num}"
                else:
                    event_title = webinar_info['title']
                
                event = Event.objects.create(
                    title=event_title,
                    description=f"{webinar_info['description']}\n\nSession {session_num}: Practical exercises and Q&A included.",
                    date=event_date,
                    time=timezone.datetime.strptime(f"{event_time_hour:02d}:{event_time_minute:02d}", "%H:%M").time(),
                    duration=random.choice([60, 75, 90]),  # Different durations
                    price=webinar_info['price'],
                    organizer=admin_user,
                    live_stream_url='https://www.youtube.com/embed/sample' if random.random() > 0.3 else '',
                )
                
                created_events.append(event)
                self.stdout.write(f'  ✓ Session {session_num}: {event.title} on {event.date}')

                # Register student to first 2+ webinars
                if idx < 2 or (idx < 3 and session_num == 1):
                    try:
                        Registration.objects.get_or_create(
                            user=student_user,
                            event=event,
                        )
                        self.stdout.write(self.style.SUCCESS(f'    ✓ Registered student to: {event.title}'))
                        if event.id not in registered_webinar_ids:
                            registered_webinar_ids.append(event.id)
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f'    ✗ Registration failed: {e}'))

        # Create recordings for completed/past webinars
        self.stdout.write('\n🎥 Creating recordings...')
        recording_urls = [
            'https://www.youtube.com/embed/jNQXAC9IVRw',
            'https://www.youtube.com/embed/dQw4w9WgXcQ',
            'https://www.youtube.com/embed/8HBPzaAOh8Q',
            'https://www.youtube.com/embed/2diVQdp3GY4',
            'https://www.youtube.com/embed/GP-1h4YKPyU',
        ]

        for idx, event in enumerate(created_events[:len(webinar_data)]):  # One recording per main webinar
            recording = Recording.objects.create(
                event=event,
                recording_link=recording_urls[idx % len(recording_urls)],
                title=f'Recording: {event.title}',
                description=f'Full recording of {event.title}. This session covers all key topics and includes Q&A.',
                duration_minutes=event.duration,
                uploaded_by=admin_user,
                is_public=True,
            )
            self.stdout.write(f'  ✓ Recording created for: {event.title}')

        # Create announcements
        self.stdout.write('\n📢 Creating announcements...')
        announcements_data = [
            {
                'title': 'Welcome to our Platform!',
                'content': 'Welcome to the Professional Development Learning Platform. We\'re excited to have you here. Explore our extensive catalog of courses and webinars to enhance your skills.',
            },
            {
                'title': 'New Courses Available',
                'content': 'Check out our newly launched courses on AI, Cloud Computing, and DevOps. Special launch pricing available for the first 100 enrollments!',
            },
            {
                'title': 'Upcoming Live Demo Sessions',
                'content': 'Join us for live demo sessions every Friday at 2 PM EST. Meet our instructors, ask questions, and network with other learners.',
            },
            {
                'title': 'Certificate of Completion Now Available',
                'content': 'After completing any course, you can now download your Certificate of Completion. Add it to your LinkedIn profile and resume!',
            },
        ]

        announcements = []
        for ann_data in announcements_data:
            announcement = Announcement.objects.create(
                sender=admin_user,
                title=ann_data['title'],
                content=ann_data['content'],
            )
            announcements.append(announcement)
            self.stdout.write(f'  ✓ Announcement: {announcement.title}')

        # Create user notifications for student
        self.stdout.write('\n🔔 Creating notifications for student user...')
        notification_messages = [
            ('announcement', 'Welcome!', 'Welcome to the platform. Start exploring our webinars.', announcements[0]),
            ('upcoming_webinar', 'Upcoming: Python for Data Science', 'Your registered webinar starts tomorrow!', None),
            ('new_recording', 'New Recording Available', 'Check out the latest recording from Web Development course.', None),
        ]

        for notif_type, title, content, announcement in notification_messages:
            UserNotification.objects.create(
                user=student_user,
                notification_type=notif_type,
                title=title,
                content=content,
                announcement=announcement if notif_type == 'announcement' else None,
            )
            self.stdout.write(f'  ✓ Notification: {title}')

        # Add some chat messages to registered webinars
        self.stdout.write('\n💬 Adding chat messages...')
        chat_messages = [
            'Great explanation! Really helpful.',
            'Can you repeat that last part?',
            'This is amazing content!',
            'Will the recording be available?',
            'Thank you for this comprehensive course.',
            'Love the real-world examples.',
            'Looking forward to the next session.',
            'Any resources for further learning?',
            'Excellent teaching style!',
            'Following along perfectly.',
        ]

        # Add messages to first registered webinar
        if registered_webinar_ids:
            event = Event.objects.get(id=registered_webinar_ids[0])
            for i, message in enumerate(chat_messages[:5]):
                WebinarChatMessage.objects.create(
                    event=event,
                    user=student_user,
                    message=message,
                )
                self.stdout.write(f'  ✓ Message: "{message}"')

        # Summary
        self.stdout.write(self.style.SUCCESS('\n✅ Demo data generation complete!'))
        self.stdout.write(self.style.SUCCESS(f'\n📊 Summary:'))
        self.stdout.write(f'  • Created {len(created_events)} webinar sessions')
        self.stdout.write(f'  • Generated {len(webinar_data)} unique webinar series')
        self.stdout.write(f'  • Student registered to {len(registered_webinar_ids)} webinars')
        self.stdout.write(f'  • Created {len(announcements)} announcements')
        self.stdout.write(f'  • Created 3 notifications for student')
        self.stdout.write(f'  • Added 5 chat messages to webinars')
        self.stdout.write(f'\n🎓 Student Credentials: student / student123')
        self.stdout.write(f'📌 Dashboard Counts: ')
        self.stdout.write(f'  • {len(created_events)} total webinars/sessions')
        self.stdout.write(f'  • {len(registered_webinar_ids)} registered webinars (for student)')
        self.stdout.write(f'  • {len(webinar_data)} recordings')
        self.stdout.write(f'  • {len(announcements)} announcements')
