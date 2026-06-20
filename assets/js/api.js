/* ===== API CONFIGURATION ===== */

// ⚠️ After deploying to Railway, replace the PRODUCTION_API_URL below
// with your actual Railway app URL, e.g. https://your-app.railway.app/api
const PRODUCTION_API_URL = 'https://complaints-portal.up.railway.app/api';
const LOCAL_API_URL = 'http://127.0.0.1:8000/api';

const isLocalDev = (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === ''
);

const API_URL = isLocalDev ? LOCAL_API_URL : PRODUCTION_API_URL;

// Helper function to handle network errors
function handleFetchError(error, endpoint) {
    console.error(`API Error (${endpoint}):`, error);
    if (error.message === 'Failed to fetch') {
        return {
            message: `Cannot reach backend server at ${API_URL}. Make sure it's running. (endpoint: ${endpoint})`,
            originalError: error
        };
    }
    return error;
}

// Get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Set auth token in localStorage
function setAuthToken(token) {
    localStorage.setItem('authToken', token);
}

// Clear auth token
function clearAuthToken() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
}

// Get headers with authentication
function getHeaders(includeAuth = true) {
    const headers = {
        'Content-Type': 'application/json',
    };
    
    if (includeAuth) {
        const token = getAuthToken();
        if (token) {
            headers['Authorization'] = `Token ${token}`;
        }
    }
    
    return headers;
}

// Handle API errors
function handleApiError(error) {
    if (error.response && error.response.status === 401) {
        // Unauthorized - token expired
        clearAuthToken();
        window.location.href = 'login.html';
    }
    return error;
}

// ===== AUTHENTICATION ENDPOINTS =====

