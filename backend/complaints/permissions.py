from rest_framework import permissions


class IsStudentOwnerOrAdmin(permissions.BasePermission):
    """Permission to allow student owners or admins to access complaints"""
    
    def has_object_permission(self, request, view, obj):
        if request.user.user_type == 'admin':
            return True
        return obj.student == request.user


class IsAdmin(permissions.BasePermission):
    """Permission to allow only admin users"""
    
    def has_permission(self, request, view):
        return request.user and request.user.user_type == 'admin'


class IsStudent(permissions.BasePermission):
    """Permission to allow only student users"""
    
    def has_permission(self, request, view):
        return request.user and request.user.user_type == 'student'


class IsOwnerOrAdmin(permissions.BasePermission):
    """Permission to allow object owner or admin"""
    
    def has_object_permission(self, request, view, obj):
        if hasattr(request.user, 'user_type') and request.user.user_type == 'admin':
            return True
        return obj.user == request.user
