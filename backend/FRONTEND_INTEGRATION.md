# Frontend Integration Guide

## Overview

This guide explains how to integrate the Django backend API with the frontend.

## API Base URL

During development:
```
http://localhost:8000/api/
```

## Authentication Flow

1. **Register**
   - Endpoint: `POST /auth/register/`
   - Returns: user data + auth token
   - Store token in localStorage

2. **Login**
   - Endpoint: `POST /auth/login/`
   - Returns: user data + auth token
   - Store token in localStorage

3. **Include Token in Requests**
   - Header: `Authorization: Token your-token-here`
   - Include in all subsequent requests

4. **Logout**
   - Endpoint: `POST /auth/logout/`
   - Clears token on server

## Frontend JavaScript Examples

### Setup API Client

```javascript
// api.js
const API_URL = 'http://localhost:8000/api';

const headers = {
    'Content-Type': 'application/json',
};

// Add token to headers if available
const getHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        ...headers,
        ...(token && { 'Authorization': `Token ${token}` })
    };
};

export { API_URL, getHeaders };
```

### Register

```javascript
// auth.js
async function register(userData) {
    const response = await fetch(`${API_URL}/auth/register/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
            username: userData.email.split('@')[0],
            email: userData.email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            password: userData.password,
            confirm_password: userData.confirmPassword,
            student_id: userData.studentId,
            user_type: 'student'
        })
    });
    
    const data = await response.json();
    if (response.ok) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    }
    throw new Error(data.message);
}
```

### Login

```javascript
async function login(email, password) {
    const response = await fetch(`${API_URL}/auth/login/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
            email: email,
            password: password
        })
    });
    
    const data = await response.json();
    if (response.ok) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    }
    throw new Error(data.message);
}
```

### Get Complaints

```javascript
async function getComplaints(filters = {}) {
    let url = `${API_URL}/complaints/?`;
    
    // Add filters
    if (filters.status) url += `status=${filters.status}&`;
    if (filters.category) url += `category=${filters.category}&`;
    if (filters.priority) url += `priority=${filters.priority}&`;
    if (filters.search) url += `search=${filters.search}&`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders()
    });
    
    return await response.json();
}
```

### Create Complaint

```javascript
async function createComplaint(complaintData) {
    const response = await fetch(`${API_URL}/complaints/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
            title: complaintData.title,
            description: complaintData.description,
            category: complaintData.category,
            priority: complaintData.priority,
            location: complaintData.location
        })
    });
    
    const data = await response.json();
    if (response.ok) {
        return data;
    }
    throw new Error('Failed to create complaint');
}
```

### Update Complaint Status (Admin)

```javascript
async function updateComplaintStatus(complaintId, status) {
    const response = await fetch(
        `${API_URL}/complaints/${complaintId}/update_status/`,
        {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ status: status })
        }
    );
    
    return await response.json();
}
```

### Get Notifications

```javascript
async function getNotifications() {
    const response = await fetch(`${API_URL}/complaints/notifications/`, {
        method: 'GET',
        headers: getHeaders()
    });
    
    return await response.json();
}
```

### Mark Notification as Read

```javascript
async function markNotificationAsRead(notificationId) {
    const response = await fetch(
        `${API_URL}/complaints/notifications/${notificationId}/mark_as_read/`,
        {
            method: 'POST',
            headers: getHeaders()
        }
    );
    
    return await response.json();
}
```

## File Uploads

For file uploads (complaint attachments), use FormData:

```javascript
async function uploadComplaintWithAttachments(complaintData, files) {
    const formData = new FormData();
    
    // Add complaint data
    formData.append('title', complaintData.title);
    formData.append('description', complaintData.description);
    formData.append('category', complaintData.category);
    formData.append('priority', complaintData.priority);
    
    // Add files
    files.forEach(file => {
        formData.append('files', file);
    });
    
    const response = await fetch(`${API_URL}/complaints/`, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${localStorage.getItem('authToken')}`
            // Don't set Content-Type for FormData
        },
        body: formData
    });
    
    return await response.json();
}
```

## Error Handling

```javascript
async function handleApiCall(promise) {
    try {
        const response = await promise;
        
        if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'An error occurred');
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}
```

## Update Frontend Code

### In `auth.js`

Replace the mock login/register with API calls:

```javascript
// OLD
localStorage.href = 'student-dashboard.html';

// NEW
try {
    const user = await login(email, password);
    window.location.href = 'student-dashboard.html';
} catch (error) {
    showAlert(error.message, 'error');
}
```

### In `dashboard.js`

Load complaints from API:

```javascript
async function loadStudentDashboard() {
    try {
        const response = await fetch(`${API_URL}/complaints/`, {
            headers: getHeaders()
        });
        const complaints = await response.json();
        
        // Update UI with complaints data
        updateDashboard(complaints);
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}
```

### In `complaint.js`

Submit complaints to API:

```javascript
async function submitComplaint() {
    try {
        const complaint = {
            title: document.getElementById('complaintTitle').value,
            description: document.getElementById('complaintDescription').value,
            category: document.getElementById('complaintCategory').value,
            priority: document.getElementById('complaintPriority').value,
            location: document.getElementById('complaintLocation').value
        };
        
        const response = await fetch(`${API_URL}/complaints/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(complaint)
        });
        
        const data = await response.json();
        if (response.ok) {
            showAlert('Complaint submitted successfully!', 'success');
            // Redirect after delay
            setTimeout(() => {
                window.location.href = `complaint-detail.html?id=${data.id}`;
            }, 2000);
        }
    } catch (error) {
        showAlert('Error submitting complaint: ' + error.message, 'error');
    }
}
```

## API Response Format

### Success Response
```json
{
    "message": "Success message",
    "data": { /* Resource data */ }
}
```

### Error Response
```json
{
    "message": "Error message",
    "field": ["Specific field error"]
}
```

## Testing Integration

1. Start Django backend:
   ```bash
   python manage.py runserver
   ```

2. Update API_URL in frontend code

3. Test endpoints:
   - Register
   - Login
   - Create complaint
   - View complaints
   - Update status (admin)

4. Use browser DevTools Network tab to debug

## CORS Issues

If you get CORS errors, ensure:

1. Backend has correct `CORS_ALLOWED_ORIGINS`
2. Frontend domain is in the list
3. Requests include proper headers

Update `.env`:
```
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1
```

## Common Issues & Solutions

### 401 Unauthorized
- Token is missing or expired
- Solution: Re-login and get new token

### 403 Forbidden
- User doesn't have permission
- Solution: Check user type (admin/student)

### 400 Bad Request
- Invalid data format
- Solution: Check request body format

### CORS Error
- Frontend domain not allowed
- Solution: Update CORS settings

## Next Steps

1. Update all API calls in frontend
2. Implement proper error handling
3. Add loading states
4. Implement token refresh
5. Add proper logging
6. Test all features end-to-end
