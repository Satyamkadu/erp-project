
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import LeaveType, LeavePolicy, LeaveRequest, LeaveBalance
from .serializers import (
    LeaveTypeSerializer,
    LeavePolicySerializer,
    LeaveRequestSerializer,
    LeaveBalanceSerializer,
)
from .permissions import (
    IsHRAdminOrReadOnly,
    CanReviewLeave,
    get_employee,
    get_employee_company,
    is_hr_or_admin,
    is_manager,
)
from .services import approve_leave, reject_leave


class LeaveTypeViewSet(viewsets.ModelViewSet):
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer
    permission_classes = [IsHRAdminOrReadOnly]


class LeavePolicyViewSet(viewsets.ModelViewSet):
    serializer_class = LeavePolicySerializer
    permission_classes = [IsHRAdminOrReadOnly]

    def get_queryset(self):
        queryset = LeavePolicy.objects.select_related(
            "company", "leave_type"
        )

        if is_hr_or_admin(self.request.user):
            return queryset

        employee = get_employee(self.request.user)
        company = get_employee_company(employee)

        if not company:
            return queryset.none()

        return queryset.filter(company=company)


class LeaveRequestViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = LeaveRequest.objects.select_related(
            "employee",
            "employee__user",
            "employee__manager",
            "leave_type",
            "reviewed_by",
        )

        if is_hr_or_admin(self.request.user):
            return queryset

        employee = get_employee(self.request.user)

        if not employee:
            return queryset.none()

        if is_manager(self.request.user):
            return queryset.filter(
                employee__manager=employee
            ) | queryset.filter(employee=employee)

        return queryset.filter(employee=employee)

    def perform_create(self, serializer):
        employee = get_employee(self.request.user)

        if not employee:
            raise ValidationError(
                "Your account is not linked to an employee profile."
            )

        serializer.save(employee=employee)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[CanReviewLeave],
    )
    def approve(self, request, pk=None):
        leave_request = self.get_object()

        updated_request = approve_leave(
            leave_request=leave_request,
            reviewer=request.user,
            comment=request.data.get("comment", ""),
        )

        return Response(
            self.get_serializer(updated_request).data,
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[CanReviewLeave],
    )
    def reject(self, request, pk=None):
        leave_request = self.get_object()

        updated_request = reject_leave(
            leave_request=leave_request,
            reviewer=request.user,
            comment=request.data.get("comment", ""),
        )

        return Response(
            self.get_serializer(updated_request).data,
            status=status.HTTP_200_OK,
        )


class LeaveBalanceViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = LeaveBalanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = LeaveBalance.objects.select_related(
            "employee",
            "company",
            "leave_type",
        )

        if is_hr_or_admin(self.request.user):
            return queryset

        employee = get_employee(self.request.user)

        if not employee:
            return queryset.none()

        return queryset.filter(employee=employee)
