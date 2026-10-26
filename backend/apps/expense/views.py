from rest_framework.permissions import IsAuthenticated

from apps.utils.views import AuditModelViewSet
from apps.users.models import Employee
from .models import Expense, ExpenseCategory
from .serializers import (
    ExpenseSerializer,
    ExpenseCategorySerializer,
)


class ExpenseCategoryViewSet(AuditModelViewSet):
    queryset = ExpenseCategory.objects.select_related('created_by').all()
    serializer_class = ExpenseCategorySerializer
    permission_classes = [IsAuthenticated]


class ExpenseViewSet(AuditModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Expense.objects.select_related(
            'created_by',
            'employee',
            'category',
            'approved_by',
        ).order_by('-submitted_at')

        user = self.request.user
        role_name = user.role.role_name if user.role else ''
        if user.is_superuser or role_name in {'System Admin', 'HR Manager'}:
            return queryset

        try:
            employee = user.employee_profile
        except (AttributeError, Employee.DoesNotExist):
            return queryset.none()

        return queryset.filter(employee=employee)