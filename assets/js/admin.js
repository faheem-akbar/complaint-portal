/* ===== ADMIN DASHBOARD JAVASCRIPT ===== */

document.addEventListener('DOMContentLoaded', function() {
    requireAuth();
    loadAdminDashboard();
    loadAdminComplaints();
    loadReports();
    initAdminFilters();
    initLogout();
});

// ===== ADMIN DASHBOARD =====
async function loadAdminDashboard() {
    try {
        const response = await apiGetComplaints({ page: 1 });
        const complaints = response.results || [];

        const totalEl = document.getElementById('totalComplaints');
        const newTodayEl = document.getElementById('newToday');
        const resolvedWeekEl = document.getElementById('resolvedWeek');
        const avgTimeEl = document.getElementById('avgTime');

        if (totalEl) totalEl.textContent = complaints.length;
        if (newTodayEl) newTodayEl.textContent = complaints.filter(c => c.status === 'pending').length;
        if (resolvedWeekEl) resolvedWeekEl.textContent = complaints.filter(c => c.status === 'resolved').length;
        if (avgTimeEl) avgTimeEl.textContent = '2.5 days';

        loadAdminComplaintsTable(complaints);
        
        // Load activity on admin dashboard
        const activityList = document.querySelector('.main-content .activity-list');
        if (activityList && complaints.length > 0) {
            activityList.innerHTML = complaints.slice(0, 5).map(c => `
                <div class="activity-item">
                    <span class="activity-dot ${c.status}"></span>
                    <div class="activity-content">
                        <p>Complaint "${c.title}" is ${c.status.replace(/_/g, ' ')}</p>
                        <span>${formatDate(c.updated_at)}</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
        showAlert('Failed to load dashboard data', 'error');
    }
}

// ===== ADMIN COMPLAINTS TABLE (used in admin dashboard) =====
function loadAdminComplaintsTable(complaints) {
    const tableBody = document.querySelector('.main-content .data-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = complaints.slice(0, 10).map(c => `
        <tr>
            <td><input type="checkbox" class="complaint-check" data-id="${c.id}"></td>
            <td><span class="complaint-id">${c.id_number}</span></td>
            <td class="complaint-title">${c.title}</td>
            <td>${c.category}</td>
            <td>${c.priority}</td>
            <td><span class="badge ${getStatusBadgeClass(c.status)}">${c.status.replace(/_/g, ' ').toUpperCase()}</span></td>
            <td>${formatDate(c.created_at)}</td>
            <td>
                <select class="status-change" data-id="${c.id}" onchange="changeStatus('${c.id}', this.value)">
                    <option value="">Change status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </td>
        </tr>
    `).join('');
}

// ===== CHANGE STATUS =====
async function changeStatus(id, newStatus) {
    if (!newStatus) return;
    
    try {
        await apiUpdateComplaintStatus(id, newStatus);
        showAlert(`Complaint status changed to ${newStatus.replace('_', ' ')}`, 'success');
        // Reload the dashboard
        loadAdminDashboard();
        loadAdminComplaints();
    } catch (error) {
        showAlert(error.message || 'Failed to update status', 'error');
    }
}

// ===== ADMIN COMPLAINTS PAGE =====
async function loadAdminComplaints() {
    const tableBody = document.querySelector('#adminComplaintsTable tbody');
    if (!tableBody) return;

    try {
        const response = await apiGetComplaints({ page: 1 });
        const complaints = response.results || [];

        tableBody.innerHTML = complaints.map(c => `
            <tr>
                <td><input type="checkbox" class="complaint-check" data-id="${c.id}" data-number="${c.id_number}"></td>
                <td><span class="complaint-id">${c.id_number}</span></td>
                <td class="complaint-title">${c.title}</td>
                <td>${c.category}</td>
                <td>${c.priority}</td>
                <td><span class="badge ${getStatusBadgeClass(c.status)}">${c.status.replace(/_/g, ' ').toUpperCase()}</span></td>
                <td>${formatDate(c.created_at)}</td>
                <td>
                    <div style="display:flex; gap:6px;">
                        <button class="btn btn-sm btn-primary" onclick="viewComplaint('${c.id}')">View</button>
                        <select class="status-change" data-id="${c.id}" onchange="changeStatus('${c.id}', this.value)" style="padding:4px 8px; border:1px solid #ddd; border-radius:6px; font-size:0.8rem;">
                            <option value="">Status</option>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </td>
            </tr>
        `).join('');
        
        // Re-attach bulk action handlers after table is populated
        initBulkActions();
    } catch (error) {
        console.error('Error loading complaints:', error);
        showAlert('Failed to load complaints', 'error');
    }
}

// ===== BULK ACTIONS =====
function initBulkActions() {
    // Select All checkbox
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.complaint-check');
            checkboxes.forEach(cb => cb.checked = this.checked);
        });
    }
    
    // Select All button
    const selectAllBtn = document.getElementById('selectAllBtn');
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', function() {
            const checkboxes = document.querySelectorAll('.complaint-check');
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            checkboxes.forEach(cb => cb.checked = !allChecked);
            if (selectAllCheckbox) selectAllCheckbox.checked = !allChecked;
        });
    }
    
    // Bulk Action button
    const bulkActionBtn = document.getElementById('bulkActionBtn');
    if (bulkActionBtn) {
        bulkActionBtn.addEventListener('click', async function() {
            const selectedCheckboxes = document.querySelectorAll('.complaint-check:checked');
            
            if (selectedCheckboxes.length === 0) {
                showAlert('Please select at least one complaint.', 'error');
                return;
            }
            
            // Show a modal-like prompt for status selection
            const statuses = ['pending', 'in_progress', 'resolved', 'rejected'];
            const statusLabels = ['Pending', 'In Progress', 'Resolved', 'Rejected'];
            
            const statusOptions = statuses.map((s, i) => `${i + 1}. ${statusLabels[i]}`).join('\n');
            const choice = prompt(
                `You have selected ${selectedCheckboxes.length} complaint(s).\n\nChoose a status to apply:\n${statusOptions}\n\nEnter number (1-4):`,
                '2'
            );
            
            if (!choice) return;
            
            const statusIndex = parseInt(choice) - 1;
            if (isNaN(statusIndex) || statusIndex < 0 || statusIndex >= statuses.length) {
                showAlert('Invalid choice. Please enter a number between 1 and 4.', 'error');
                return;
            }
            
            const newStatus = statuses[statusIndex];
            let successCount = 0;
            let failCount = 0;
            
            // Update each selected complaint
            for (const cb of selectedCheckboxes) {
                try {
                    await apiUpdateComplaintStatus(cb.dataset.id, newStatus);
                    successCount++;
                } catch (error) {
                    failCount++;
                }
            }
            
            if (successCount > 0) {
                showAlert(`${successCount} complaint(s) updated to "${statusLabels[statusIndex]}"`, 'success');
            }
            if (failCount > 0) {
                showAlert(`${failCount} complaint(s) failed to update`, 'error');
            }
            
            // Reload the table
            loadAdminComplaints();
        });
    }
}

function viewComplaint(id) {
    window.location.href = `complaint-detail.html?id=${id}`;
}

// ===== REPORTS =====
function loadReports() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    const categories = ['Academic', 'Hostel', 'Administrative', 'Financial'];
    const counts = [3, 1, 3, 1];
    const maxCount = Math.max(...counts) || 1;
    const colors = ['#3949ab', '#ff6d00', '#43a047', '#8e24aa'];

    ctx.innerHTML = `
        <div style="padding:20px;">
            <h3 style="margin-bottom:20px; color:var(--text-primary); font-size:1rem;">Complaints by Category</h3>
            <div style="display:flex; gap:30px; align-items:flex-end; height:200px; padding:0 20px;">
                ${categories.map((cat, i) => `
                    <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:8px;">
                        <span style="font-size:0.85rem; font-weight:600;">${counts[i]}</span>
                        <div style="width:100%; height:${Math.max((counts[i]/maxCount)*150, 20)}px; background:${colors[i]}; border-radius:8px 8px 0 0; transition:all 0.5s ease;"></div>
                        <span style="font-size:0.75rem; color:var(--text-secondary); text-align:center;">${cat}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ===== ADMIN FILTERS =====
function initAdminFilters() {
    const filterSection = document.querySelector('.filter-section');
    if (!filterSection) return;

    // Get buttons by their icon content
    const allBtns = filterSection.querySelectorAll('.btn');
    if (allBtns.length < 2) return;
    
    // First button = Apply Filters, Second button = Clear
    const applyBtn = allBtns[0];
    const clearBtn = allBtns[1];

    if (applyBtn) {
        applyBtn.addEventListener('click', async function() {
            const status = document.getElementById('filterStatus')?.value;
            const category = document.getElementById('filterCategory')?.value;
            const priority = document.getElementById('filterPriority')?.value;
            const search = document.getElementById('filterSearch')?.value;

            try {
                const filters = {};
                if (status) filters.status = status;
                if (category) filters.category = category;
                if (priority) filters.priority = priority;
                if (search) filters.search = search;

                const response = await apiGetComplaints(filters);
                const filtered = response.results || [];

                // Update the admin complaints page table with checkboxes
                const tableBody = document.querySelector('#adminComplaintsTable tbody');
                if (tableBody) {
                    tableBody.innerHTML = filtered.map(c => `
                        <tr>
                            <td><input type="checkbox" class="complaint-check" data-id="${c.id}" data-number="${c.id_number}"></td>
                            <td><span class="complaint-id">${c.id_number}</span></td>
                            <td class="complaint-title">${c.title}</td>
                            <td>${c.category}</td>
                            <td>${c.priority}</td>
                            <td><span class="badge ${getStatusBadgeClass(c.status)}">${c.status.replace(/_/g, ' ').toUpperCase()}</span></td>
                            <td>${formatDate(c.created_at)}</td>
                            <td>
                                <div style="display:flex; gap:6px;">
                                    <button class="btn btn-sm btn-primary" onclick="viewComplaint('${c.id}')">View</button>
                                    <select class="status-change" data-id="${c.id}" onchange="changeStatus('${c.id}', this.value)" style="padding:4px 8px; border:1px solid #ddd; border-radius:6px; font-size:0.8rem;">
                                        <option value="">Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </td>
                        </tr>
                    `).join('');
                }
                showAlert(`Found ${filtered.length} complaint(s)`, 'info');
            } catch (error) {
                showAlert('Failed to filter complaints', 'error');
            }
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            document.querySelectorAll('.filter-section select, .filter-section input').forEach(el => el.value = '');
            loadAdminComplaints();
        });
    }
}

function initLogout() {
    document.querySelectorAll('.logout-link').forEach(link => {
        link.addEventListener('click', async function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                try {
                    await apiLogout();
                    window.location.href = '../index.html';
                } catch (error) {
                    clearAuthToken();
                    window.location.href = '../index.html';
                }
            }
        });
    });
}