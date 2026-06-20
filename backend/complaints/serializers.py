from rest_framework import serializers
from .models import Complaint, ComplaintAttachment, AdminResponse, ComplaintActivity, Notification
from accounts.serializers import UserSerializer


class ComplaintAttachmentSerializer(serializers.ModelSerializer):
    """Serializer for complaint attachments"""
    
    class Meta:
        model = ComplaintAttachment
        fields = ['id', 'complaint', 'file', 'file_name', 'file_size', 'uploaded_at']
        read_only_fields = ['id', 'file_name', 'file_size', 'uploaded_at']


class AdminResponseSerializer(serializers.ModelSerializer):
    """Serializer for admin responses"""
    
    admin = UserSerializer(read_only=True)
    
    class Meta:
        model = AdminResponse
        fields = ['id', 'complaint', 'admin', 'response_text', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ComplaintActivitySerializer(serializers.ModelSerializer):
    """Serializer for complaint activity"""
    
    created_by = UserSerializer(read_only=True)
    
    class Meta:
        model = ComplaintActivity
        fields = ['id', 'complaint', 'activity_type', 'description', 'created_by', 'created_at']
        read_only_fields = ['id', 'created_at']


class ComplaintSerializer(serializers.ModelSerializer):
    """Serializer for complaints"""
    
    student = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    attachments = ComplaintAttachmentSerializer(many=True, read_only=True)
    responses = AdminResponseSerializer(many=True, read_only=True)
    activities = ComplaintActivitySerializer(many=True, read_only=True)
    
    class Meta:
        model = Complaint
        fields = [
            'id', 'id_number', 'student', 'title', 'description', 'category',
            'status', 'priority', 'location', 'assigned_to', 'satisfaction_rating',
            'created_at', 'updated_at', 'resolved_at',
            'attachments', 'responses', 'activities'
        ]
        read_only_fields = ['id', 'id_number', 'created_at', 'updated_at', 'resolved_at']


class ComplaintCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating complaints"""
    
    class Meta:
        model = Complaint
        fields = [
            'title', 'description', 'category',
            'priority', 'location'
        ]


class ComplaintStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating complaint status (admin only)"""
    
    class Meta:
        model = Complaint
        fields = ['status', 'assigned_to']


class ComplaintRatingSerializer(serializers.ModelSerializer):
    """Serializer for rating complaints"""
    
    class Meta:
        model = Complaint
        fields = ['satisfaction_rating']


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications"""
    
    complaint = ComplaintSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = ['id', 'user', 'complaint', 'notification_type', 'message', 'is_read', 'created_at', 'read_at']
        read_only_fields = ['id', 'created_at', 'read_at']
