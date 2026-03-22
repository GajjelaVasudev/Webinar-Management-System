from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import Token
from .models import UserProfile


class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT serializer that accepts either username or email and includes role"""
    
    username_field = 'username'

    @classmethod
    def get_token(cls, user):
        """Override to include role in token"""
        token = super().get_token(user)
        
        # Add custom claims
        try:
            token['role'] = user.profile.role
        except UserProfile.DoesNotExist:
            token['role'] = 'admin' if (user.is_superuser or user.is_staff) else 'student'
        
        token['username'] = user.username
        token['email'] = user.email
        
        return token

    def validate(self, attrs):
        credentials = {
            'username': attrs.get('username'),
            'password': attrs.get('password')
        }
        
        # If username looks like an email, try to find user by email
        username_or_email = credentials['username']
        if '@' in username_or_email:
            user = User.objects.filter(email__iexact=username_or_email).first()
            if user:
                credentials['username'] = user.username
        
        return super().validate(credentials)


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model"""
    profile_picture_url = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = ['id', 'role', 'profile_picture', 'profile_picture_url', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_profile_picture_url(self, obj):
        """Get full URL for profile picture"""
        request = self.context.get('request')
        if obj.profile_picture:
            if request:
                return request.build_absolute_uri(obj.profile_picture.url)
            return obj.profile_picture.url
        return None


class UserSerializer(serializers.ModelSerializer):
    """User serializer with profile information"""
    profile = UserProfileSerializer(read_only=True)
    role = serializers.SerializerMethodField()
    profile_picture_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'profile', 'role', 'profile_picture_url', 'is_staff', 'is_superuser'
        ]
        read_only_fields = ['id', 'is_staff', 'is_superuser']
    
    def get_role(self, obj):
        """Get role from profile, defaulting to 'student'"""
        try:
            return obj.profile.role
        except UserProfile.DoesNotExist:
            return 'admin' if (obj.is_superuser or obj.is_staff) else 'student'
    
    def get_profile_picture_url(self, obj):
        """Get full URL for profile picture"""
        request = self.context.get('request')
        try:
            if obj.profile.profile_picture:
                if request:
                    return request.build_absolute_uri(obj.profile.profile_picture.url)
                return obj.profile.profile_picture.url
        except UserProfile.DoesNotExist:
            pass
        return None


class UserListSerializer(serializers.ModelSerializer):
    """Serializer for listing users (admin only)"""
    profile = UserProfileSerializer(read_only=True)
    role = serializers.SerializerMethodField()
    profile_picture_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'profile_picture_url', 'profile', 'is_active'
        ]
        read_only_fields = ['id', 'username', 'is_active']
    
    def get_role(self, obj):
        """Get role from profile"""
        try:
            return obj.profile.role
        except UserProfile.DoesNotExist:
            return 'admin' if (obj.is_superuser or obj.is_staff) else 'student'
    
    def get_profile_picture_url(self, obj):
        """Get full URL for profile picture"""
        request = self.context.get('request')
        try:
            if obj.profile.profile_picture:
                if request:
                    return request.build_absolute_uri(obj.profile.profile_picture.url)
                return obj.profile.profile_picture.url
        except UserProfile.DoesNotExist:
            pass
        return None


class UserRoleUpdateSerializer(serializers.Serializer):
    """Serializer for updating user role (admin only)"""
    role = serializers.ChoiceField(choices=['admin', 'student'])
    
    def validate_role(self, value):
        """Validate role choice"""
        if value not in ['admin', 'student']:
            raise serializers.ValidationError("Invalid role. Must be 'admin' or 'student'.")
        return value


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs
    
    def validate_email(self, value):
        """Ensure email is unique"""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_username(self, value):
        """Ensure username is unique and valid"""
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change"""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, min_length=8, write_only=True)
    new_password_confirm = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Passwords do not match."})
        return attrs


class VerifyEmailSerializer(serializers.Serializer):
    """Serializer for email verification with OTP"""
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(required=True, min_length=6, max_length=6)
    
    def validate_otp(self, value):
        """Validate OTP format (must be 6 digits)"""
        if not value.isdigit():
            raise serializers.ValidationError("OTP must contain only digits.")
        return value


class ResendOTPSerializer(serializers.Serializer):
    """Serializer for resending OTP"""
    email = serializers.EmailField(required=True)


class EmailVerificationResponseSerializer(serializers.Serializer):
    """Serializer for email verification response"""
    message = serializers.CharField()
    email = serializers.EmailField()


class UserDebugStateSerializer(serializers.Serializer):
    """Debug serializer to show user account and email verification state.
    
    Used for troubleshooting registration and email verification issues.
    Shows:
    - is_active: Whether user account is activated
    - is_email_verified: Whether email has been verified
    - otp_record_exists: Whether OTP verification record exists
    - otp_created_at: When OTP was created (for debugging expiration)
    - attempts: Failed verification attempts
    """
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    email = serializers.EmailField()
    is_active = serializers.BooleanField()
    is_email_verified = serializers.BooleanField()
    otp_record_exists = serializers.BooleanField()
    otp_created_at = serializers.DateTimeField(allow_null=True)
    otp_attempts = serializers.IntegerField()
    otp_is_expired = serializers.BooleanField()
    message = serializers.CharField()
