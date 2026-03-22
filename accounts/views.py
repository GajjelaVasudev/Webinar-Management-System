from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from django.contrib.auth import update_session_auth_hash
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
import logging

from .models import UserProfile, EmailVerification
from .serializers import (
    UserSerializer,
    UserProfileSerializer,
    UserRegistrationSerializer,
    EmailOrUsernameTokenObtainPairSerializer,
    ChangePasswordSerializer,
    UserListSerializer,
    UserRoleUpdateSerializer,
    VerifyEmailSerializer,
    ResendOTPSerializer,
    UserDebugStateSerializer,
)
from .permissions import IsAdmin
from .email_utils import create_or_update_email_verification, send_otp_email

logger = logging.getLogger(__name__)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom JWT token view that returns user data and includes role
    
    Login flow:
    1. Check if user exists
    2. Verify user.is_active (account deactivation)
    3. Verify user.profile.is_email_verified (email verification)
    4. If all checks pass, proceed with token generation
    """
    permission_classes = [AllowAny]
    serializer_class = EmailOrUsernameTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        # First check if user exists and is email verified
        login_identifier = request.data.get('username')
        user = None
        
        if login_identifier:
            # Accept either username or email for lookup
            user = User.objects.filter(username=login_identifier).first()
            if user is None and "@" in login_identifier:
                user = User.objects.filter(email__iexact=login_identifier).first()
        
        # GATING LOGIC: Apply checks in order
        if user:
            profile = UserProfile.objects.filter(user=user).first()
            is_admin_account = (
                user.is_superuser
                or user.is_staff
                or (profile is not None and profile.role == 'admin')
            )

            # CHECK 1: Account active gate
            # Admin accounts are auto-reactivated to avoid lockouts across envs.
            if not user.is_active:
                if is_admin_account:
                    user.is_active = True
                    user.save(update_fields=['is_active'])
                    logger.warning(
                        "Auto-reactivated admin account during login",
                        extra={'username': login_identifier, 'user_id': user.id}
                    )
                else:
                    logger.warning(
                        f"Login attempt for deactivated account",
                        extra={'username': login_identifier, 'user_id': user.id}
                    )
                    return Response(
                        {
                            'detail': 'Your account has been deactivated. Please contact support.',
                            'error_code': 'account_inactive'
                        },
                        status=status.HTTP_403_FORBIDDEN
                    )

            # Admin accounts should be able to authenticate in frontend dashboard
            # even when created via CLI without email verification workflow.
            if is_admin_account:
                profile, _ = UserProfile.objects.get_or_create(user=user)
                profile_updated = False
                if profile.role != 'admin':
                    profile.role = 'admin'
                    profile_updated = True
                if not profile.is_email_verified:
                    profile.is_email_verified = True
                    profile_updated = True
                if profile_updated:
                    profile.save(update_fields=['role', 'is_email_verified', 'updated_at'])
                    logger.info(
                        "Synced admin profile during login",
                        extra={'user_id': user.id, 'username': user.username}
                    )
            else:
                # CHECK 2: Non-admin user email must be verified
                try:
                    profile = user.profile
                    if not profile.is_email_verified:
                        logger.warning(
                            f"Login attempt for unverified email",
                            extra={'email': user.email, 'user_id': user.id}
                        )
                        return Response(
                            {
                                'detail': 'Please verify your email first.',
                                'email': user.email,
                                'error_code': 'email_not_verified'
                            },
                            status=status.HTTP_403_FORBIDDEN
                        )
                except UserProfile.DoesNotExist:
                    logger.error(
                        f"UserProfile not found for user",
                        extra={'user_id': user.id, 'email': user.email}
                    )
                    return Response(
                        {'detail': 'User profile not found. Please contact support.'},
                        status=status.HTTP_404_NOT_FOUND
                    )
        
        # All checks passed - proceed with normal token flow
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200 and user:
            logger.info(
                f"Successful login",
                extra={'user_id': user.id, 'email': user.email}
            )
            
            # Ensure UserProfile exists and update role for admin/staff accounts
            profile, created = UserProfile.objects.get_or_create(user=user)
            if user.is_superuser or user.is_staff:
                profile_changed = False
                if profile.role != 'admin':
                    profile.role = 'admin'
                    profile_changed = True
                if not profile.is_email_verified:
                    profile.is_email_verified = True
                    profile_changed = True
                if profile_changed:
                    profile.save(update_fields=['role', 'is_email_verified', 'updated_at'])
                    logger.info(f"Auto-promoted superuser to admin role", extra={'user_id': user.id})
            
            response.data['user'] = UserSerializer(user, context={'request': request}).data
        
        return response


class RegisterView(APIView):
    """User registration endpoint with email verification
    
    Registration flow:
    1. Create user with is_active=False
    2. Create UserProfile with is_email_verified=False
    3. Generate OTP and save hash
    4. Send email with OTP
    5. Return success/failure response
    """
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            try:
                # Step 1: Create user with is_active=False
                user = User.objects.create_user(
                    username=serializer.validated_data['username'],
                    email=serializer.validated_data['email'],
                    password=serializer.validated_data['password'],
                    first_name=serializer.validated_data.get('first_name', ''),
                    last_name=serializer.validated_data.get('last_name', ''),
                    is_active=False  # User must verify email first
                )
                logger.info(f"New user registered: {user.email} (user_id={user.id})")
                
                # Step 2: Ensure UserProfile is created
                profile, created = UserProfile.objects.get_or_create(user=user)
                profile.is_email_verified = False
                profile.save()
                logger.info(f"UserProfile created for {user.email} (user_id={user.id})")
                
                # Step 3: Generate and save OTP
                verification, otp = create_or_update_email_verification(user)
                logger.debug(f"OTP generated for {user.email} - hash saved in DB")
                
                # Step 4: Send OTP email
                try:
                    email_sent = send_otp_email(user=user, otp=otp)
                    logger.info(f"OTP email send attempt completed for {user.email}")
                    
                except Exception as email_error:
                    # Email sending failed - user is still created but can't complete registration
                    logger.error(
                        f"Email sending failed during registration for {user.email}",
                        extra={
                            'user_id': user.id,
                            'email': user.email,
                            'error_type': type(email_error).__name__,
                        }
                    )
                    
                    # Return clear error about email failure
                    return Response(
                        {
                            "message": "User registered but email sending failed.",
                            "email": user.email,
                            "error": "email_send_failed",
                            "error_detail": str(email_error) if settings.DEBUG else "Unable to send verification email. Please try again later."
                        },
                        status=status.HTTP_201_CREATED  # User created, but email not sent
                    )
                
                # Success: Email sent
                logger.info(f"Registration completed successfully for {user.email} - verification email sent")
                return Response(
                    {
                        "message": "User registered successfully. Please check your email for the verification code.",
                        "email": user.email,
                        "username": user.username
                    },
                    status=status.HTTP_201_CREATED
                )
                
            except Exception as e:
                # Catch any unexpected errors during registration
                logger.error(
                    f"Registration failed with unexpected error",
                    exc_info=True,
                    extra={'email': serializer.validated_data.get('email')}
                )
                return Response(
                    {
                        "error": "registration_failed",
                        "detail": str(e) if settings.DEBUG else "Registration failed. Please try again."
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        logger.warning(f"Registration validation failed", extra={'errors': serializer.errors})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for user profiles"""
    queryset = UserProfile.objects.select_related('user').all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's profile"""
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def update_role(self, request, pk=None):
        """Update user role (admin only)"""
        try:
            profile = UserProfile.objects.get(pk=pk)
        except UserProfile.DoesNotExist:
            return Response(
                {'detail': 'Profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Prevent users from changing their own role
        if profile.user == request.user:
            return Response(
                {'detail': 'You cannot change your own role'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = UserRoleUpdateSerializer(data=request.data)
        if serializer.is_valid():
            old_role = profile.role
            profile.role = serializer.validated_data['role']
            profile.save()
            
            return Response(
                {
                    'message': f'Role updated from {old_role} to {profile.role}',
                    'profile': UserProfileSerializer(profile, context={'request': request}).data
                },
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for viewing and managing users"""
    queryset = User.objects.select_related('profile').all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action == 'list':
            return [IsAdmin()]
        return super().get_permissions()

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's information"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def update_role(self, request, pk=None):
        """Update user role (admin only)"""
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {'detail': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Prevent changing admin's role
        if user.is_superuser or user.is_staff:
            return Response(
                {'detail': 'Cannot change superuser role'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Prevent users from changing their own role
        if user == request.user:
            return Response(
                {'detail': 'You cannot change your own role'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = UserRoleUpdateSerializer(data=request.data)
        if serializer.is_valid():
            profile, created = UserProfile.objects.get_or_create(user=user)
            old_role = profile.role
            profile.role = serializer.validated_data['role']
            profile.save()
            
            return Response(
                {
                    'message': f'Role updated from {old_role} to {profile.role}',
                    'user': UserSerializer(user, context={'request': request}).data
                },
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def upload_profile_picture(self, request, pk=None):
        """Upload profile picture for a user"""
        # Users can only upload their own picture
        if int(pk) != request.user.id and not IsAdmin().has_permission(request, None):
            return Response(
                {'detail': 'You do not have permission to upload picture for this user'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {'detail': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if 'profile_picture' not in request.FILES:
            return Response(
                {'detail': 'No image provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        profile, created = UserProfile.objects.get_or_create(user=user)
        profile.profile_picture = request.FILES['profile_picture']
        profile.save()
        
        return Response(
            {
                'message': 'Profile picture updated',
                'profile_picture_url': request.build_absolute_uri(profile.profile_picture.url)
            },
            status=status.HTTP_200_OK
        )


class ChangePasswordView(APIView):
    """View for changing user password"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            
            # Check old password
            if not user.check_password(serializer.data.get('old_password')):
                return Response(
                    {'old_password': ['Wrong password.']},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Set new password
            user.set_password(serializer.data.get('new_password'))
            user.save()
            
            # Update session to prevent logout
            update_session_auth_hash(request, user)
            
            return Response(
                {'message': 'Password updated successfully'},
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """Logout endpoint for token blacklisting (if using token blacklist)"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Logout user by blacklisting token
        Note: Requires django-rest-framework-simplejwt with TOKEN_BLACKLIST_ENABLED
        """
        return Response(
            {'message': 'Logout successful. Please discard your tokens.'},
            status=status.HTTP_200_OK
        )


class VerifyEmailView(APIView):
    """Email verification endpoint with OTP"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']
            
            # Find user by email
            try:
                user = User.objects.get(email__iexact=email)
            except User.DoesNotExist:
                return Response(
                    {'detail': 'User with this email not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get email verification record
            try:
                verification = EmailVerification.objects.get(user=user)
            except EmailVerification.DoesNotExist:
                return Response(
                    {'detail': 'No verification record found. Please register again.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Verify OTP
            if not verification.verify_otp(otp):
                # Increment attempts
                verification.increment_attempts()
                
                # Check if max attempts exceeded
                if verification.attempts >= 5:
                    return Response(
                        {
                            'detail': 'Maximum verification attempts exceeded. Please request a new OTP.',
                            'error_code': 'max_attempts_exceeded'
                        },
                        status=status.HTTP_429_TOO_MANY_REQUESTS
                    )
                
                remaining_attempts = 5 - verification.attempts
                return Response(
                    {
                        'detail': f'Invalid OTP. {remaining_attempts} attempts remaining.',
                        'error_code': 'invalid_otp',
                        'attempts_remaining': remaining_attempts
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # OTP is valid - mark email as verified
            profile = user.profile
            profile.is_email_verified = True
            profile.save()
            
            # Activate user
            user.is_active = True
            user.save()
            
            # Delete verification record
            verification.delete()
            
            return Response(
                {
                    'message': 'Email verified successfully. You can now log in.',
                    'email': user.email,
                    'username': user.username
                },
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TestEmailView(APIView):
    """Temporary debug endpoint to test email sending configuration.
    
    This endpoint:
    - Tests SMTP connectivity
    - Verifies email_utils.send_otp_email() works
    - Validates EMAIL settings
    
    Response:
    - 200: Email sent successfully
    - 500: Email sending failed (shows error details)
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """Send a test email to verify SMTP configuration"""
        test_email = request.data.get('email')
        if not test_email and request.user.is_authenticated:
            test_email = request.user.email
        
        if not test_email:
            return Response(
                {
                    'error': 'missing_email',
                    'detail': 'Please provide email address or be authenticated'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logger.info(f"Test email requested to {test_email}")
        
        email_backend = getattr(settings, 'EMAIL_BACKEND', '').lower()
        is_sendgrid_backend = 'sendgrid' in email_backend

        # Check if email is configured based on active backend
        if is_sendgrid_backend:
            if not getattr(settings, 'SENDGRID_API_KEY', ''):
                logger.error("SendGrid API key not configured")
                return Response(
                    {
                        'success': False,
                        'error': 'email_not_configured',
                        'detail': 'SENDGRID_API_KEY not set in environment variables',
                        'message': 'SendGrid API key must be configured before emails can be sent.'
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            if not getattr(settings, 'EMAIL_HOST_USER', '') or not getattr(settings, 'EMAIL_HOST_PASSWORD', ''):
                logger.error("SMTP credentials not configured")
                return Response(
                    {
                        'success': False,
                        'error': 'email_not_configured',
                        'detail': 'EMAIL_HOST_USER or EMAIL_HOST_PASSWORD not set in environment variables',
                        'message': 'SMTP credentials must be configured before emails can be sent.'
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        try:
            # Test SMTP by sending a simple test email
            send_mail(
                subject="Test Email - SMTP Configuration Check",
                message=f"This is a test email sent at {timezone.now()}. If you received this, SMTP is working correctly.",
                from_email=settings.DEFAULT_FROM_EMAIL or settings.EMAIL_HOST_USER,
                recipient_list=[test_email],
                html_message=f"""
                <html>
                    <body style="font-family: Arial; text-align: center;">
                        <h2>SMTP Configuration Working</h2>
                        <p>Sent at: {timezone.now()}</p>
                        <p>This test confirms your email sending is properly configured.</p>
                    </body>
                </html>
                """,
                fail_silently=False,
            )
            
            logger.info(f"Test email successfully sent to {test_email}")
            return Response(
                {
                    'success': True,
                    'message': f'Test email sent successfully to {test_email}',
                    'timestamp': timezone.now().isoformat()
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(
                f"Test email failed to {test_email}",
                exc_info=True,
                extra={
                    'email': test_email,
                    'error_type': type(e).__name__,
                    'email_backend': getattr(settings, 'EMAIL_BACKEND', ''),
                    'email_host': getattr(settings, 'EMAIL_HOST', ''),
                    'email_port': getattr(settings, 'EMAIL_PORT', ''),
                    'email_use_tls': getattr(settings, 'EMAIL_USE_TLS', ''),
                }
            )
            
            return Response(
                {
                    'success': False,
                    'error': 'email_send_failed',
                    'detail': str(e),
                    'debug_info': {
                        'email_backend': getattr(settings, 'EMAIL_BACKEND', ''),
                        'email_host': getattr(settings, 'EMAIL_HOST', ''),
                        'email_port': getattr(settings, 'EMAIL_PORT', ''),
                        'email_use_tls': getattr(settings, 'EMAIL_USE_TLS', ''),
                        'from_email': getattr(settings, 'DEFAULT_FROM_EMAIL', '') or getattr(settings, 'EMAIL_HOST_USER', ''),
                        'error_type': type(e).__name__,
                    } if settings.DEBUG else {},
                    'message': 'Failed to send test email. Check server logs for details.'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ResendOTPView(APIView):
    """Resend OTP endpoint"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            # Find user by email
            try:
                user = User.objects.get(email__iexact=email)
            except User.DoesNotExist:
                # Don't reveal if user exists
                return Response(
                    {'message': 'If this email exists, a verification code has been sent.'},
                    status=status.HTTP_200_OK
                )
            
            # Check if user is already verified
            if user.profile.is_email_verified:
                return Response(
                    {
                        'detail': 'This email is already verified. You can log in now.',
                        'error_code': 'already_verified'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get or create verification record
            try:
                verification = EmailVerification.objects.get(user=user)
                
                # Check if resend cooldown is active
                if not verification.can_resend(resend_cooldown_seconds=60):
                    return Response(
                        {
                            'detail': 'Please wait before requesting a new OTP.',
                            'error_code': 'resend_cooldown_active'
                        },
                        status=status.HTTP_429_TOO_MANY_REQUESTS
                    )
            except EmailVerification.DoesNotExist:
                verification = None
            
            # Generate and send new OTP
            verification, otp = create_or_update_email_verification(user)
            verification.resent_at = timezone.now()
            verification.save()
            
            email_sent = send_otp_email(user=user, otp=otp)
            
            if not email_sent:
                return Response(
                    {
                        'detail': 'Failed to send email. Please try again later.',
                        'error_code': 'email_send_failed'
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            return Response(
                {
                    'message': 'A new verification code has been sent to your email.',
                    'email': user.email
                },
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDebugStateView(APIView):
    """Debug endpoint to inspect user verification and account state.
    
    This endpoint is for troubleshooting - shows:
    - is_active: Whether account is activated
    - is_email_verified: Whether email is verified
    - OTP record existence and timestamps
    - Failed verification attempts
    
    SECURITY: This should be disabled or require admin permission in production.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """Get user state for debugging"""
        email = request.data.get('email')
        
        if not email:
            return Response(
                {'error': 'email_required', 'detail': 'Please provide email address'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'user_not_found', 'detail': f'No user found with email {email}'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        logger.info(f"Debug state requested for user {email}")
        
        # Get OTP information
        otp_record = None
        otp_exists = False
        otp_created_at = None
        otp_attempts = 0
        otp_is_expired = False
        
        try:
            otp_record = EmailVerification.objects.get(user=user)
            otp_exists = True
            otp_created_at = otp_record.created_at
            otp_attempts = otp_record.attempts
            otp_is_expired = otp_record.is_expired()
        except EmailVerification.DoesNotExist:
            otp_exists = False
        
        # Determine message
        if user.is_active and user.profile.is_email_verified:
            message = "[OK] User is active and email is verified. User can log in."
        elif not user.is_active:
            message = "[WARNING] User account is deactivated. They cannot log in."
        elif not user.profile.is_email_verified:
            if otp_exists:
                if otp_is_expired:
                    message = "[WARNING] Email not verified. OTP has expired. User should request new OTP."
                else:
                    message = f"[PENDING] Email not verified. OTP is valid (expires ~{(otp_record.created_at + timezone.timedelta(minutes=10)).strftime('%H:%M:%S')})."
            else:
                message = "[ERROR] Email not verified. No OTP record found. User may have completed registration but OTP was not sent."
        else:
            message = "[WARNING] Account state is unclear. Check individual fields."
        
        data = {
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'is_active': user.is_active,
            'is_email_verified': user.profile.is_email_verified,
            'otp_record_exists': otp_exists,
            'otp_created_at': otp_created_at,
            'otp_attempts': otp_attempts,
            'otp_is_expired': otp_is_expired,
            'message': message,
        }
        
        serializer = UserDebugStateSerializer(data)
        return Response(serializer.data, status=status.HTTP_200_OK)

