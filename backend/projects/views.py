from rest_framework import viewsets, permissions
from users.permissions import IsSystemAdmin, IsProjectManager, IsEmployee
from .models import Project, Task
from .serializers import ProjectSerializer, TaskSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by('-created_at')
    serializer_class = ProjectSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, (IsSystemAdmin | IsProjectManager)]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [p() for p in permission_classes]


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, (IsEmployee | IsProjectManager | IsSystemAdmin)]

    def get_queryset(self):
        user = self.request.user
        queryset = Task.objects.all().order_by('-created_at')

        if user.is_superuser or (
            user.role and
            user.role.role_name in ['System Admin', 'Department / Project Manager']
        ):
            return queryset

        if hasattr(user, 'employee_profile'):
            return queryset.filter(assigned_to=user.employee_profile)

        return queryset.none()