from rest_framework import serializers

from .models import Asset, AssetAllocation, AssetHistory
from users.models import Employee


class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = [
            'public_id',
            'asset_name',
            'category',
            'serial_number',
            'purchase_date',
            'status',
        ]
        read_only_fields = [
            'public_id',
        ]


class AssetAllocationSerializer(serializers.ModelSerializer):
    asset = serializers.SlugRelatedField(
        queryset=Asset.objects.all(),
        slug_field='public_id'
    )

    employee = serializers.SlugRelatedField(
        queryset=Employee.objects.all(),
        slug_field='public_id'
    )

    class Meta:
        model = AssetAllocation
        fields = [
            'public_id',
            'asset',
            'employee',
            'allocation_date',
            'return_date',
            'status',
        ]
        read_only_fields = [
            'public_id',
        ]


class AssetHistorySerializer(serializers.ModelSerializer):
    asset = serializers.SlugRelatedField(
        queryset=Asset.objects.all(),
        slug_field='public_id'
    )

    class Meta:
        model = AssetHistory
        fields = [
            'public_id',
            'asset',
            'event_type',
            'event_date',
            'remarks',
        ]
        read_only_fields = [
            'public_id',
        ]