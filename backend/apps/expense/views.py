from django.db import transaction
from rest_framework.permissions import IsAuthenticated

from apps.utils.views import AuditModelViewSet
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
        try:
            employee = self.request.user.employee_profile
        except Exception:
            return Expense.objects.none()

        return Expense.objects.select_related(
            'created_by',
            'employee',
            'category',
            'approved_by',
        ).filter(employee=employee).order_by('-submitted_at')