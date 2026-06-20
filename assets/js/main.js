/* ===== GLOBAL JAVASCRIPT ===== */

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initNavbar();
    initScrollAnimations();
    initStatCounters();
    initMobileMenu();
});

// ===== NAVBAR =====
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// ===== MOBILE MENU =====
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', function() {    
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in, .slide-in-left');
    if (fadeElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(el => observer.observe(el));
}

// ===== STAT COUNTERS =====
function initStatCounters() {
    const statNumbers = document.querySelectorAll('.stat-item h3');
    if (statNumbers.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const textVal = target.getAttribute('data-target') || target.textContent.replace(/,/g, '').replace('%', '');
                const targetValue = parseInt(textVal);
                if (!isNaN(targetValue)) {
                    animateCounter(target, targetValue, textVal.includes('%'));
                }
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => observer.observe(el));
}

function animateCounter(element, target, isPercent) {
    let current = 0;
    const increment = Math.ceil(target / 60);
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = isPercent ? current + '%' : current.toLocaleString();
    }, 25);
}

// ===== UTILITY FUNCTIONS =====
function showAlert(message, type = 'info') {
    // Remove any existing alerts first
    document.querySelectorAll('.alert').forEach(a => a.remove());
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    alertDiv.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    
    const target = document.querySelector('.auth-form') || document.querySelector('.main-content') || document.querySelector('.wizard-content') || document.body;
    
    if (target) {
        if (target.classList.contains('main-content') || target.classList.contains('wizard-content')) {
            if (target.firstElementChild && target.firstElementChild.classList.contains('top-header')) {
                target.firstElementChild.after(alertDiv);
            } else {
                target.prepend(alertDiv);
            }
        } else {
            target.prepend(alertDiv);
        }
        
        setTimeout(() => {
            alertDiv.style.opacity = '0';
            alertDiv.style.transform = 'translateY(-10px)';
            alertDiv.style.transition = 'all 0.3s ease';
            setTimeout(() => alertDiv.remove(), 300);
        }, 4000);
    }
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-US', options);
}

function getStatusBadgeClass(status) {
    switch((status || '').toLowerCase()) {
        case 'pending': return 'badge-pending';
        case 'in progress':
        case 'in_progress': return 'badge-in-progress';
        case 'resolved': return 'badge-resolved';
        case 'rejected': return 'badge-rejected';
        default: return 'badge-pending';
    }
}

// ===== MOCK DATA =====
const mockComplaints = [
    { id: 'CMP-2024-001', title: 'Library timing issue', category: 'Academic', status: 'pending', priority: 'High', date: '2024-12-01T10:30:00', description: 'The library closes too early during exam week. Students need extended hours for studying.' },
    { id: 'CMP-2024-002', title: 'Hostel WiFi connectivity', category: 'Hostel', status: 'in_progress', priority: 'Medium', date: '2024-11-28T14:20:00', description: 'WiFi in Block A hostel has been extremely slow for the past week.' },
    { id: 'CMP-2024-003', title: 'Cafeteria food quality', category: 'Administrative', status: 'resolved', priority: 'Low', date: '2024-11-25T09:15:00', description: 'The quality of food in the cafeteria has deteriorated significantly.' },
    { id: 'CMP-2024-004', title: 'Scholarship application delay', category: 'Financial', status: 'in_progress', priority: 'High', date: '2024-11-20T16:45:00', description: 'My scholarship application has been pending for over 3 weeks.' },
    { id: 'CMP-2024-005', title: 'Lab equipment issue', category: 'Academic', status: 'pending', priority: 'Medium', date: '2024-12-02T08:00:00', description: 'Three computers in the CS lab are not functioning properly.' },
    { id: 'CMP-2024-006', title: 'Transportation route change', category: 'Administrative', status: 'resolved', priority: 'Low', date: '2024-11-18T11:30:00', description: 'Requesting additional bus stops on the evening route.' },
    { id: 'CMP-2024-007', title: 'Exam grading error', category: 'Academic', status: 'rejected', priority: 'High', date: '2024-11-15T13:20:00', description: 'There seems to be a calculation error in my mid-term grades.' },
    { id: 'CMP-2024-008', title: 'Sports facility booking', category: 'Administrative', status: 'pending', priority: 'Low', date: '2024-12-03T15:10:00', description: 'The online booking system for the sports complex is not working.' }
];

const mockActivities = [
    { text: 'Complaint CMP-2024-002 status changed to In Progress', time: '2 hours ago', type: 'progress' },
    { text: 'Admin responded to complaint CMP-2024-003', time: '5 hours ago', type: 'resolved' },
    { text: 'New complaint submitted: Lab equipment issue', time: '1 day ago', type: 'pending' },
    { text: 'Complaint CMP-2024-001 escalated to senior admin', time: '2 days ago', type: 'progress' },
    { text: 'Complaint CMP-2024-006 marked as Resolved', time: '3 days ago', type: 'resolved' }
];

window.mockComplaints = mockComplaints;
window.mockActivities = mockActivities;
window.showAlert = showAlert;
window.formatDate = formatDate;
window.getStatusBadgeClass = getStatusBadgeClass;