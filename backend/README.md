# University Complaint Portal - Django Backend

A comprehensive REST API backend for the University Complaint Portal built with Django and Django REST Framework.

## Features

- User Authentication (Student & Admin)
- Complaint Management System
- Real-time Status Tracking
- Admin Dashboard & Analytics
- File Attachments Support
- Notification System
- Activity Timeline
- Role-based Access Control

## Project Structure

```
backend/
├── complaint_portal/        # Main Django project
│   ├── settings.py         # Project settings
│   ├── urls.py            # Root URL configuration
│   ├── wsgi.py            # WSGI configuration
│   └── __init__.py
├── accounts/               # User authentication app
│   ├── models.py          # User model
│   ├── views.py           # Authentication views
│   ├── serializers.py     # User serializers
│   ├── urls.py            # Auth URLs
│   └── admin.py           # Admin interface
├── complaints/             # Complaints management app
│   ├── models.py          # Complaint models
│   ├── views.py           # API views
│   ├── serializers.py     # Serializers
│   ├── permissions.py     # Permission classes
│   ├── urls.py            # URLs
│   └── admin.py           # Admin interface
├── manage.py              # Django management script
└── requirements.txt       # Python dependencies
```

## Installation

### 1. Prerequisites
- Python 3.8+
- pip package manager
- Virtual Environment (recommended)

### 2. Setup

1. Clone or navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

5. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. Create superuser:
```bash
python manage.py createsuperuser
```

7. Populate sample data (optional):
```bash
python manage.py populate_sample_data
```

8. Run development server:
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Authentication (`/api/auth/`)
- `POST /register/` - Register new user
- `POST /login/` - Login user
- `POST /logout/` - Logout user
- `GET /profile/` - Get current user profile
- `PUT /update_profile/` - Update user profile
- `POST /change_password/` - Change user password

### Complaints (`/api/complaints/`)
- `GET /` - List complaints (filtered by user type)
- `POST /` - Create new complaint
- `GET /{id}/` - Retrieve complaint details
- `PUT /{id}/` - Update complaint
- `DELETE /{id}/` - Delete complaint
- `PATCH /{id}/update_status/` - Update complaint status (admin)
- `POST /{id}/assign_admin/` - Assign to admin (admin)
- `POST /{id}/add_response/` - Add admin response
- `POST /{id}/rate/` - Rate complaint (student)
- `GET /my_complaints/` - Get user's complaints
- `GET /statistics/` - Get complaint statistics (admin)

### Notifications (`/api/complaints/notifications/`)
- `GET /` - List notifications
- `POST /{id}/mark_as_read/` - Mark notification as read
- `POST /mark_all_as_read/` - Mark all as read
- `GET /unread_count/` - Get unread count

## Authentication

The API uses Token Authentication. Include the token in headers:

```
Authorization: Token your-auth-token
```

### Login Example
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"student1@university.edu","password":"student123"}'
```

Response includes `token` for subsequent requests.

## User Types

- **Student**: Can submit complaints, view own complaints, rate resolutions
- **Admin**: Can view all complaints, update status, assign complaints, add responses

### Sample Credentials

**Admin:**
- Username: `admin1`
- Password: `admin123`

**Student:**
- Username: `student1`
- Password: `student123`

(Created by `populate_sample_data` command)

## Models

### User
- Custom user model with student/admin roles
- Fields: username, email, first_name, last_name, student_id, phone_number, profile_picture
- Relationships: complaints, assigned_complaints, responses, notifications, activities

### Complaint
- Title, description, category, priority
- Status: pending, in_progress, resolved, rejected
- Relationships: student, assigned_to, attachments, responses, activities, notifications

### ComplaintAttachment
- File uploads for complaints
- Fields: file, file_name, file_size, uploaded_at

### AdminResponse
- Admin responses/comments on complaints
- Fields: response_text, admin, created_at, updated_at

### ComplaintActivity
- Activity log for complaints
- Types: submitted, status_changed, assigned, comment_added, etc.

### Notification
- User notifications
- Types: complaint_submitted, status_updated, response_added, etc.

## Filtering & Searching

Complaints can be filtered by:
- `status` - pending, in_progress, resolved, rejected
- `category` - academic, hostel, administrative, financial, examination, transportation, other
- `priority` - low, medium, high, urgent
- `assigned_to` - admin user ID

Search by: title, description, id_number

Ordering by: created_at, priority, status

Example:
```
GET /api/complaints/?status=pending&category=academic&ordering=-created_at
```

## Permissions

- **IsAuthenticated**: User must be logged in
- **IsStudentOwnerOrAdmin**: Student can only access own complaints or admin can access all
- **IsAdmin**: Only admin users can access

## Settings Configuration

Key settings in `complaint_portal/settings.py`:

- `AUTH_USER_MODEL = 'accounts.User'` - Custom user model
- `REST_FRAMEWORK` - DRF configuration with token auth
- `CORS_ALLOWED_ORIGINS` - CORS configuration
- `INSTALLED_APPS` - Registered Django apps

## Admin Interface

Access Django admin at:
- URL: `http://localhost:8000/admin/`
- Username: superuser (created during setup)

Manage:
- Users
- Complaints
- Attachments
- Responses
- Activities
- Notifications

## Development

### Create Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Run Tests (if implemented)
```bash
python manage.py test
```

### Collect Static Files
```bash
python manage.py collectstatic
```

## Production Deployment

1. Set `DEBUG=False` in `.env`
2. Generate secure `SECRET_KEY`
3. Configure `ALLOWED_HOSTS`
4. Use PostgreSQL instead of SQLite
5. Configure proper email backend
6. Use gunicorn and nginx
7. Enable HTTPS
8. Set up proper logging

## CORS Configuration

By default, CORS is enabled for:
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://localhost`
- `http://127.0.0.1`

Update `CORS_ALLOWED_ORIGINS` in `.env` for production.

## Error Handling

API returns appropriate HTTP status codes:
- `200 OK` - Successful request
- `201 Created` - Resource created
- `400 Bad Request` - Invalid data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Permission denied
- `404 Not Found` - Resource not found
- `500 Server Error` - Server error

## Dependencies

- Django 4.2.7
- djangorestframework 3.14.0
- django-cors-headers 4.3.1
- python-decouple 3.8
- Pillow 10.1.0
- django-filter 23.5

## License

This project is part of the University Complaint Portal system.

## Support

For issues or questions, please contact the development team.
