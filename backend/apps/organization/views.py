from .models import Company, Branch, Department, Team
from .serializers import CompanySerializer, BranchSerializer, DepartmentSerializer, TeamSerializer
from apps.utils.permissions import IsSystemAdminOrHRManager
from apps.utils.views import AuditModelViewSet


class CompanyViewSet(AuditModelViewSet):
    queryset = Company.objects.select_related('created_by').all()
    serializer_class = CompanySerializer
    permission_classes = [IsSystemAdminOrHRManager]


class BranchViewSet(AuditModelViewSet):
    queryset = Branch.objects.select_related('company', 'created_by').all()
    serializer_class = BranchSerializer
    permission_classes = [IsSystemAdminOrHRManager]


class DepartmentViewSet(AuditModelViewSet):
    queryset = Department.objects.select_related('branch', 'branch__company', 'created_by').all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsSystemAdminOrHRManager]


class TeamViewSet(AuditModelViewSet):
    queryset = Team.objects.select_related(
        'department', 'department__branch', 'department__branch__company', 'created_by'
    ).all()
    serializer_class = TeamSerializer
    permission_classes = [IsSystemAdminOrHRManager]