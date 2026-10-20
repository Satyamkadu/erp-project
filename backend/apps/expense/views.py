from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Expense, ExpenseCategory
from .serializers import (
    ExpenseSerializer,
    ExpenseCategorySerializer
)


class ExpenseCategoryListCreateView(generics.ListCreateAPIView):

    queryset = ExpenseCategory.objects.all()
    serializer_class = ExpenseCategorySerializer
    permission_classes = [IsAuthenticated]


class ExpenseListCreateView(generics.ListCreateAPIView):

    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        try:
            employee = self.request.user.employee_profile
        except Exception:
            return Expense.objects.none()

        return Expense.objects.filter(
            employee=employee
        ).order_by('-submitted_at')

    def perform_create(self, serializer):

        try:
            employee = self.request.user.employee_profile
        except Exception:
            from rest_framework.exceptions import ValidationError

            raise ValidationError(
                "Employee profile not found for this user."
            )

        serializer.save(
            employee=employee,
            status='PENDING'
        )