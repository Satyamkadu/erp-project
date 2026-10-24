from .models import Company, Branch, Department, Team
from .serializers import CompanySerializer, BranchSerializer, DepartmentSerializer, TeamSerializer
from apps.utils.permissions import IsSystemAdminOrHRManager
from apps.utils.views import AuditModelViewSet


class CompanyViewSet(AuditModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsSystemAdminOrHRManager]
    lookup_field = 'public_id'


class BranchViewSet(AuditModelViewSet):
    queryset = Branch.objects.select_related('company').all()
    serializer_class = BranchSerializer
    permission_classes = [IsSystemAdminOrHRManager]
    lookup_field = 'public_id'


class DepartmentViewSet(AuditModelViewSet):
    queryset = Department.objects.select_related('branch', 'branch__company').all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsSystemAdminOrHRManager]
    lookup_field = 'public_id'


class TeamViewSet(AuditModelViewSet):
    queryset = Team.objects.select_related('department', 'department__branch', 'department__branch__company').all()
    serializer_class = TeamSerializer
    permission_classes = [IsSystemAdminOrHRManager]
    lookup_field = 'public_id'