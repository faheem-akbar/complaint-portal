from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'user_type', 'student_id', 'is_verified', 'date_joined']
    list_filter = ['user_type', 'is_verified', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'student_id']
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'phone_number', 'profile_picture')}),
        ('Account info', {'fields': ('user_type', 'student_id', 'is_verified')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined', 'updated_at')}),
    )
    readonly_fields = ['date_joined', 'updated_at']
