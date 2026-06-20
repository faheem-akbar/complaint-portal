/* ===== COMPLAINT SUBMISSION & DETAIL JAVASCRIPT ===== */

document.addEventListener('DOMContentLoaded', function() {
    requireAuth();
    initComplaintWizard();
    initFileUpload();
    initComplaintDetail();
    initLogout();
});

// ===== COMPLAINT WIZARD =====
function initComplaintWizard() {
    const wizard = document.querySelector('.form-wizard');
    if (!wizard) return;

    let currentStep = 1;
    const totalSteps = 3;

    // Next buttons
    document.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', function() {
            if (validateStep(currentStep)) {
                if (currentStep < totalSteps) {
                    goToStep(currentStep + 1);
                }
            }
        });
    });

    // Previous buttons
    document.querySelectorAll('.btn-prev').forEach(btn => {
        btn.addEventListener('click', function() {
            if (currentStep > 1) {
                goToStep(currentStep - 1);
            }
        });
    });

    // Submit
    const submitBtn = document.getElementById('submitComplaint');
    if (submitBtn) {
        submitBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            if (validateStep(currentStep)) {
                await submitComplaint();
            }
        });
    }

    function goToStep(step) {
        currentStep = step;

        // Update steps
        document.querySelectorAll('.wizard-step').forEach((el, i) => {
            el.classList.remove('active', 'completed');
            if (i + 1 === step) el.classList.add('active');
            if (i + 1 < step) el.classList.add('completed');
        });

        // Update content
        document.querySelectorAll('.wizard-step-content').forEach((el, i) => {
            el.classList.toggle('active', i + 1 === step);
        });
    }

    function validateStep(step) {
        if (step === 1) {
            const category = document.getElementById('complaintCategory');
            const title = document.getElementById('complaintTitle');
            
            if (!category.value) {
                showAlert('Please select a complaint category.', 'error');
                category.focus();
                return false;
            }
            if (!title.value.trim()) {
                showAlert('Please enter a complaint title.', 'error');
                title.focus();
                return false;
            }
            return true;
        }

        if (step === 2) {
            const description = document.getElementById('complaintDescription');
            if (!description.value.trim()) {
                showAlert('Please describe your complaint in detail.', 'error');
                description.focus();
                return false;
            }
            if (description.value.trim().length < 20) {
                showAlert('Please provide a more detailed description (at least 20 characters).', 'error');
                description.focus();
                return false;
            }
            return true;
        }

        return true;
    }
}

// ===== SUBMIT COMPLAINT =====
async function submitComplaint() {
    const submitBtn = document.getElementById('submitComplaint');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;

    try {
        // Collect form data
        const complaintData = {
            title: document.getElementById('complaintTitle').value.trim(),
            category: document.getElementById('complaintCategory').value,
            priority: document.getElementById('complaintPriority')?.value || 'medium',
            location: document.getElementById('complaintLocation')?.value || '',
            description: document.getElementById('complaintDescription').value.trim()
        };

        // Submit to API
        const complaint = await apiCreateComplaint(complaintData);

        // Show success
        const wizardContent = document.querySelector('.wizard-content');
        if (wizardContent) {
            wizardContent.innerHTML = `
                <div class="success-animation">
                    <i class="fas fa-check-circle"></i>
                    <h3>Complaint Submitted Successfully!</h3>
                    <p>Your complaint ID is <strong style="color:var(--primary-light);">${complaint.id_number}</strong>. We will review it shortly.</p>
                    <div style="display:flex; gap:12px; justify-content:center; margin-top:24px;">
                        <a href="student-dashboard.html" class="btn btn-primary">View Dashboard</a>
                        <a href="complaint-detail.html?id=${complaint.id}" class="btn btn-secondary">Track Complaint</a>
                    </div>
                </div>
            `;
        }

        submitBtn.innerHTML = '<i class="fas fa-check"></i> Submit Complaint';
        submitBtn.disabled = false;
    } catch (error) {
        showAlert(error.message || 'Failed to submit complaint', 'error');
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Complaint';
        submitBtn.disabled = false;
    }
}

