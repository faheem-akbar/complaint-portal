from django.core.management.base import BaseCommand
from django.utils import timezone
from accounts.models import User
from complaints.models import Complaint, ComplaintActivity, AdminResponse, Notification
from datetime import timedelta
import random


class Command(BaseCommand):
    help = 'Populate database with sample data'
    
    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')
        
        # Create admin users
        admin_users = []
        for i in range(2):
            admin, created = User.objects.get_or_create(
                username=f'admin{i+1}',
                defaults={
                    'email': f'admin{i+1}@university.edu',
                    'first_name': f'Admin',
                    'last_name': f'User{i+1}',
                    'user_type': 'admin',
                    'is_staff': True,
                    'is_superuser': True
                }
            )
            if created:
                admin.set_password('admin123')
                admin.save()
                self.stdout.write(f'Created admin: {admin.username}')
            admin_users.append(admin)
        
        # Create student users
        student_users = []
        for i in range(5):
            student, created = User.objects.get_or_create(
                username=f'student{i+1}',
                defaults={
                    'email': f'student{i+1}@university.edu',
                    'first_name': f'Student',
                    'last_name': f'User{i+1}',
                    'user_type': 'student',
                    'student_id': f'STU{i+1:04d}'
                }
            )
            if created:
                student.set_password('student123')
                student.save()
                self.stdout.write(f'Created student: {student.username}')
            student_users.append(student)
        
        # Create complaints
        categories = ['academic', 'hostel', 'administrative', 'financial', 'examination', 'transportation', 'other']
        statuses = ['pending', 'in_progress', 'resolved', 'rejected']
        priorities = ['low', 'medium', 'high', 'urgent']
        
        complaints_data = [
            {
                'title': 'Library closing time too early',
                'description': 'The library closes at 6 PM which is too early for students who have evening classes. Please extend the closing time to at least 8 PM.',
                'category': 'academic',
                'student': student_users[0],
            },
            {
                'title': 'Hostel WiFi is very slow',
                'description': 'The WiFi connection in the hostel is extremely slow and often disconnects. This is affecting our studies.',
                'category': 'hostel',
                'student': student_users[1],
            },
            {
                'title': 'Admission fee not processed',
                'description': 'I submitted my admission fee payment 5 days ago but it is still not reflected in the system.',
                'category': 'financial',
                'student': student_users[2],
            },
            {
                'title': 'Transportation schedule issue',
                'description': 'The university bus for morning route is consistently 30 minutes late.',
                'category': 'transportation',
                'student': student_users[3],
            },
            {
                'title': 'Exam hall temperature too cold',
                'description': 'The air conditioning in exam hall 5 was too cold during the recent exam, affecting concentration.',
                'category': 'examination',
                'student': student_users[4],
            },
            {
                'title': 'Incorrect grades in transcript',
                'description': 'My final grade in Physics does not match what was shown in the answer sheet.',
                'category': 'academic',
                'student': student_users[0],
            },
            {
                'title': 'Damaged dormitory furniture',
                'description': 'The desk in my room is broken and needs repair.',
                'category': 'hostel',
                'student': student_users[1],
            },
            {
                'title': 'Missing documents in file',
                'description': 'Some of my submitted documents are missing from my academic file.',
                'category': 'administrative',
                'student': student_users[2],
            },
        ]
        
        for complaint_data in complaints_data:
            complaint, created = Complaint.objects.get_or_create(
                title=complaint_data['title'],
                student=complaint_data['student'],
                defaults={
                    'description': complaint_data['description'],
                    'category': complaint_data['category'],
                    'priority': random.choice(priorities),
                    'status': random.choice(statuses),
                    'assigned_to': random.choice(admin_users),
                    'location': 'Campus'
                }
            )
            if created:
                self.stdout.write(f'Created complaint: {complaint.id_number}')
                
                # Create activity
                ComplaintActivity.objects.create(
                    complaint=complaint,
                    activity_type='submitted',
                    description=f'Complaint submitted by {complaint.student.get_full_name()}',
                    created_by=complaint.student
                )
                
                # Create admin response if resolved
                if complaint.status in ['resolved', 'in_progress']:
                    response = AdminResponse.objects.create(
                        complaint=complaint,
                        admin=complaint.assigned_to,
                        response_text='Thank you for bringing this to our attention. We are working on resolving this issue.'
                    )
                    self.stdout.write(f'Created response for complaint: {complaint.id_number}')
        
        self.stdout.write(self.style.SUCCESS('Successfully created sample data'))
