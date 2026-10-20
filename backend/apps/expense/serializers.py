from rest_framework import serializers

from .models import Expense, ExpenseCategory


class ExpenseCategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = ExpenseCategory

        fields = [
            'id',
            'public_id',
            'name',
            'description',
            'is_active',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'public_id',
            'created_at',
            'updated_at',
        ]


class ExpenseSerializer(serializers.ModelSerializer):

    employee_name = serializers.SerializerMethodField(
        read_only=True
    )

    category_name = serializers.CharField(
        source='category.name',
        read_only=True
    )

    class Meta:
        model = Expense

        fields = [
            'id',
            'public_id',
            'employee',
            'employee_name',
            'category',
            'category_name',
            'amount',
            'expense_date',
            'description',
            'receipt',
            'status',
            'submitted_at',
            'approved_at',
            'approved_by',
            'remarks',
        ]

        read_only_fields = [
            'id',
            'public_id',
            'employee',
            'employee_name',
            'category_name',
            'status',
            'submitted_at',
            'approved_at',
            'approved_by',
        ]

    def get_employee_name(self, obj):
        return str(obj.employee)

    def validate_amount(self, value):

        if value <= 0:
            raise serializers.ValidationError(
                "Expense amount must be greater than zero."
            )

        return value

    def validate_category(self, value):

        if not value.is_active:
            raise serializers.ValidationError(
                "This expense category is inactive."
            )

        return value