"""
Tests for complaints app
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from complaints.models import Complaint, AdminResponse

User = get_user_model()


class ComplaintModelTest(TestCase):
    """Test Complaint model"""
    
    def setUp(self):
        self.student = User.objects.create_user(
            username='student1',
            email='student1@test.com',
            password='testpass123',
            user_type='student'
        )
        self.admin = User.objects.create_user(
            username='admin1',
            email='admin1@test.com',
            password='testpass123',
            user_type='admin'
        )
    
    def test_create_complaint(self):
        complaint = Complaint.objects.create(
            student=self.student,
            title='Test Complaint',
            description='This is a test complaint',
            category='academic',
            priority='medium'
        )
        self.assertEqual(complaint.title, 'Test Complaint')
        self.assertEqual(complaint.status, 'pending')
        self.assertTrue(complaint.id_number.startswith('CMP-'))
    
    def test_complaint_str(self):
        complaint = Complaint.objects.create(
            student=self.student,
            title='Test Complaint',
            description='This is a test complaint',
            category='academic'
        )
        self.assertEqual(str(complaint), f'{complaint.id_number} - Test Complaint')


class AdminResponseModelTest(TestCase):
    """Test AdminResponse model"""
    
    def setUp(self):
        self.student = User.objects.create_user(
            username='student1',
            email='student1@test.com',
            password='testpass123',
            user_type='student'
        )
        self.admin = User.objects.create_user(
            username='admin1',
            email='admin1@test.com',
            password='testpass123',
            user_type='admin'
        )
        self.complaint = Complaint.objects.create(
            student=self.student,
            title='Test Complaint',
            description='This is a test complaint',
            category='academic'
        )
    
    def test_create_admin_response(self):
        response = AdminResponse.objects.create(
            complaint=self.complaint,
            admin=self.admin,
            response_text='This is an admin response'
        )
        self.assertEqual(response.response_text, 'This is an admin response')
        self.assertEqual(response.admin, self.admin)


class ComplaintAPITest(TestCase):
    """Test Complaint API endpoints"""
    
    def setUp(self):
        self.student = User.objects.create_user(
            username='student1',
            email='student1@test.com',
            password='testpass123',
            user_type='student'
        )
        self.admin = User.objects.create_user(
            username='admin1',
            email='admin1@test.com',
            password='testpass123',
            user_type='admin'
        )
    
    def test_create_complaint_api(self):
        """Test creating complaint via API"""
        # This would require a more complete test setup with client
        pass
