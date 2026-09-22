from rest_framework import permissions

class IsAdminRole(permissions.BasePermission):
    """
    Allows access only to users with the 'Admin' role (or superusers).
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Superusers automatically get access, otherwise check the role name
        if request.user.is_superuser:
            return True
            
        return request.user.role and request.user.role.role_name == 'Admin'


class IsEmployeeRole(permissions.BasePermission):
    """
    Allows access to users with the 'Employee' role.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        if request.user.is_superuser:
            return True
            
        return request.user.role and request.user.role.role_name == 'Employee'