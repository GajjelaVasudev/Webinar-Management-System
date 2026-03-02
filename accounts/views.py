from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from django.contrib.auth import update_session_auth_hash
from django.utils import timezone

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
)
from .permissions import IsAdmin
from .email_utils import create_or_update_email_verification, send_otp_email


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom JWT token view that returns user data and includes role"""
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
        
        # Check if user is active and email is verified
        if user:
            # Check if user account is active
            if not user.is_active:
                return Response(
                    {
                        'detail': 'Your account is inactive. Please contact support.',
                        'error_code': 'account_inactive'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Check if user email is verified
            try:
                profile = user.profile
                if not profile.is_email_verified:
                    return Response(
                        {
                            'detail': 'Please verify your email first.',
                            'email': user.email,
                            'error_code': 'email_not_verified'
                        },
                        status=status.HTTP_403_FORBIDDEN
                    )
            except UserProfile.DoesNotExist:
                return Response(
                    {'detail': 'User profile not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # Proceed with normal token flow
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200 and user:
            # Ensure UserProfile exists and update role for superusers
            profile, created = UserProfile.objects.get_or_create(user=user)
            if user.is_superuser or user.is_staff:
                if profile.role != 'admin':
                    profile.role = 'admin'
                    profile.save()
            
            response.data['user'] = UserSerializer(user, context={'request': request}).data
        return response


class RegisterView(APIView):
    """User registration endpoint with email verification"""
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            # Create user with is_active=False
            user = User.objects.create_user(
                username=serializer.validated_data['username'],
                email=serializer.validated_data['email'],
                password=serializer.validated_data['password'],
                first_name=serializer.validated_data.get('first_name', ''),
                last_name=serializer.validated_data.get('last_name', ''),
                is_active=False  # Deactivate until email is verified
            )
            
            # Ensure UserProfile is created
            profile, created = UserProfile.objects.get_or_create(user=user)
            profile.is_email_verified = False
            profile.save()
            
            # Generate and send OTP
            verification, otp = create_or_update_email_verification(user)
            email_sent = send_otp_email(user=user, otp=otp)
            
            if not email_sent:
                # If email sending fails, still return success but inform user
                return Response(
                    {
                        "message": "User registered but email sending failed. Please try to resend OTP.",
                        "email": user.email,
                        "error": "email_send_failed"
                    },
                    status=status.HTTP_201_CREATED
                )
            
            return Response(
                {
                    "message": "User registered successfully. Please check your email for the verification code.",
                    "email": user.email,
                    "username": user.username
                },
                status=status.HTTP_201_CREATED
            )
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
