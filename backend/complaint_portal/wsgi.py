"""
WSGI config for complaint_portal project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'complaint_portal.settings')

application = get_wsgi_application()
