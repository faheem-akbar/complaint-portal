from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from accounts.models import User


class Complaint(models.Model):
    """Model for storing complaints submitted by students"""
    
    CATEGORY_CHOICES = [
        ('academic', 'Academic'),
        ('hostel', 'Hostel'),
        ('administrative', 'Administrative'),
        ('financial', 'Financial'),
        ('examination', 'Examination'),
        ('transportation', 'Transportation'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('rejected', 'Rejected'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    # Basic Information
    id_number = models.CharField(max_length=50, unique=True, editable=False)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='complaints', limit_choices_to={'user_type': 'student'})
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    
    # Status and Priority
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    
    # Location
    location = models.CharField(max_length=255, blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    # Admin Assignment
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_complaints', limit_choices_to={'user_type': 'admin'})
    
    # Satisfaction
    satisfaction_rating = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    
    class Meta:
        verbose_name = 'Complaint'
        verbose_name_plural = 'Complaints'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student', '-created_at']),
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['category', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.id_number} - {self.title}"
    
    def save(self, *args, **kwargs):
        if not self.id_number:
            from django.utils import timezone
            count = Complaint.objects.count() + 1
            year = timezone.now().year
            self.id_number = f"CMP-{year}-{str(count).zfill(3)}"
        super().save(*args, **kwargs)


class ComplaintAttachment(models.Model):
    """Model for storing file attachments related to complaints"""
    
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='complaint_attachments/')
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField()  # in bytes
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Complaint Attachment'
        verbose_name_plural = 'Complaint Attachments'
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.complaint.id_number} - {self.file_name}"
    
    def save(self, *args, **kwargs):
        if self.file:
            self.file_size = self.file.size
            self.file_name = self.file.name
        super().save(*args, **kwargs)


class ComplaintActivity(models.Model):
    """Model for tracking activity/updates on complaints"""
    
    ACTIVITY_TYPE_CHOICES = [
        ('submitted', 'Submitted'),
        ('status_changed', 'Status Changed'),
        ('assigned', 'Assigned'),
        ('comment_added', 'Comment Added'),
        ('attachment_added', 'Attachment Added'),
        ('resolved', 'Resolved'),
        ('reopened', 'Reopened'),
        ('rejected', 'Rejected'),
    ]
    
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPE_CHOICES)
    description = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Complaint Activity'
        verbose_name_plural = 'Complaint Activities'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.complaint.id_number} - {self.activity_type}"


class AdminResponse(models.Model):
    """Model for admin responses to complaints"""
    
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='responses')
    admin = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='admin_responses', limit_choices_to={'user_type': 'admin'})
    response_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Admin Response'
        verbose_name_plural = 'Admin Responses'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.complaint.id_number} - Response by {self.admin.username if self.admin else 'Unknown'}"


class Notification(models.Model):
    """Model for notifications to users"""
    
    NOTIFICATION_TYPE_CHOICES = [
        ('complaint_submitted', 'Complaint Submitted'),
        ('status_updated', 'Status Updated'),
        ('response_added', 'Response Added'),
        ('complaint_resolved', 'Complaint Resolved'),
        ('complaint_rejected', 'Complaint Rejected'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPE_CHOICES)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Notification for {self.user.username} - {self.notification_type}"
