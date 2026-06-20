/* ===== STUDENT DASHBOARD JAVASCRIPT ===== */

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    requireAuth();
    
    // Update user info
    updateUserInfo();
    
    // Load dashboard data
    loadStudentDashboard();
    initLogout();
});

function updateUserInfo() {
    const user = getCurrentUser();
    if (!user) return;
    
    const avatarEl = document.querySelector('.sidebar-avatar');
    const nameEl = document.querySelector('.sidebar-user-info h4');
    const subtitleEl = document.querySelector('.sidebar-user-info span');
    
    if (avatarEl) {
        const initials = (user.first_name?.charAt(0) || '') + (user.last_name?.charAt(0) || '');
        avatarEl.textContent = initials || user.username.substring(0, 2).toUpperCase();
    }
    
    if (nameEl) nameEl.textContent = user.first_name + ' ' + user.last_name || user.username;
    if (subtitleEl) subtitleEl.textContent = `Student - ${user.student_id || 'No ID'}`;
}

async function loadStudentDashboard() {
    try {
        // Fetch complaints from API
        const response = await apiGetComplaints({ page: 1 });
        const complaints = response.results || [];
        
        // Update stat cards
        updateStatCards(complaints);
        
        // Load complaints table
        loadComplaintsTable(complaints);
        
        // Load activity
        loadActivity(complaints);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showAlert('Failed to load dashboard data', 'error');
    }
}

function updateStatCards(complaints) {
    const totalComplaints = document.getElementById('totalComplaints');
    const pendingComplaints = document.getElementById('pendingComplaints');
    const inProgressComplaints = document.getElementById('inProgressComplaints');
    const resolvedComplaints = document.getElementById('resolvedComplaints');

    if (totalComplaints) {
        totalComplaints.textContent = complaints.length;
    }
    if (pendingComplaints) {
        pendingComplaints.textContent = complaints.filter(c => c.status === 'pending').length;
    }
    if (inProgressComplaints) {
        inProgressComplaints.textContent = complaints.filter(c => c.status === 'in_progress').length;
    }
    if (resolvedComplaints) {
        resolvedComplaints.textContent = complaints.filter(c => c.status === 'resolved').length;
    }
}

function loadComplaintsTable(complaints) {
    const tableBody = document.querySelector('.data-table tbody');
    if (!tableBody) return;

    // Show only first 5
    const recentComplaints = complaints.slice(0, 5);

    if (recentComplaints.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px; color: var(--text-secondary);">
                    No complaints yet. <a href="submit-complaint.html" style="color: var(--primary-light);">Submit one now</a>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = recentComplaints.map(c => `
        <tr>
            <td><span class="complaint-id">${c.id_number}</span></td>
            <td class="complaint-title">${c.title}</td>
            <td>${c.category}</td>
            <td><span class="badge ${getStatusBadgeClass(c.status)}">${c.status.replace(/_/g, ' ').toUpperCase()}</span></td>
            <td>${c.priority}</td>
            <td>${formatDate(c.created_at)}</td>
            <td><a href="complaint-detail.html?id=${c.id}" class="action-btn">View</a></td>
        </tr>
    `).join('');
}

function loadActivity(complaints) {
    const activityList = document.querySelector('.activity-list');
    if (!activityList) return;

    // Create activity from recent complaints
    const activities = complaints.slice(0, 5).map(c => ({
        type: c.status,
        text: `Complaint "${c.title}" is ${c.status.replace(/_/g, ' ')}`,
        time: formatDate(c.updated_at)
    }));

    if (activities.length === 0) {
        activityList.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No activities yet</p>';
        return;
    }

    activityList.innerHTML = activities.map(a => `
        <div class="activity-item">
            <span class="activity-dot ${a.type}"></span>
            <div class="activity-content">
                <p>${a.text}</p>
                <span>${a.time}</span>
            </div>
        </div>
    `).join('');
}

function initLogout() {
    const logoutLinks = document.querySelectorAll('.logout-link');
    logoutLinks.forEach(link => {
        link.addEventListener('click', async function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                try {
                    await apiLogout();
                    window.location.href = '../index.html';
                } catch (error) {
                    console.error('Logout error:', error);
                    clearAuthToken();
                    window.location.href = '../index.html';
                }
            }
        });
    });
}