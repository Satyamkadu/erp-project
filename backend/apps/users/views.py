from rest_framework import permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Role, User, Employee
from .serializers import (
    RoleSerializer,
    UserSerializer,
    EmployeeSerializer,
    EmployeeDirectorySerializer,
)
from apps.utils.permissions import (
    IsSystemAdmin,
    IsSystemAdminOrHRManager,
)
from apps.utils.views import AuditModelViewSet


class RoleViewSet(AuditModelViewSet):
    queryset = Role.objects.select_related('created_by').all()
    serializer_class = RoleSerializer
    permission_classes = [IsSystemAdmin]


class UserViewSet(AuditModelViewSet):
    queryset = User.objects.select_related('role', 'created_by').all()
    serializer_class = UserSerializer
    permission_classes = [IsSystemAdmin]


class EmployeeViewSet(AuditModelViewSet):
    serializer_class = EmployeeSerializer

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Employee.objects.none()

        base_qs = Employee.objects.select_related(
            'user', 'user__role', 'department', 'manager__user', 'created_by'
        )

        if user.is_superuser or (
            user.role and user.role.role_name in ['System Admin', 'HR Manager']
        ):
            return base_qs.all()

        if user.role and user.role.role_name in ['Department / Project Manager', 'Employee']:
            return base_qs.all()

        return Employee.objects.none()

    def get_serializer_class(self):
        user = self.request.user
        if (
            self.action in ['list', 'retrieve']
            and user.is_authenticated
            and user.role
            and user.role.role_name == 'Employee'
        ):
            return EmployeeDirectorySerializer
        return EmployeeSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSystemAdminOrHRManager()]
        if self.action == 'me':
            return [permissions.IsAuthenticated()]
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsSystemAdminOrHRManager()]

    @action(detail=False, methods=['get'], url_path='me', permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        try:
            employee = Employee.objects.select_related(
                'user', 'user__role', 'department', 'manager__user'
            ).get(user=request.user)
        except Employee.DoesNotExist:
            if request.user.is_superuser:
                return Response({
                    'public_id': str(request.user.public_id),
                    'user': {
                        'public_id': str(request.user.public_id),
                        'username': request.user.username,
                        'email': request.user.email,
                        'role': {'role_name': 'System Admin'},
                    },
                    'first_name': 'System',
                    'last_name': 'Admin',
                    'email': request.user.email,
                    'phone': '',
                    'hire_date': request.user.date_joined.date() if request.user.date_joined else None,
                    'employment_status': 'Active',
                    'job_title': 'System Administrator',
                    'department': None,
                    'manager': None,
                })
            return Response({'detail': 'Employee profile not found.'}, status=404)
        serializer = self.get_serializer(employee)
        return Response(serializer.data)