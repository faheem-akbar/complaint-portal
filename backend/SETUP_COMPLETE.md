# Complete University Complaint Portal - Backend Setup Guide

## What's Included

This is a complete Django REST Framework backend for the University Complaint Portal with:

✅ **User Authentication System**
- Custom User model supporting Student and Admin roles
- Token-based authentication
- Registration, login, logout
- Password management
- Profile updates

✅ **Complaint Management**
- Create, read, update complaints
- Status tracking (pending, in_progress, resolved, rejected)
- Priority levels (low, medium, high, urgent)
- Categories (academic, hostel, administrative, etc.)
- File attachments support

✅ **Admin Features**
- View all complaints
- Assign complaints to admins
- Update complaint status
- Add admin responses
- View statistics and analytics

✅ **Notification System**
- Real-time notifications
- Mark as read
- Notification history

✅ **Activity Tracking**
- Track all complaint activities
- Timeline of changes
- Admin responses logging

✅ **Role-Based Access Control**
- Student access control
- Admin access control
- Permission-based views

## Directory Structure

```
backend/
├── complaint_portal/              # Django project settings
│   ├── __init__.py
│   ├── settings.py               # Main settings
│   ├── urls.py                   # Root URL routing
│   ├── wsgi.py                   # WSGI configuration
│   └── asgi.py
│
├── accounts/                      # User authentication app
│   ├── migrations/
│   ├── __init__.py
│   ├── models.py                 # User model
│   ├── views.py                  # Auth endpoints
│   ├── serializers.py            # User serializers
│   ├── urls.py                   # Auth URLs
│   ├── admin.py                  # Django admin config
│   ├── apps.py
│   ├── signals.py                # Signal handlers
│   └── tests.py
│
├── complaints/                    # Complaints app
│   ├── migrations/
│   ├── management/
│   │   └── commands/
│   │       └── populate_sample_data.py  # Sample data command
│   ├── __init__.py
│   ├── models.py                 # Complaint models
│   ├── views.py                  # API views
│   ├── serializers.py            # Serializers
│   ├── permissions.py            # Permission classes
│   ├── urls.py                   # Complaint URLs
│   ├── admin.py                  # Django admin config
│   ├── apps.py
│   └── tests.py
│
├── manage.py                      # Django management command
├── requirements.txt               # Dependencies
├── .env.example                   # Environment template
├── .gitignore                     # Git ignore rules
├── README.md                      # Full documentation
├── QUICKSTART.md                  # Quick start guide
├── FRONTEND_INTEGRATION.md        # Frontend integration guide
├── Dockerfile                     # Docker configuration
├── docker-compose.yml             # Docker compose
└── db.sqlite3                     # SQLite database (auto-created)
```

## Quick Start (5 minutes)

