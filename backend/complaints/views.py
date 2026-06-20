from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Complaint, AdminResponse, ComplaintActivity, Notification
from .serializers import (
    ComplaintSerializer, ComplaintCreateUpdateSerializer, ComplaintStatusUpdateSerializer,
    ComplaintRatingSerializer, AdminResponseSerializer, NotificationSerializer
)
from .permissions import IsStudentOwnerOrAdmin, IsAdmin
from accounts.models import User


class ComplaintViewSet(viewsets.ModelViewSet):
    """ViewSet for complaints"""
    
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'category', 'priority', 'assigned_to']
    search_fields = ['title', 'description', 'id_number']
    ordering_fields = ['created_at', 'priority', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter complaints based on user type"""
        user = self.request.user
        if user.user_type == 'admin':
            return Complaint.objects.all()
        return Complaint.objects.filter(student=user)
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'create':
            return ComplaintCreateUpdateSerializer
        elif self.action == 'partial_update':
            return ComplaintCreateUpdateSerializer
        elif self.action in ['update_status', 'assign_admin']:
            return ComplaintStatusUpdateSerializer
        elif self.action == 'rate':
            return ComplaintRatingSerializer
        return ComplaintSerializer
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action in ['update_status', 'assign_admin', 'add_response']:
            return [IsAdmin()]
        elif self.action in ['rate', 'partial_update', 'update', 'destroy']:
            return [IsStudentOwnerOrAdmin()]
        return [IsAuthenticated()]
    
    def create(self, request, *args, **kwargs):
        """Create a new complaint"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        complaint = Complaint.objects.create(
            student=request.user,
            **serializer.validated_data
        )
        
        # Create activity
        ComplaintActivity.objects.create(
            complaint=complaint,
            activity_type='submitted',
            description=f'Complaint submitted by {request.user.get_full_name() or request.user.username}',
            created_by=request.user
        )
        
        # Create notification for admins
        admin_users = User.objects.filter(user_type='admin')
        for admin in admin_users:
            Notification.objects.create(
                user=admin,
                complaint=complaint,
                notification_type='complaint_submitted',
                message=f'New complaint submitted: {complaint.title}'
            )
        
        serializer = ComplaintSerializer(complaint)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAdmin()])
    def update_status(self, request, pk=None):
        """Update complaint status (admin only)"""
        complaint = self.get_object()
        old_status = complaint.status
        
        serializer = self.get_serializer(complaint, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        complaint = serializer.save()
        
        if complaint.status != old_status:
            # Create activity
            ComplaintActivity.objects.create(
                complaint=complaint,
                activity_type='status_changed',
                description=f'Status changed from {old_status} to {complaint.status}',
                created_by=request.user
            )
            
            # Create notification for student
            Notification.objects.create(
                user=complaint.student,
                complaint=complaint,
                notification_type='status_updated',
                message=f'Your complaint status has been updated to {complaint.get_status_display()}'
            )
            
            # If resolved, mark resolved_at
            if complaint.status == 'resolved':
                complaint.resolved_at = timezone.now()
                complaint.save()
                
                Notification.objects.create(
                    user=complaint.student,
                    complaint=complaint,
                    notification_type='complaint_resolved',
                    message=f'Your complaint has been resolved.'
                )
        
        serializer = ComplaintSerializer(complaint)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdmin()])
    def assign_admin(self, request, pk=None):
        """Assign complaint to admin (admin only)"""
        complaint = self.get_object()
        admin_id = request.data.get('assigned_to')
        
        if not admin_id:
            return Response({'assigned_to': 'This field is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            admin = User.objects.get(id=admin_id, user_type='admin')
        except User.DoesNotExist:
            return Response({'assigned_to': 'Admin user not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        complaint.assigned_to = admin
        complaint.save()
        
        ComplaintActivity.objects.create(
            complaint=complaint,
            activity_type='assigned',
            description=f'Complaint assigned to {admin.get_full_name() or admin.username}',
            created_by=request.user
        )
        
        serializer = ComplaintSerializer(complaint)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_response(self, request, pk=None):
        """Add admin response to complaint"""
        complaint = self.get_object()
        
        if request.user.user_type != 'admin' and complaint.student != request.user:
            return Response({'detail': 'You do not have permission'}, status=status.HTTP_403_FORBIDDEN)
        
        response_text = request.data.get('response_text')
        if not response_text:
            return Response({'response_text': 'This field is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        response = AdminResponse.objects.create(
            complaint=complaint,
            admin=request.user,
            response_text=response_text
        )
        
        ComplaintActivity.objects.create(
            complaint=complaint,
            activity_type='comment_added',
            description=f'Comment added by {request.user.get_full_name() or request.user.username}',
            created_by=request.user
        )
        
        # Notify the student if admin responded
        if request.user.user_type == 'admin':
            Notification.objects.create(
                user=complaint.student,
                complaint=complaint,
                notification_type='response_added',
                message=f'New response on your complaint from admin'
            )
        
        serializer = AdminResponseSerializer(response)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], permission_classes=[IsStudentOwnerOrAdmin()])
    def rate(self, request, pk=None):
        """Rate a complaint (student only)"""
        complaint = self.get_object()
        
        if complaint.student != request.user:
            return Response({'detail': 'You can only rate your own complaints'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(complaint, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        complaint = serializer.save()
        
        serializer = ComplaintSerializer(complaint)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_complaints(self, request):
        """Get current user's complaints"""
        if request.user.user_type == 'student':
            complaints = Complaint.objects.filter(student=request.user)
        else:
            complaints = Complaint.objects.filter(assigned_to=request.user)
        
        serializer = ComplaintSerializer(complaints, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdmin()])
    def statistics(self, request):
        """Get complaint statistics (admin only)"""
        total_complaints = Complaint.objects.count()
        pending = Complaint.objects.filter(status='pending').count()
        in_progress = Complaint.objects.filter(status='in_progress').count()
        resolved = Complaint.objects.filter(status='resolved').count()
        rejected = Complaint.objects.filter(status='rejected').count()
        
        category_stats = {}
        for category, _ in Complaint.CATEGORY_CHOICES:
            category_stats[category] = Complaint.objects.filter(category=category).count()
        
        return Response({
            'total_complaints': total_complaints,
            'pending': pending,
            'in_progress': in_progress,
            'resolved': resolved,
            'rejected': rejected,
            'by_category': category_stats,
        })


class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for notifications"""
    
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter notifications for current user"""
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save()
        
        serializer = self.get_serializer(notification)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Mark all notifications as read"""
        Notification.objects.filter(user=request.user, is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )
        return Response({'message': 'All notifications marked as read'})
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'unread_count': count})
