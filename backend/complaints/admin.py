from django.contrib import admin
from .models import Complaint, ComplaintAttachment, ComplaintActivity, AdminResponse, Notification


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ['id_number', 'title', 'student', 'category', 'status', 'priority', 'assigned_to', 'created_at']
    list_filter = ['status', 'category', 'priority', 'created_at', 'assigned_to']
    search_fields = ['id_number', 'title', 'description', 'student__email']
    readonly_fields = ['id_number', 'created_at', 'updated_at', 'resolved_at']
    fieldsets = (
        ('Basic Info', {'fields': ('id_number', 'student', 'title', 'description')}),
        ('Classification', {'fields': ('category', 'priority', 'location')}),
        ('Status', {'fields': ('status', 'assigned_to', 'satisfaction_rating')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at', 'resolved_at')}),
    )


@admin.register(ComplaintAttachment)
class ComplaintAttachmentAdmin(admin.ModelAdmin):
    list_display = ['file_name', 'complaint', 'file_size', 'uploaded_at']
    list_filter = ['uploaded_at']
    search_fields = ['file_name', 'complaint__id_number']
    readonly_fields = ['file_size', 'uploaded_at']


@admin.register(ComplaintActivity)
class ComplaintActivityAdmin(admin.ModelAdmin):
    list_display = ['complaint', 'activity_type', 'created_by', 'created_at']
    list_filter = ['activity_type', 'created_at']
    search_fields = ['complaint__id_number', 'description']
    readonly_fields = ['created_at']


@admin.register(AdminResponse)
class AdminResponseAdmin(admin.ModelAdmin):
    list_display = ['complaint', 'admin', 'created_at']
    list_filter = ['created_at']
    search_fields = ['complaint__id_number', 'response_text']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'notification_type', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['user__email', 'message']
    readonly_fields = ['created_at', 'read_at']