1. **Navigate to backend**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   # Windows: venv\Scripts\activate
   # macOS/Linux: source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Setup database**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python manage.py populate_sample_data
   ```

5. **Run server**
   ```bash
   python manage.py runserver
   ```

6. **Access**
   - API: http://localhost:8000/api/
   - Admin: http://localhost:8000/admin/
   - Sample user: admin1 / admin123

## API Endpoints Summary

### Authentication
- `POST /api/auth/register/` - Register
- `POST /api/auth/login/` - Login
- `POST /api/auth/logout/` - Logout
- `GET /api/auth/profile/` - Get profile
- `PUT /api/auth/update_profile/` - Update profile
- `POST /api/auth/change_password/` - Change password

### Complaints
- `GET /api/complaints/` - List complaints
- `POST /api/complaints/` - Create complaint
- `GET /api/complaints/{id}/` - Detail
- `PUT /api/complaints/{id}/` - Update
- `DELETE /api/complaints/{id}/` - Delete
- `PATCH /api/complaints/{id}/update_status/` - Change status
- `POST /api/complaints/{id}/assign_admin/` - Assign to admin
- `POST /api/complaints/{id}/add_response/` - Add response
- `POST /api/complaints/{id}/rate/` - Rate complaint
- `GET /api/complaints/my_complaints/` - User's complaints
- `GET /api/complaints/statistics/` - Admin stats

### Notifications
- `GET /api/complaints/notifications/` - List notifications
- `POST /api/complaints/notifications/{id}/mark_as_read/` - Mark read
- `POST /api/complaints/notifications/mark_all_as_read/` - Mark all read
- `GET /api/complaints/notifications/unread_count/` - Unread count

## Sample Data

The `populate_sample_data` command creates:
- 2 Admin accounts (admin1, admin2)
- 5 Student accounts (student1-5)
- 8 Sample complaints
- Admin responses and activities

**Default credentials:**
- Admin: admin1 / admin123
- Students: student1-5 / student123

## Configuration

### Environment Variables (.env)
```
SECRET_KEY=your-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,...
```

### Settings (settings.py)
- Authentication: Token-based
- Database: SQLite (change to PostgreSQL for production)
- CORS: Configured for localhost development
- Media files: /media directory
- Static files: /staticfiles directory

## Models

### User
Extended Django User with student/admin roles
- Fields: username, email, first_name, last_name, student_id, phone_number, profile_picture
- Relationships: complaints, assigned_complaints, responses

### Complaint
- Fields: id_number, title, description, category, status, priority, location
- Relationships: student, assigned_to, attachments, responses, activities
- Status: pending, in_progress, resolved, rejected
- Priority: low, medium, high, urgent
- Categories: academic, hostel, administrative, financial, examination, transportation, other

### ComplaintAttachment
- File uploads for complaints
- Fields: file, file_name, file_size, uploaded_at

### AdminResponse
- Admin comments on complaints
- Fields: response_text, admin, created_at, updated_at

### ComplaintActivity
- Activity log for complaints
- Types: submitted, status_changed, assigned, comment_added, resolved, etc.

### Notification
- User notifications
- Types: complaint_submitted, status_updated, response_added, complaint_resolved, etc.

## Features

### Authentication & Authorization
- Token-based authentication
- Custom permission classes
- Role-based access control

### Complaint Management
- Full CRUD operations
- Status lifecycle management
- Priority and category classification
- File attachments
- Admin assignment

### Notifications
- Real-time notifications
- Unread tracking
- Bulk mark as read

### Admin Features
- Complaint statistics
- Status management
- Admin assignment
- Response system

### Search & Filter
- Filter by status, category, priority
- Full-text search
- Sorting by date, priority, status

## Development

### Run Tests
```bash
python manage.py test
```

### Create Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Django Admin
```
http://localhost:8000/admin/
```

### API Documentation
The API is self-documenting through DRF's browsable API at each endpoint.

## Production Checklist

- [ ] Set DEBUG=False
- [ ] Generate secure SECRET_KEY
- [ ] Configure ALLOWED_HOSTS
- [ ] Setup PostgreSQL database
- [ ] Configure proper email backend
- [ ] Enable HTTPS
- [ ] Setup logging
- [ ] Configure CORS for production domain
- [ ] Setup static/media file serving
- [ ] Use gunicorn + nginx
- [ ] Enable security middleware

## Docker Deployment

### Build and run
```bash
docker-compose up -d
```

### Access
- API: http://localhost:8000/api/
- Admin: http://localhost:8000/admin/
- Database: PostgreSQL at localhost:5432

## Frontend Integration

See `FRONTEND_INTEGRATION.md` for detailed guide on connecting the frontend to this API.

Key points:
- API base: http://localhost:8000/api/
- Authentication: Token in header
- CORS: Enabled for localhost
- Response format: JSON

## Troubleshooting

### Port 8000 in use
```bash
python manage.py runserver 8001
```

### Database errors
```bash
python manage.py migrate --run-syncdb
```

### Missing dependencies
```bash
pip install -r requirements.txt
```

### Virtual environment issues
- Delete venv folder and recreate
- Ensure Python 3.8+ installed

## Support

For issues or questions:
1. Check README.md
2. Review QUICKSTART.md
3. Check FRONTEND_INTEGRATION.md
4. Review Django REST Framework docs
5. Check Django documentation

## Next Steps

1. Read full README.md
2. Test API endpoints
3. Create superuser
4. Explore admin interface
5. Integrate with frontend
6. Customize as needed
7. Deploy to production
