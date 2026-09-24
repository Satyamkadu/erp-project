from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import Role, User, Employee
# Keep your existing CustomTokenObtainPairSerializer up here...
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims to the JWT payload
        token['username'] = user.username
        token['role'] = user.role.role_name if user.role else None

        return token


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['public_id', 'role_name', 'description', 'permissions']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['public_id', 'username', 'email', 'role', 'is_active', 'password']
        # Passwords must never be returned in API responses
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Use create_user to automatically hash the password before saving
        user = User.objects.create_user(**validated_data)
        return user

class EmployeeSerializer(serializers.ModelSerializer):
    # This nests the user data so the frontend gets full context in one request
    user_details = UserSerializer(source='user', read_only=True)
    # This accepts the user ID when creating a new employee
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True)

    class Meta:
        model = Employee
        fields = [
            'public_id', 'user', 'user_details', 'first_name', 'last_name', 
            'email', 'phone', 'hire_date', 'employment_status'
        ]