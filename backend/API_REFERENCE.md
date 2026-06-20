# API Reference Documentation

## Base URL
```
http://localhost:8000/api/
```

## Authentication
All requests (except login/register) require:
```
Authorization: Token your-auth-token
```

## Response Format
```json
{
  "id": 1,
  "field": "value"
}
```

Error response:
```json
{
  "field": ["error message"]
}
```

---

## Authentication Endpoints

### Register User
**Endpoint:** `POST /auth/register/`

**Request Body:**
```json
{
  "username": "student1",
  "email": "student@university.edu",
  "first_name": "John",
  "last_name": "Doe",
  "password": "securepass123",
  "confirm_password": "securepass123",
  "student_id": "STU0001",
  "user_type": "student"
}
```

**Response:** (201 Created)
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "student1",
    "email": "student@university.edu",
    "first_name": "John",
    "last_name": "Doe",
    "user_type": "student",
    "student_id": "STU0001"
  },
  "token": "abc123token"
}
```

---

### Login
**Endpoint:** `POST /auth/login/`

**Request Body:**
```json
{
  "email": "student@university.edu",
  "password": "securepass123"
}
```

**Response:** (200 OK)
```json
{
  "message": "Login successful",
  "user": { ... },
  "token": "abc123token"
}
```

---

### Logout
**Endpoint:** `POST /auth/logout/`

**Authentication:** Required

**Response:** (200 OK)
```json
{
  "message": "Logged out successfully"
}
```

---

### Get Profile
**Endpoint:** `GET /auth/profile/`

**Authentication:** Required

**Response:** (200 OK)
```json
{
  "id": 1,
  "username": "student1",
  "email": "student@university.edu",
  "first_name": "John",
  "last_name": "Doe",
  "user_type": "student",
  "student_id": "STU0001",
  "phone_number": "+1234567890",
  "profile_picture": null,
  "is_verified": false,
  "date_joined": "2024-06-17T10:00:00Z"
}
```

---

### Update Profile
**Endpoint:** `PUT /auth/update_profile/`

**Authentication:** Required

**Request Body:** (all fields optional)
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "phone_number": "+1987654321",
  "profile_picture": null
}
```

**Response:** (200 OK)
```json
{
  "message": "Profile updated successfully",
  "user": { ... }
}
```

---

### Change Password
**Endpoint:** `POST /auth/change_password/`

**Authentication:** Required

**Request Body:**
```json
{
  "old_password": "oldpass123",
  "new_password": "newpass123",
  "confirm_password": "newpass123"
}
```

**Response:** (200 OK)
```json
{
  "message": "Password changed successfully",
  "token": "new_auth_token"
}
```

---

## Complaint Endpoints

### List Complaints
**Endpoint:** `GET /complaints/`

**Authentication:** Required

**Query Parameters:**
- `status`: pending, in_progress, resolved, rejected
- `category`: academic, hostel, administrative, financial, examination, transportation, other
- `priority`: low, medium, high, urgent
- `assigned_to`: admin user ID
- `search`: search by title, description, id_number
- `ordering`: -created_at, created_at, -priority, status
- `page`: page number (default: 1)

**Example:**
```
GET /complaints/?status=pending&category=academic&ordering=-created_at
```

**Response:** (200 OK)
```json
{
  "count": 10,
  "next": "http://localhost:8000/api/complaints/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "id_number": "CMP-2024-001",
      "title": "Library closing time",
      "description": "...",
      "category": "academic",
      "status": "pending",
      "priority": "medium",
      "student": { ... },
      "assigned_to": null,
      "created_at": "2024-06-17T10:00:00Z",
      "updated_at": "2024-06-17T10:00:00Z"
    }
  ]
}
```

---

### Create Complaint
**Endpoint:** `POST /complaints/`

**Authentication:** Required (Student)

**Request Body:**
```json
{
  "title": "Library closing time too early",
  "description": "The library closes at 6 PM which is too early...",
  "category": "academic",
  "priority": "medium",
  "location": "Main Library"
}
```

**Response:** (201 Created)
```json
{
  "id": 1,
  "id_number": "CMP-2024-001",
  "title": "Library closing time too early",
  "description": "...",
  "category": "academic",
  "status": "pending",
  "priority": "medium",
  "student": { ... },
  "attachments": [],
  "responses": [],
  "activities": []
}
```

---

### Get Complaint Detail
**Endpoint:** `GET /complaints/{id}/`

**Authentication:** Required

**Response:** (200 OK)
```json
{
  "id": 1,
  "id_number": "CMP-2024-001",
  "title": "Library closing time too early",
  "description": "...",
  "category": "academic",
  "status": "pending",
  "priority": "medium",
  "student": { ... },
  "assigned_to": null,
  "attachments": [
    {
      "id": 1,
      "file": "http://localhost:8000/media/complaint_attachments/file.pdf",
      "file_name": "evidence.pdf",
      "file_size": 102400,
      "uploaded_at": "2024-06-17T10:05:00Z"
    }
  ],
  "responses": [
    {
      "id": 1,
      "admin": { ... },
      "response_text": "Thank you for reporting...",
      "created_at": "2024-06-17T11:00:00Z"
    }
  ],
  "activities": [
    {
      "id": 1,
      "activity_type": "submitted",
      "description": "Complaint submitted by John Doe",
      "created_by": { ... },
      "created_at": "2024-06-17T10:00:00Z"
    }
  ]
}
```

---

### Update Complaint (Student)
**Endpoint:** `PUT /complaints/{id}/`

