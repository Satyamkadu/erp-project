from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import date

from users.models import User, Role, Employee
from .models import Asset, AssetAllocation, AssetHistory


class AssetModuleTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        # 1. Setup Roles
        self.admin_role = Role.objects.create(role_name='System Admin')
        self.employee_role = Role.objects.create(role_name='Employee')

        # 2. Setup Users
        self.admin_user = User.objects.create_user(username='admin_test', password='password123', role=self.admin_role)
        self.emp_user = User.objects.create_user(username='emp_test', password='password123', role=self.employee_role)

        # 3. Setup Employee Profiles
        self.admin_profile = Employee.objects.create(user=self.admin_user, first_name='Admin', last_name='User', hire_date=date.today(), email='admin@test.com')
        self.emp_profile = Employee.objects.create(user=self.emp_user, first_name='Normal', last_name='Employee', hire_date=date.today(), email='emp@test.com')

        # 4. Setup Initial Asset
        self.asset = Asset.objects.create(
            asset_name='MacBook Pro M3', 
            category='Laptop', 
            serial_number='MAC123456'
        )

        # 5. Generate JWT Tokens
        self.admin_token = str(RefreshToken.for_user(self.admin_user).access_token)
        self.emp_token = str(RefreshToken.for_user(self.emp_user).access_token)

    def test_asset_allocation_creates_history_and_updates_status(self):
        """Test that allocating an asset triggers the atomic transaction properly."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        url = reverse('asset-allocation-list')
        
        data = {
            'asset': str(self.asset.public_id),
            'employee': str(self.emp_profile.public_id),
            'allocation_date': date.today().isoformat(),
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # 1. Verify the asset status changed in the database
        self.asset.refresh_from_db()
        self.assertEqual(self.asset.status, Asset.Status.ALLOCATED)

        # 2. Verify the AssetHistory record was automatically created
        history_exists = AssetHistory.objects.filter(
            asset=self.asset, 
            event_type='Allocated'
        ).exists()
        self.assertTrue(history_exists)

    def test_rbac_row_level_security_on_allocations(self):
        """Test that standard employees can only see their own allocations."""
        # Create an allocation for the standard employee
        AssetAllocation.objects.create(
            asset=self.asset,
            employee=self.emp_profile,
            allocation_date=date.today()
        )

        # Create a second asset and allocate it to the Admin
        asset2 = Asset.objects.create(asset_name='Dell XPS', category='Laptop', serial_number='DELL123')
        AssetAllocation.objects.create(
            asset=asset2,
            employee=self.admin_profile,
            allocation_date=date.today()
        )

        url = reverse('asset-allocation-list')

        # 1. Admin should see both allocations
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        admin_response = self.client.get(url)
        self.assertEqual(len(admin_response.data), 2)

        # 2. Standard Employee should only see their 1 allocation (Data Leak Prevention)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.emp_token}')
        emp_response = self.client.get(url)
        self.assertEqual(len(emp_response.data), 1)
        self.assertEqual(str(emp_response.data[0]['employee']), str(self.emp_profile.public_id))