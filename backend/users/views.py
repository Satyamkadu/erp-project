from rest_framework import viewsets, permissions, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Role, User, Employee
from .serializers import RoleSerializer, UserSerializer, EmployeeSerializer
from .permissions import IsSystemAdmin, IsHRManager, IsEmployee


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsSystemAdmin]


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.select_related('role').all()
    serializer_class = UserSerializer
    permission_classes = [IsSystemAdmin]


class IsSystemAdminOrHRManager(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        if request.user.role is None:
            return False
        return request.user.role.role_name in ['System Admin', 'HR Manager']


class EmployeeViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeSerializer

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Employee.objects.none()
        if user.is_superuser or (user.role and user.role.role_name in ['System Admin', 'HR Manager']):
            return Employee.objects.select_related('user', 'user__role').all()
        if user.role and user.role.role_name == 'Employee':
            return Employee.objects.filter(user=user).select_related('user', 'user__role')
        return Employee.objects.none()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSystemAdminOrHRManager()]
        if self.action in ['list']:
            return [IsSystemAdminOrHRManager()]
        if self.action == 'retrieve':
            return [permissions.IsAuthenticated()]
        return [IsSystemAdminOrHRManager()]

    @action(detail=False, methods=['get'], url_path='me', permission_classes=[IsEmployee])
    def me(self, request):
        try:
            employee = Employee.objects.select_related('user', 'user__role').get(user=request.user)
        except Employee.DoesNotExist:
            return Response({'detail': 'Employee profile not found.'}, status=404)
        serializer = self.get_serializer(employee)
        return Response(serializer.data)