**Authentication:** Required (Student owner)

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "category": "academic",
  "priority": "high"
}
```

**Response:** (200 OK)
```json
{ ... updated complaint data ... }
```

---

### Delete Complaint (Student)
**Endpoint:** `DELETE /complaints/{id}/`

**Authentication:** Required (Student owner)

**Response:** (204 No Content)

---

### Update Complaint Status (Admin)
**Endpoint:** `PATCH /complaints/{id}/update_status/`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "status": "in_progress"
}
```

**Response:** (200 OK)
```json
{ ... updated complaint data ... }
```

---

### Assign Complaint to Admin
**Endpoint:** `POST /complaints/{id}/assign_admin/`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "assigned_to": 2
}
```

**Response:** (200 OK)
```json
{ ... updated complaint data ... }
```

---

### Add Admin Response
**Endpoint:** `POST /complaints/{id}/add_response/`

**Authentication:** Required (Admin or Student)

**Request Body:**
```json
{
  "response_text": "We are working on this issue..."
}
```

**Response:** (201 Created)
```json
{
  "id": 1,
  "complaint": 1,
  "admin": { ... },
  "response_text": "We are working on this issue...",
  "created_at": "2024-06-17T11:00:00Z"
}
```

---

### Rate Complaint (Student)
**Endpoint:** `POST /complaints/{id}/rate/`

**Authentication:** Required (Student owner)

**Request Body:**
```json
{
  "satisfaction_rating": 5
}
```

**Response:** (200 OK)
```json
{ ... updated complaint data with rating ... }
```

---

### Get User's Complaints
**Endpoint:** `GET /complaints/my_complaints/`

**Authentication:** Required

**Response:** (200 OK)
```json
[
  { ... complaint data ... }
]
```

---

### Get Admin Statistics
**Endpoint:** `GET /complaints/statistics/`

**Authentication:** Required (Admin only)

**Response:** (200 OK)
```json
{
  "total_complaints": 20,
  "pending": 5,
  "in_progress": 8,
  "resolved": 6,
  "rejected": 1,
  "by_category": {
    "academic": 8,
    "hostel": 5,
    "administrative": 4,
    "financial": 2,
    "examination": 1,
    "transportation": 0,
    "other": 0
  }
}
```

---

## Notification Endpoints

### List Notifications
**Endpoint:** `GET /complaints/notifications/`

**Authentication:** Required

**Query Parameters:**
- `page`: page number
- `ordering`: -created_at (default)

**Response:** (200 OK)
```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "user": 1,
      "complaint": 1,
      "notification_type": "status_updated",
      "message": "Your complaint status has been updated to in_progress",
      "is_read": false,
      "created_at": "2024-06-17T11:00:00Z",
      "read_at": null
    }
  ]
}
```

---

### Mark Notification as Read
**Endpoint:** `POST /complaints/notifications/{id}/mark_as_read/`

**Authentication:** Required

**Response:** (200 OK)
```json
{
  "id": 1,
  "is_read": true,
  "read_at": "2024-06-17T11:05:00Z"
}
```

---

### Mark All Notifications as Read
**Endpoint:** `POST /complaints/notifications/mark_all_as_read/`

**Authentication:** Required

**Response:** (200 OK)
```json
{
  "message": "All notifications marked as read"
}
```

---

### Get Unread Count
**Endpoint:** `GET /complaints/notifications/unread_count/`

**Authentication:** Required

**Response:** (200 OK)
```json
{
  "unread_count": 3
}
```

---

## Status Codes

- `200 OK` - Successful GET, PUT, PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Invalid data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Server Error` - Server error

---

## Error Responses

### Validation Error
```json
{
  "field": ["error message"]
}
```

### Authentication Error
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### Permission Error
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### Not Found Error
```json
{
  "detail": "Not found."
}
```

---

## Rate Limiting

No rate limiting implemented in development.

In production, consider implementing rate limiting on:
- Authentication endpoints
- Complaint creation
- Notification endpoints

---

## Pagination

Default page size: 20 items

Customize with:
```
GET /complaints/?page=2&page_size=50
```

---

## Sorting

Available fields:
- `created_at` - By creation date
- `-created_at` - By creation date (newest first)
- `priority` - By priority
- `-priority` - By priority (high to low)
- `status` - By status

---

## Useful Examples

### Get pending complaints for academic category
```
GET /complaints/?status=pending&category=academic&ordering=-created_at
```

### Get complaints assigned to admin with ID 2
```
GET /complaints/?assigned_to=2&ordering=-created_at
```

### Search for specific complaint
```
GET /complaints/?search=library
```

### Get user's resolved complaints
```
GET /complaints/my_complaints/?status=resolved
```

---

## Testing with cURL

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"student1@university.edu","password":"student123"}'
```

### List complaints
```bash
curl -X GET http://localhost:8000/api/complaints/ \
  -H "Authorization: Token your-token"
```

### Create complaint
```bash
curl -X POST http://localhost:8000/api/complaints/ \
  -H "Authorization: Token your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test complaint",
    "description": "Description here",
    "category": "academic",
    "priority": "medium"
  }'
```

---

## Webhooks & Real-time Updates

Not implemented in this version. Consider adding:
- WebSockets for real-time notifications
- Celery for background tasks
- Redis for caching

---

## Versioning

Current API version: v1

Future versions may have breaking changes. Always specify version in requests if available.

---

## Security

- HTTPS required in production
- CORS enabled for configured origins only
- Token authentication (secure tokens)
- Password hashing (Django default)
- SQL injection protection (ORM)
- CSRF protection enabled
- Permission-based access control
