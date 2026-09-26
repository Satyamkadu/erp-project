from rest_framework import serializers
from users.serializers import EmployeeSerializer
from users.models import Employee
from .models import Project, Task


class ProjectSerializer(serializers.ModelSerializer):
    manager_details = EmployeeSerializer(source='manager', read_only=True)
    manager = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(), write_only=True
    )

    class Meta:
        model = Project
        fields = [
            'public_id', 'name', 'description',
            'manager', 'manager_details',
            'start_date', 'end_date', 'status',
            'created_at', 'updated_at',
        ]


class TaskSerializer(serializers.ModelSerializer):
    assigned_to_details = EmployeeSerializer(source='assigned_to', read_only=True)
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(), write_only=True
    )
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all())

    class Meta:
        model = Task
        fields = [
            'public_id', 'project',
            'assigned_to', 'assigned_to_details',
            'title', 'description', 'deadline', 'status',
            'created_at', 'updated_at',
        ]