async function apiRegister(userData) {
    try {
        const response = await fetch(`${API_URL}/auth/register/`, {
            method: 'POST',
            headers: getHeaders(false),
            body: JSON.stringify({
                username: userData.email.split('@')[0],
                email: userData.email,
                first_name: userData.firstName || '',
                last_name: userData.lastName || '',
                password: userData.password,
                confirm_password: userData.confirmPassword,
                student_id: userData.studentId || '',
                user_type: userData.userType || 'student'
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw {
                status: response.status,
                message: data.message || Object.values(data)[0]?.[0] || 'Registration failed',
                response: data
            };
        }
        
        setAuthToken(data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    } catch (error) {
        const apiError = handleFetchError(error, '/auth/register/');
        throw apiError;
    }
}

async function apiLogin(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login/`, {
            method: 'POST',
            headers: getHeaders(false),
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw {
                status: response.status,
                message: data.message || 'Login failed',
                response: data
            };
        }
        
        setAuthToken(data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    } catch (error) {
        const apiError = handleFetchError(error, '/auth/login/');
        throw apiError;
    }
}

async function apiLogout() {
    try {
        const response = await fetch(`${API_URL}/auth/logout/`, {
            method: 'POST',
            headers: getHeaders(true)
        });
        
        clearAuthToken();
        return await response.json();
    } catch (error) {
        clearAuthToken();
        console.error('Logout error:', error);
    }
}

async function apiGetProfile() {
    try {
        const response = await fetch(`${API_URL}/auth/profile/`, {
            method: 'GET',
            headers: getHeaders(true)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw {
                status: response.status,
                message: 'Failed to get profile'
            };
        }
        
        return data;
    } catch (error) {
        console.error('Get profile error:', error);
        throw error;
    }
}

// ===== COMPLAINT ENDPOINTS =====

async function apiGetComplaints(filters = {}) {
    try {
        let url = `${API_URL}/complaints/?`;
        
        if (filters.status) url += `status=${filters.status}&`;
        if (filters.category) url += `category=${filters.category}&`;
        if (filters.priority) url += `priority=${filters.priority}&`;
        if (filters.search) url += `search=${filters.search}&`;
        if (filters.assigned_to) url += `assigned_to=${filters.assigned_to}&`;
        if (filters.ordering) url += `ordering=${filters.ordering}&`;
        if (filters.page) url += `page=${filters.page}&`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders(true)
        });
        
        if (response.status === 401) {
            clearAuthToken();
            throw { status: 401, message: 'Unauthorized' };
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw {
                status: response.status,
                message: 'Failed to fetch complaints'
            };
        }
        
        return data;
    } catch (error) {
        console.error('Get complaints error:', error);
        throw error;
    }
}

async function apiCreateComplaint(complaintData) {
    try {
        const response = await fetch(`${API_URL}/complaints/`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify({
                title: complaintData.title,
                description: complaintData.description,
                category: complaintData.category,
                priority: complaintData.priority || 'medium',
                location: complaintData.location || ''
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw {
                status: response.status,
                message: data.message || data.detail || 'Failed to create complaint',
                response: data
            };
        }
        
        return data;
    } catch (error) {
        const apiError = handleFetchError(error, '/complaints/');
        throw apiError;
    }
}

async function apiGetComplaintDetail(complaintId) {
    try {
        const response = await fetch(`${API_URL}/complaints/${complaintId}/`, {
            method: 'GET',
            headers: getHeaders(true)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw {
                status: response.status,
                message: 'Failed to fetch complaint details'
            };
        }
        
        return data;
    } catch (error) {
        console.error('Get complaint detail error:', error);
        throw error;
    }
}

async function apiUpdateComplaintStatus(complaintId, newStatus) {
    try {
        const response = await fetch(`${API_URL}/complaints/${complaintId}/update_status/`, {
            method: 'PATCH',
            headers: getHeaders(true),
            body: JSON.stringify({
                status: newStatus
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw {
                status: response.status,
                message: 'Failed to update status'
            };
        }
        
        return data;
    } catch (error) {
        console.error('Update status error:', error);
        throw error;
    }
}

async function apiAssignComplaint(complaintId, adminId) {
    try {
        const response = await fetch(`${API_URL}/complaints/${complaintId}/assign_admin/`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify({
                assigned_to: adminId
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw {
                status: response.status,
                message: 'Failed to assign complaint'
            };
        }
        
        return data;
    } catch (error) {
        console.error('Assign complaint error:', error);
        throw error;
    }
}

async function apiAddResponse(complaintId, responseText) {
    try {
        const response = await fetch(`${API_URL}/complaints/${complaintId}/add_response/`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify({
                response_text: responseText
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw {
                status: response.status,
                message: 'Failed to add response'
            };
        }
        
        return data;
    } catch (error) {
        console.error('Add response error:', error);
        throw error;
    }
}

async function apiRateComplaint(complaintId, rating) {
    try {
        const response = await fetch(`${API_URL}/complaints/${complaintId}/rate/`, {
            method: 'POST',
            headers: getHeaders(true),
            body: JSON.stringify({
                satisfaction_rating: rating
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw {
                status: response.status,
                message: 'Failed to rate complaint'
            };
        }
        
        return data;
    } catch (error) {
        console.error('Rate complaint error:', error);
        throw error;
    }
}

// ===== NOTIFICATION ENDPOINTS =====

async function apiGetNotifications() {
    try {
        const response = await fetch(`${API_URL}/complaints/notifications/`, {
            method: 'GET',
            headers: getHeaders(true)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw {
                status: response.status,
                message: 'Failed to fetch notifications'
            };
        }
        
        return data;
    } catch (error) {
        console.error('Get notifications error:', error);
        throw error;
    }
}

async function apiGetUnreadCount() {
    try {
        const response = await fetch(`${API_URL}/complaints/notifications/unread_count/`, {
            method: 'GET',
            headers: getHeaders(true)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return { unread_count: 0 };
        }
        
        return data;
    } catch (error) {
        console.error('Get unread count error:', error);
        return { unread_count: 0 };
    }
}

async function apiMarkNotificationAsRead(notificationId) {
    try {
        const response = await fetch(`${API_URL}/complaints/notifications/${notificationId}/mark_as_read/`, {
            method: 'POST',
            headers: getHeaders(true)
        });
        
        return await response.json();
    } catch (error) {
        console.error('Mark as read error:', error);
        throw error;
    }
}

// ===== USER MANAGEMENT ENDPOINTS (Admin only) =====

async function apiGetUsers() {
    try {
        const response = await fetch(`${API_URL}/auth/users/`, {
            method: 'GET',
            headers: getHeaders(true)
        });
        
        // Handle 403 Forbidden for non-admin users
        if (response.status === 403) {
            throw {
                status: 403,
                message: 'Access denied. Admin privileges required.'
            };
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw {
                status: response.status,
                message: 'Failed to fetch users'
            };
        }
        
        return data;
    } catch (error) {
        console.error('Get users error:', error);
        throw error;
    }
}

// ===== STATISTICS ENDPOINT =====

async function apiGetStatistics() {
    try {
        const response = await fetch(`${API_URL}/complaints/statistics/`, {
            method: 'GET',
            headers: getHeaders(true)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw {
                status: response.status,
                message: 'Failed to fetch statistics'
            };
        }
        
        return data;
    } catch (error) {
        console.error('Get statistics error:', error);
        throw error;
    }
}

// Check if user is authenticated
function isAuthenticated() {
    return !!getAuthToken();
}

// Redirect to login if not authenticated
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
    }
}

// Get current user from localStorage
function getCurrentUser() {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
}

// Check if current user is admin
function isAdmin() {
    const user = getCurrentUser();
    return user && user.user_type === 'admin';
}

// Check if current user is student
function isStudent() {
    const user = getCurrentUser();
    return user && user.user_type === 'student';
}

// Redirect to appropriate dashboard based on role
function redirectToDashboard() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    if (user.user_type === 'admin') {
        window.location.href = 'admin-dashboard.html';
    } else {
        window.location.href = 'student-dashboard.html';
    }
}

// Update UI based on user role
function updateUIForRole() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Hide admin-only elements for students
    if (user.user_type !== 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'none';
        });
    }
    
    // Hide student-only elements for admins
    if (user.user_type !== 'student') {
        document.querySelectorAll('.student-only').forEach(el => {
            el.style.display = 'none';
        });
    }
}
