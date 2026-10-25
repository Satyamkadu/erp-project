from rest_framework.exceptions import ValidationError
from apps.users.models import Employee

# inside your ExpenseSerializer:
    def create(self, validated_data):
        request = self.context.get('request')
        try:
            employee = request.user.employee_profile
        except Employee.DoesNotExist:
            raise ValidationError("Employee profile not found for this user.")

        validated_data['employee'] = employee
        validated_data['status'] = 'PENDING'
        return super().create(validated_data)