"""
Tests for accounts app
"""
from django.test import TestCase
from accounts.models import User


class UserModelTest(TestCase):
    """Test User model"""
    
    def test_create_student_user(self):
        user = User.objects.create_user(
            username='student1',
            email='student1@test.com',
            password='testpass123',
            user_type='student',
            student_id='STU0001'
        )
        self.assertEqual(user.username, 'student1')
        self.assertEqual(user.user_type, 'student')
        self.assertTrue(user.is_student)
        self.assertFalse(user.is_admin_user)
    
    def test_create_admin_user(self):
        user = User.objects.create_user(
            username='admin1',
            email='admin1@test.com',
            password='testpass123',
            user_type='admin'
        )
        self.assertEqual(user.username, 'admin1')
        self.assertEqual(user.user_type, 'admin')
        self.assertTrue(user.is_admin_user)
        self.assertFalse(user.is_student)
