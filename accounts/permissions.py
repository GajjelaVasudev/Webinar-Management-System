from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    """Permission class to check if user is admin"""
    message = "You do not have permission to perform this action. Admin access required."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        try:
            return request.user.profile.role == 'admin' or request.user.is_superuser
        except Exception:
            return request.user.is_superuser


class IsStudent(BasePermission):
    """Permission class to check if user is student"""
    message = "You do not have permission to perform this action. Student access required."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        try:
            return request.user.profile.role == 'student'
        except Exception:
            return False


class IsAdminRole(IsAdmin):
    """Alias permission class for explicit admin role checks"""
    pass


class IsStudentRole(IsStudent):
    """Alias permission class for explicit student role checks"""
    pass


class IsAdminOrReadOnly(BasePermission):
    """Permission class to allow admin to edit, but everyone can read"""
    message = "You do not have permission to perform this action. Admin access required."
    
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        if not request.user or not request.user.is_authenticated:
            return False
        
        try:
            return request.user.profile.role == 'admin' or request.user.is_superuser
        except Exception:
            return request.user.is_superuser


class IsOwnerOrReadOnly(BasePermission):
    """Permission class to allow user to edit their own profile"""
    message = "You do not have permission to perform this action."
    
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner
        return obj.user == request.user