// ===== FILE UPLOAD =====
function initFileUpload() {
    const uploadArea = document.querySelector('.file-upload-area');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.querySelector('.file-list');

    if (!uploadArea || !fileInput) return;

    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFiles(e.dataTransfer.files);
        }
    });

    fileInput.addEventListener('change', function() {
        if (this.files.length) {
            handleFiles(this.files);
        }
    });

    function handleFiles(files) {
        Array.from(files).forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            const size = file.size > 1024 * 1024 
                ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
                : (file.size / 1024).toFixed(1) + ' KB';

            fileItem.innerHTML = `
                <i class="fas fa-file-alt"></i>
                <span class="file-name">${file.name}</span>
                <span class="file-size">${size}</span>
                <span class="file-remove"><i class="fas fa-times"></i></span>
            `;

            fileItem.querySelector('.file-remove').addEventListener('click', () => {
                fileItem.remove();
            });

            if (fileList) fileList.appendChild(fileItem);
        });
    }
}

// ===== COMPLAINT DETAIL =====
async function initComplaintDetail() {
    const complaintDetailContainer = document.querySelector('.complaint-detail-container');
    if (!complaintDetailContainer) return;

    // Get complaint ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const complaintId = urlParams.get('id');

    if (!complaintId) {
        showAlert('Complaint not found', 'error');
        return;
    }

    try {
        const complaint = await apiGetComplaintDetail(complaintId);
        displayComplaintDetail(complaint);
    } catch (error) {
        showAlert(error.message || 'Failed to load complaint details', 'error');
    }
}

function displayComplaintDetail(complaint) {
    // Update header
    const header = document.querySelector('.complaint-detail-header h2');
    const badge = document.querySelector('.complaint-detail-header .badge');
    const metaSpans = document.querySelectorAll('.complaint-meta span');

    if (header) header.textContent = complaint.title;
    if (badge) {
        badge.textContent = complaint.status.replace(/_/g, ' ').toUpperCase();
        badge.className = `badge ${getStatusBadgeClass(complaint.status)}`;
    }
    
    if (metaSpans[0]) metaSpans[0].textContent = `ID: ${complaint.id_number}`;
    if (metaSpans[1]) metaSpans[1].textContent = `Submitted: ${formatDate(complaint.created_at)}`;

    // Update info grid
    const infoGrid = document.querySelector('.complaint-info-grid');
    if (infoGrid) {
        infoGrid.innerHTML = `
            <div class="card">
                <p style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:4px;">Category</p>
                <p style="font-weight:600;">${complaint.category}</p>
            </div>
            <div class="card">
                <p style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:4px;">Priority</p>
                <p style="font-weight:600;">${complaint.priority}</p>
            </div>
            <div class="card" style="grid-column: 1 / -1;">
                <p style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:4px;">Description</p>
                <p style="line-height:1.7;">${complaint.description}</p>
            </div>
        `;
    }

    // Update timeline
    const timeline = document.querySelector('.timeline');
    if (timeline && complaint.activities && complaint.activities.length > 0) {
        timeline.innerHTML = complaint.activities.map(activity => `
            <div class="timeline-item">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <h4>${activity.activity_type.replace(/_/g, ' ').toUpperCase()}</h4>
                    <p>${activity.description}</p>
                    <small>${formatDate(activity.created_at)}</small>
                </div>
            </div>
        `).join('');
    }

    // Update responses
    const responseContainer = document.querySelector('.complaint-responses');
    if (responseContainer && complaint.responses && complaint.responses.length > 0) {
        responseContainer.innerHTML = complaint.responses.map(resp => `
            <div class="card" style="background:var(--bg-light); margin-bottom: 12px;">
                <p style="font-size:0.9rem; color:var(--text-secondary); line-height:1.7;">
                    ${resp.response_text}
                </p>
                <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:12px;">
                    <i class="fas fa-user-shield"></i> ${resp.admin?.first_name || 'Admin'} ${resp.admin?.last_name || ''} &bull; <span>${formatDate(resp.created_at)}</span>
                </p>
            </div>
        `).join('');
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