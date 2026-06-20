from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ComplaintViewSet, NotificationViewSet

router = DefaultRouter()
router.register('', ComplaintViewSet, basename='complaint')
router.register('notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]
