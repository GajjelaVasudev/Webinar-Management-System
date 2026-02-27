from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from webinars.models import Event
from registrations.models import Registration
from .models import LiveSession, LiveSessionParticipant


User = get_user_model()


class LiveSessionAPITests(APITestCase):
    """API smoke tests for live session endpoints"""
    
    def setUp(self):
        """Create test users, webinar, and registrations"""
        self.client = APIClient()
        
        # Create organizer (using is_staff to auto-set admin role via signal)
        self.organizer = User.objects.create_user(
            username='organizer',
            email='organizer@test.com',
            password='testpass123',
            is_staff=True
        )
        
        # Create student users
        self.student1 = User.objects.create_user(
            username='student1',
            email='student1@test.com',
            password='testpass123'
        )
        
        self.student2 = User.objects.create_user(
            username='student2',
            email='student2@test.com',
            password='testpass123'
        )
        
        # Create test webinar
        self.webinar = Event.objects.create(
            title='Test Live Webinar',
            description='A test webinar for live sessions',
            date='2026-03-15',
            time='14:00:00',
            duration=60,
            organizer=self.organizer,
        )
        
        # Register student1 for webinar
        Registration.objects.create(
            user=self.student1,
            event=self.webinar
        )
    
    def test_start_session_as_organizer(self):
        """Test organizer can start a live session"""
        self.client.force_authenticate(user=self.organizer)
        
        url = f'/api/live/start/{self.webinar.id}/'
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('room_name', response.data)
        self.assertTrue(response.data['is_active'])
        
        # Verify session created in database
        live_session = LiveSession.objects.get(webinar=self.webinar)
        self.assertTrue(live_session.is_active)
        self.assertIsNone(live_session.end_time)
        self.assertIsNotNone(live_session.start_time)
    
    def test_start_session_returns_existing_active_session(self):
        """Test starting session twice returns existing active session"""
        self.client.force_authenticate(user=self.organizer)
        
        url = f'/api/live/start/{self.webinar.id}/'
        
        # Start session first time
        response1 = self.client.post(url)
        room_name_1 = response1.data['room_name']
        
        # Start session second time
        response2 = self.client.post(url)
        room_name_2 = response2.data['room_name']
        
        # Should return same room name
        self.assertEqual(room_name_1, room_name_2)
        
        # Should only have one session in database
        self.assertEqual(LiveSession.objects.filter(webinar=self.webinar).count(), 1)
    
    def test_start_session_unauthorized(self):
        """Test non-organizer cannot start a session"""
        self.client.force_authenticate(user=self.student1)
        
        url = f'/api/live/start/{self.webinar.id}/'
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('error', response.data)
    
    def test_start_session_unauthenticated(self):
        """Test unauthenticated user cannot start a session"""
        url = f'/api/live/start/{self.webinar.id}/'
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_start_session_nonexistent_webinar(self):
        """Test starting session for non-existent webinar returns 404"""
        self.client.force_authenticate(user=self.organizer)
        
        url = '/api/live/start/99999/'
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_join_session_as_registered_student(self):
        """Test registered student can join active session"""
        # First, organizer starts the session
        self.client.force_authenticate(user=self.organizer)
        start_url = f'/api/live/start/{self.webinar.id}/'
        self.client.post(start_url)
        
        # Then student joins
        self.client.force_authenticate(user=self.student1)
        join_url = f'/api/live/join/{self.webinar.id}/'
        response = self.client.get(join_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('room_name', response.data)
        self.assertTrue(response.data['is_active'])
        self.assertIn('participant_count', response.data)
        
        # Verify participant record created
        live_session = LiveSession.objects.get(webinar=self.webinar)
        participant = LiveSessionParticipant.objects.filter(
            session=live_session,
            user=self.student1
        ).first()
        self.assertIsNotNone(participant)
    
    def test_join_session_unregistered_student_denied(self):
        """Test unregistered student cannot join session"""
        # Start session as organizer
        self.client.force_authenticate(user=self.organizer)
        start_url = f'/api/live/start/{self.webinar.id}/'
        self.client.post(start_url)
        
        # Try to join as unregistered student
        self.client.force_authenticate(user=self.student2)
        join_url = f'/api/live/join/{self.webinar.id}/'
        response = self.client.get(join_url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('error', response.data)
    
    def test_join_session_organizer_allowed(self):
        """Test organizer can join their own session"""
        self.client.force_authenticate(user=self.organizer)
        
        # Start session
        start_url = f'/api/live/start/{self.webinar.id}/'
        self.client.post(start_url)
        
        # Join session as organizer
        join_url = f'/api/live/join/{self.webinar.id}/'
        response = self.client.get(join_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_join_inactive_session_denied(self):
        """Test cannot join inactive session"""
        # Create inactive session
        live_session = LiveSession.objects.create(
            webinar=self.webinar,
            started_by=self.organizer,
            is_active=False,
            end_time=timezone.now()
        )
        
        self.client.force_authenticate(user=self.student1)
        join_url = f'/api/live/join/{self.webinar.id}/'
        response = self.client.get(join_url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('not active', response.data['error'].lower())
    
    def test_join_nonexistent_session(self):
        """Test joining non-existent session returns 404"""
        self.client.force_authenticate(user=self.student1)
        
        join_url = f'/api/live/join/{self.webinar.id}/'
        response = self.client.get(join_url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_join_session_tracks_participants(self):
        """Test joining session tracks unique participants"""
        # Start session
        self.client.force_authenticate(user=self.organizer)
        start_url = f'/api/live/start/{self.webinar.id}/'
        self.client.post(start_url)
        
        # Join as student multiple times
        self.client.force_authenticate(user=self.student1)
        join_url = f'/api/live/join/{self.webinar.id}/'
        
        response1 = self.client.get(join_url)
        count1 = response1.data['participant_count']
        
        response2 = self.client.get(join_url)
        count2 = response2.data['participant_count']
        
        # Participant count should be same (unique constraint)
        self.assertEqual(count1, count2)
        
        # Should only have one participant record
        live_session = LiveSession.objects.get(webinar=self.webinar)
        self.assertEqual(live_session.participants.count(), 1)
    
    def test_end_session_as_organizer(self):
        """Test organizer can end active session"""
        self.client.force_authenticate(user=self.organizer)
        
        # Start session
        start_url = f'/api/live/start/{self.webinar.id}/'
        self.client.post(start_url)
        
        # End session
        end_url = f'/api/live/end/{self.webinar.id}/'
        response = self.client.post(end_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertIn('end_time', response.data)
        
        # Verify session marked as inactive
        live_session = LiveSession.objects.get(webinar=self.webinar)
        self.assertFalse(live_session.is_active)
        self.assertIsNotNone(live_session.end_time)
    
    def test_end_session_unauthorized(self):
        """Test non-organizer cannot end session"""
        # Start session as organizer
        self.client.force_authenticate(user=self.organizer)
        start_url = f'/api/live/start/{self.webinar.id}/'
        self.client.post(start_url)
        
        # Try to end as student
        self.client.force_authenticate(user=self.student1)
        end_url = f'/api/live/end/{self.webinar.id}/'
        response = self.client.post(end_url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_end_session_no_active_session(self):
        """Test ending session when no active session exists"""
        self.client.force_authenticate(user=self.organizer)
        
        end_url = f'/api/live/end/{self.webinar.id}/'
        response = self.client.post(end_url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('error', response.data)
    
    def test_status_endpoint_active_session(self):
        """Test status endpoint returns correct info for active session"""
        # Start session
        self.client.force_authenticate(user=self.organizer)
        start_url = f'/api/live/start/{self.webinar.id}/'
        start_response = self.client.post(start_url)
        room_name = start_response.data['room_name']
        
        # Check status (no auth required)
        self.client.force_authenticate(user=None)
        status_url = f'/api/live/status/{self.webinar.id}/'
        response = self.client.get(status_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_active'])
        self.assertEqual(response.data['room_name'], room_name)
    
    def test_status_endpoint_no_session(self):
        """Test status endpoint when no session exists"""
        status_url = f'/api/live/status/{self.webinar.id}/'
        response = self.client.get(status_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['is_active'])
        self.assertIsNone(response.data['room_name'])
    
    def test_analytics_endpoint_as_admin(self):
        """Test admin can access analytics endpoint"""
        self.client.force_authenticate(user=self.organizer)
        
        # Create some test data
        # Start and end a session
        start_url = f'/api/live/start/{self.webinar.id}/'
        self.client.post(start_url)
        
        # Join with student
        self.client.force_authenticate(user=self.student1)
        join_url = f'/api/live/join/{self.webinar.id}/'
        self.client.get(join_url)
        
        # End session
        self.client.force_authenticate(user=self.organizer)
        end_url = f'/api/live/end/{self.webinar.id}/'
        self.client.post(end_url)
        
        # Get analytics
        analytics_url = '/api/live/analytics/'
        response = self.client.get(analytics_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_webinars', response.data)
        self.assertIn('total_live_sessions', response.data)
        self.assertIn('total_participants', response.data)
        self.assertIn('average_session_duration_minutes', response.data)
        self.assertIn('sessions_per_webinar', response.data)
        self.assertIn('active_sessions', response.data)
        self.assertIn('completed_sessions', response.data)
        
        # Verify values
        self.assertEqual(response.data['total_webinars'], 1)
        self.assertEqual(response.data['total_live_sessions'], 1)
        self.assertEqual(response.data['total_participants'], 1)
        self.assertEqual(response.data['active_sessions'], 0)
        self.assertEqual(response.data['completed_sessions'], 1)
        self.assertIsNotNone(response.data['average_session_duration_minutes'])
        self.assertIsInstance(response.data['sessions_per_webinar'], list)
    
    def test_analytics_endpoint_unauthorized(self):
        """Test non-admin cannot access analytics"""
        self.client.force_authenticate(user=self.student1)
        
        analytics_url = '/api/live/analytics/'
        response = self.client.get(analytics_url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_analytics_endpoint_unauthenticated(self):
        """Test unauthenticated user cannot access analytics"""
        analytics_url = '/api/live/analytics/'
        response = self.client.get(analytics_url)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_analytics_multiple_sessions(self):
        """Test analytics with multiple sessions and participants"""
        # Create another webinar
        webinar2 = Event.objects.create(
            title='Second Test Webinar',
            description='Another test',
            date='2026-03-20',
            time='15:00:00',
            duration=90,
            organizer=self.organizer,
        )
        
        # Register student2 for webinar2
        Registration.objects.create(
            user=self.student2,
            event=webinar2
        )
        
        self.client.force_authenticate(user=self.organizer)
        
        # Start session 1
        self.client.post(f'/api/live/start/{self.webinar.id}/')
        
        # Join session 1
        self.client.force_authenticate(user=self.student1)
        self.client.get(f'/api/live/join/{self.webinar.id}/')
        
        # Start session 2
        self.client.force_authenticate(user=self.organizer)
        self.client.post(f'/api/live/start/{webinar2.id}/')
        
        # Join session 2 with student2
        self.client.force_authenticate(user=self.student2)
        self.client.get(f'/api/live/join/{webinar2.id}/')
        
        # Get analytics
        self.client.force_authenticate(user=self.organizer)
        response = self.client.get('/api/live/analytics/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_webinars'], 2)
        self.assertEqual(response.data['total_live_sessions'], 2)
        self.assertEqual(response.data['total_participants'], 2)
        self.assertEqual(response.data['active_sessions'], 2)
        self.assertEqual(response.data['completed_sessions'], 0)
        self.assertEqual(len(response.data['sessions_per_webinar']), 2)
    
    def test_analytics_sessions_per_webinar_format(self):
        """Test sessions_per_webinar has correct format"""
        self.client.force_authenticate(user=self.organizer)
        
        # Create session
        self.client.post(f'/api/live/start/{self.webinar.id}/')
        
        # Join with student
        self.client.force_authenticate(user=self.student1)
        self.client.get(f'/api/live/join/{self.webinar.id}/')
        
        # Get analytics
        self.client.force_authenticate(user=self.organizer)
        response = self.client.get('/api/live/analytics/')
        
        sessions = response.data['sessions_per_webinar']
        self.assertTrue(len(sessions) > 0)
        
        # Check first session has required fields
        first_session = sessions[0]
        self.assertIn('webinar_id', first_session)
        self.assertIn('title', first_session)
        self.assertIn('participant_count', first_session)
        
        # Verify values
        self.assertEqual(first_session['webinar_id'], self.webinar.id)
        self.assertEqual(first_session['title'], self.webinar.title)
        self.assertEqual(first_session['participant_count'], 1)
    
    def test_analytics_duration_calculation(self):
        """Test average session duration calculation"""
        from datetime import timedelta
        
        self.client.force_authenticate(user=self.organizer)
        
        # Start and end session
        self.client.post(f'/api/live/start/{self.webinar.id}/')
        
        # Manually set duration by updating the session
        session = LiveSession.objects.get(webinar=self.webinar)
        session.end_time = session.start_time + timedelta(minutes=30)
        session.is_active = False
        session.save()
        
        # Get analytics
        response = self.client.get('/api/live/analytics/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        avg_duration = response.data['average_session_duration_minutes']
        self.assertIsNotNone(avg_duration)
        # Should be approximately 30 minutes
        self.assertAlmostEqual(avg_duration, 30.0, delta=1.0)


class LiveSessionModelTests(TestCase):
    """Test LiveSession and LiveSessionParticipant models"""
    
    def setUp(self):
        self.organizer = User.objects.create_user(
            username='organizer',
            email='organizer@test.com',
            password='testpass123'
        )
        
        self.student = User.objects.create_user(
            username='student',
            email='student@test.com',
            password='testpass123'
        )
        
        self.webinar = Event.objects.create(
            title='Model Test Webinar',
            description='Testing models',
            date='2026-03-15',
            time='14:00:00',
            organizer=self.organizer,
        )
    
    def test_room_name_auto_generated(self):
        """Test room name is automatically generated"""
        session = LiveSession.objects.create(
            webinar=self.webinar,
            started_by=self.organizer
        )
        
        self.assertIsNotNone(session.room_name)
        self.assertIn(str(self.webinar.id), session.room_name)
    
    def test_start_time_auto_set(self):
        """Test start_time is automatically set on creation"""
        session = LiveSession.objects.create(
            webinar=self.webinar,
            started_by=self.organizer
        )
        
        self.assertIsNotNone(session.start_time)
    
    def test_is_active_defaults_true(self):
        """Test is_active defaults to True"""
        session = LiveSession.objects.create(
            webinar=self.webinar,
            started_by=self.organizer
        )
        
        self.assertTrue(session.is_active)
    
    def test_end_time_nullable(self):
        """Test end_time can be null"""
        session = LiveSession.objects.create(
            webinar=self.webinar,
            started_by=self.organizer
        )
        
        self.assertIsNone(session.end_time)
    
    def test_participant_unique_constraint(self):
        """Test unique constraint on session+user"""
        session = LiveSession.objects.create(
            webinar=self.webinar,
            started_by=self.organizer
        )
        
        # Create first participant
        LiveSessionParticipant.objects.create(
            session=session,
            user=self.student
        )
        
        # Try to create duplicate - should use get_or_create in practice
        participant, created = LiveSessionParticipant.objects.get_or_create(
            session=session,
            user=self.student
        )
        
        self.assertFalse(created)
        self.assertEqual(LiveSessionParticipant.objects.filter(session=session).count(), 1)
    
    def test_participant_joined_at_auto_set(self):
        """Test joined_at is automatically set"""
        session = LiveSession.objects.create(
            webinar=self.webinar,
            started_by=self.organizer
        )
        
        participant = LiveSessionParticipant.objects.create(
            session=session,
            user=self.student
        )
        
        self.assertIsNotNone(participant.joined_at)
    
    def test_session_string_representation(self):
        """Test __str__ method of LiveSession"""
        session = LiveSession.objects.create(
            webinar=self.webinar,
            started_by=self.organizer
        )
        
        expected = f"Live Session - {self.webinar.title}"
        self.assertEqual(str(session), expected)
    
    def test_participant_cascade_delete(self):
        """Test participants are deleted when session is deleted"""
        session = LiveSession.objects.create(
            webinar=self.webinar,
            started_by=self.organizer
        )
        
        LiveSessionParticipant.objects.create(
            session=session,
            user=self.student
        )
        
        session_id = session.id
        session.delete()
        
        # Participants should be deleted
        self.assertEqual(
            LiveSessionParticipant.objects.filter(session_id=session_id).count(),
            0
        )
