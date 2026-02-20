from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Permission class to check if user is admin"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        try:
            return request.user.profile.role == 'admin' or request.user.is_superuser
        except Exception:
            return request.user.is_superuser
