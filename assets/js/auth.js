/* ===== AUTHENTICATION JAVASCRIPT ===== */

document.addEventListener('DOMContentLoaded', function() {
    initLoginForm();
    initRegisterForm();
    initPasswordStrength();
});

// ===== LOGIN FORM =====
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember')?.checked || false;

        if (!email || !password) {
            showAlert('Please fill in all fields.', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showAlert('Please enter a valid email address.', 'error');
            return;
        }

        if (password.length < 6) {
            showAlert('Password must be at least 6 characters.', 'error');
            return;
        }

        const submitBtn = loginForm.querySelector('.btn');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
        submitBtn.disabled = true;

        try {
            const result = await apiLogin(email, password);
            showAlert('Login successful! Redirecting...', 'success');
            
            setTimeout(() => {
                // Redirect based on user type
                if (result.user.user_type === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    window.location.href = 'student-dashboard.html';
                }
            }, 1500);
        } catch (error) {
            showAlert(error.message || 'Login failed. Please try again.', 'error');
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
            submitBtn.disabled = false;
        }
    });
}

// ===== REGISTER FORM =====
function initRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const userType = document.getElementById('userType')?.value || 'student';
        const studentId = document.getElementById('studentId')?.value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agree = document.getElementById('agree')?.checked || false;

        if (!name || !email || !password || !confirmPassword) {
            showAlert('Please fill in all required fields.', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showAlert('Please enter a valid email address.', 'error');
            return;
        }

        if (password.length < 6) {
            showAlert('Password must be at least 6 characters.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showAlert('Passwords do not match.', 'error');
            return;
        }

        if (!agree) {
            showAlert('Please agree to the Terms of Service.', 'error');
            return;
        }

        const submitBtn = registerForm.querySelector('.btn');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
        submitBtn.disabled = true;

        try {
            const nameParts = name.split(' ');
            const result = await apiRegister({
                email: email,
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
                password: password,
                confirmPassword: confirmPassword,
                studentId: studentId,
                userType: userType
            });

            showAlert('Account created successfully! Redirecting to login...', 'success');

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2500);
        } catch (error) {
            showAlert(error.message || 'Registration failed. Please try again.', 'error');
            submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
            submitBtn.disabled = false;
        }
    });
}

// ===== PASSWORD STRENGTH =====
function initPasswordStrength() {
    const passwordInput = document.getElementById('password');
    const strengthBars = document.querySelectorAll('.password-strength span');
    
    if (!passwordInput || strengthBars.length === 0) return;

    passwordInput.addEventListener('input', function() {
        const val = this.value;
        let strength = 0;
        
        strengthBars.forEach(bar => {
            bar.className = '';
        });

        if (val.length === 0) return;

        if (val.length >= 6) strength++;
        if (val.length >= 10) strength++;
        if (/\d/.test(val)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(val)) strength++;
        if (/[A-Z]/.test(val)) strength++;

        const className = strength <= 2 ? 'weak' : strength <= 3 ? 'medium' : 'strong';

        for (let i = 0; i < strength && i < strengthBars.length; i++) {
            strengthBars[i].classList.add('active', className);
        }
    });
}

// ===== UTILITY =====
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}