from django.db import transaction
from django.utils import timezone

from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError

from .models import Asset, AssetAllocation, AssetHistory
from .serializers import (
    AssetSerializer,
    AssetAllocationSerializer,
    AssetHistorySerializer,
)

from users.permissions import IsSystemAdminOrHRManager


class AssetPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated

        return IsSystemAdminOrHRManager().has_permission(
            request,
            view
        )


class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all().order_by('-id')
    serializer_class = AssetSerializer
    permission_classes = [AssetPermission]
    lookup_field = 'public_id'


class AssetAllocationViewSet(viewsets.ModelViewSet):
    queryset = AssetAllocation.objects.select_related(
        'asset',
        'employee'
    ).order_by('-id')

    serializer_class = AssetAllocationSerializer
    permission_classes = [AssetPermission]
    lookup_field = 'public_id'

    def get_queryset(self):
        queryset = super().get_queryset()

        user = self.request.user

        role_name = getattr(
            getattr(user, 'role', None),
            'role_name',
            None
        )

        # System Admin and HR Manager can see all allocations
        if user.is_superuser or role_name in [
            'System Admin',
            'HR Manager'
        ]:
            return queryset

        # Normal employees can only see their own allocations
        return queryset.filter(
            employee__user=user
        )

    @transaction.atomic
    def perform_create(self, serializer):
        asset = serializer.validated_data['asset']

        # Asset must be available before allocation
        if asset.status != Asset.Status.AVAILABLE:
            raise ValidationError(
                "This asset is not available for allocation."
            )

        # Create allocation
        allocation = serializer.save(
            status=AssetAllocation.Status.ALLOCATED
        )

        # Update asset status
        asset.status = Asset.Status.ALLOCATED
        asset.save(update_fields=['status'])

        # Create history record
        AssetHistory.objects.create(
            asset=asset,
            event_type='Allocated',
            event_date=timezone.now(),
            remarks=f"Asset allocated to {allocation.employee}."
        )

    @transaction.atomic
    def perform_update(self, serializer):
        allocation = serializer.save()

        # Handle asset return
        if (
            allocation.status == AssetAllocation.Status.RETURNED
            or allocation.return_date is not None
        ):
            if allocation.return_date is None:
                allocation.return_date = timezone.now().date()

            allocation.status = AssetAllocation.Status.RETURNED
            allocation.save(
                update_fields=['return_date', 'status']
            )

            asset = allocation.asset
            asset.status = Asset.Status.AVAILABLE
            asset.save(update_fields=['status'])

            AssetHistory.objects.create(
                asset=asset,
                event_type='Returned',
                event_date=timezone.now(),
                remarks=f"Asset returned by {allocation.employee}."
            )


class AssetHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AssetHistory.objects.select_related(
        'asset'
    ).order_by('-event_date')

    serializer_class = AssetHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'public_id'