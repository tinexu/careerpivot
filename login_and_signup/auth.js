// Authentication system for CareerPivot
class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('careerpivot_users') || '[]');
        this.currentUser = JSON.parse(localStorage.getItem('careerpivot_current_user') || 'null');
        this.initializeEventListeners();
        this.initializePasswordValidation();
    }

    initializeEventListeners() {
        // Form submission
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Social auth buttons
        const googleBtn = document.querySelector('.google-btn');
        const linkedinBtn = document.querySelector('.linkedin-btn');
        
        if (googleBtn) {
            googleBtn.addEventListener('click', () => this.handleSocialAuth('google'));
        }
        
        if (linkedinBtn) {
            linkedinBtn.addEventListener('click', () => this.handleSocialAuth('linkedin'));
        }

        // Real-time form validation
        const inputs = document.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearError(input));
        });
    }

    initializePasswordValidation() {
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', () => this.validatePasswordRequirements());
        }
    }

    validatePasswordRequirements() {
        const password = document.getElementById('password').value;
        
        // Length requirement
        const lengthReq = document.getElementById('lengthReq');
        if (lengthReq) {
            if (password.length >= 8) {
                lengthReq.classList.add('valid');
                lengthReq.querySelector('.req-icon').textContent = '✓';
            } else {
                lengthReq.classList.remove('valid');
                lengthReq.querySelector('.req-icon').textContent = '○';
            }
        }

        // Uppercase requirement
        const uppercaseReq = document.getElementById('uppercaseReq');
        if (uppercaseReq) {
            if (/[A-Z]/.test(password)) {
                uppercaseReq.classList.add('valid');
                uppercaseReq.querySelector('.req-icon').textContent = '✓';
            } else {
                uppercaseReq.classList.remove('valid');
                uppercaseReq.querySelector('.req-icon').textContent = '○';
            }
        }

        // Number requirement
        const numberReq = document.getElementById('numberReq');
        if (numberReq) {
            if (/\d/.test(password)) {
                numberReq.classList.add('valid');
                numberReq.querySelector('.req-icon').textContent = '✓';
            } else {
                numberReq.classList.remove('valid');
                numberReq.querySelector('.req-icon').textContent = '○';
            }
        }
    }

    validateField(input) {
        const value = input.value.trim();
        const fieldName = input.name;
        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Name must be at least 2 characters long';
                }
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                } else if (this.emailExists(value)) {
                    isValid = false;
                    errorMessage = 'This email is already registered';
                }
                break;

            case 'password':
                if (value.length < 8) {
                    isValid = false;
                    errorMessage = 'Password must be at least 8 characters long';
                } else if (!/[A-Z]/.test(value)) {
                    isValid = false;
                    errorMessage = 'Password must contain at least one uppercase letter';
                } else if (!/\d/.test(value)) {
                    isValid = false;
                    errorMessage = 'Password must contain at least one number';
                }
                break;

            case 'confirmPassword':
                const password = document.getElementById('password').value;
                if (value !== password) {
                    isValid = false;
                    errorMessage = 'Passwords do not match';
                }
                break;
        }

        this.showFieldError(input, isValid, errorMessage);
        return isValid;
    }

    showFieldError(input, isValid, errorMessage) {
        const errorElement = document.getElementById(input.name + 'Error');
        
        if (isValid) {
            input.classList.remove('error');
            if (errorElement) {
                errorElement.classList.remove('show');
                errorElement.textContent = '';
            }
        } else {
            input.classList.add('error');
            if (errorElement) {
                errorElement.classList.add('show');
                errorElement.textContent = errorMessage;
            }
        }
    }

    clearError(input) {
        input.classList.remove('error');
        const errorElement = document.getElementById(input.name + 'Error');
        if (errorElement) {
            errorElement.classList.remove('show');
            errorElement.textContent = '';
        }
    }

    emailExists(email) {
        return this.users.some(user => user.email.toLowerCase() === email.toLowerCase());
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        
        // Show loading state
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
        submitBtn.disabled = true;

        // Get form data
        const formData = new FormData(e.target);
        const userData = {
            id: this.generateUserId(),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            currentRole: formData.get('currentRole'),
            experience: formData.get('experience'),
            newsletter: formData.get('newsletter') === 'on',
            terms: formData.get('terms') === 'on',
            createdAt: new Date().toISOString(),
            isVerified: false
        };

        // Validate all fields
        let isFormValid = true;
        const requiredFields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
        
        requiredFields.forEach(fieldName => {
            const input = document.querySelector(`[name="${fieldName}"]`);
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        // Check terms agreement
        if (!userData.terms) {
            this.showFieldError(document.getElementById('terms'), false, 'You must agree to the terms');
            isFormValid = false;
        }

        if (!isFormValid) {
            // Reset button state
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
            submitBtn.disabled = false;
            return;
        }

        // Simulate API call
        try {
            await this.simulateApiCall(2000);
            
            // Remove password confirmation before saving
            delete userData.confirmPassword;
            
            // Add user to storage
            this.users.push(userData);
            localStorage.setItem('careerpivot_users', JSON.stringify(this.users));
            
            // Auto-login the user
            this.currentUser = userData;
            localStorage.setItem('careerpivot_current_user', JSON.stringify(userData));
            
            // Show success message
            this.showSuccessMessage('Account created successfully! Redirecting...');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '../dashboard/dashboard.html';
            }, 1500);
            
        } catch (error) {
            this.showError('Failed to create account. Please try again.');
            console.error('Signup error:', error);
        } finally {
            // Reset button state
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
            submitBtn.disabled = false;
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        
        // Show loading state
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
        submitBtn.disabled = true;

        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            await this.simulateApiCall(1500);
            
            // Find user
            const user = this.users.find(u => 
                u.email.toLowerCase() === email.toLowerCase() && 
                u.password === password
            );

            if (user) {
                // Login successful
                this.currentUser = user;
                localStorage.setItem('careerpivot_current_user', JSON.stringify(user));
                
                this.showSuccessMessage('Login successful! Redirecting...');
                
                setTimeout(() => {
                    window.location.href = '../dashboard/dashboard.html';
                }, 1500);
            } else {
                this.showError('Invalid email or password');
            }
            
        } catch (error) {
            this.showError('Failed to login. Please try again.');
            console.error('Login error:', error);
        } finally {
            // Reset button state
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
            submitBtn.disabled = false;
        }
    }

    async handleSocialAuth(provider) {
        // Simulate social authentication
        this.showInfo(`${provider.charAt(0).toUpperCase() + provider.slice(1)} authentication would be implemented here`);
        
        // For demo purposes, create a mock social user
        const mockUser = {
            id: this.generateUserId(),
            firstName: 'Demo',
            lastName: 'User',
            email: `demo.${provider}@example.com`,
            currentRole: 'Software Engineer',
            experience: 'mid',
            authProvider: provider,
            createdAt: new Date().toISOString(),
            isVerified: true
        };

        // Check if user already exists
        const existingUser = this.users.find(u => u.email === mockUser.email);
        
        if (!existingUser) {
            this.users.push(mockUser);
            localStorage.setItem('careerpivot_users', JSON.stringify(this.users));
        }

        this.currentUser = existingUser || mockUser;
        localStorage.setItem('careerpivot_current_user', JSON.stringify(this.currentUser));
        
        setTimeout(() => {
            window.location.href = '../dashboard/dashboard.html';
        }, 1500);
    }

    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    simulateApiCall(duration) {
        return new Promise((resolve) => {
            setTimeout(resolve, duration);
        });
    }

    showSuccessMessage(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showInfo(message) {
        this.showNotification(message, 'info');
    }

    showNotification(message, type) {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">
                    ${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
                </span>
                <span class="notification-message">${message}</span>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            background: ${type === 'success' ? 'rgba(6, 214, 160, 0.1)' : 
                         type === 'error' ? 'rgba(255, 107, 107, 0.1)' : 
                         'rgba(96, 165, 250, 0.1)'};
            border: 1px solid ${type === 'success' ? '#06D6A0' : 
                                type === 'error' ? '#FF6B6B' : 
                                '#60A5FA'};
            border-radius: 12px;
            padding: 16px 20px;
            color: ${type === 'success' ? '#06D6A0' : 
                     type === 'error' ? '#FF6B6B' : 
                     '#60A5FA'};
            font-size: 14px;
            font-weight: 500;
            z-index: 9999;
            backdrop-filter: blur(20px);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        notification.querySelector('.notification-content').style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 4000);
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Logout
    logout() {
        this.currentUser = null;
        localStorage.removeItem('careerpivot_current_user');
        window.location.href = '../landing_page/index.html';
    }

    // Redirect to login if not authenticated
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
}

// Initialize auth system
const auth = new AuthSystem();

// Check authentication on protected pages
document.addEventListener('DOMContentLoaded', function() {
    const protectedPages = ['dashboard.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
        auth.requireAuth();
    }

    // Redirect authenticated users away from auth pages
    const authPages = ['login.html', 'signup.html'];
    if (authPages.includes(currentPage) && auth.isAuthenticated()) {
        window.location.href = '../dashboard/dashboard.html';
    }
});

// Make auth available globally
window.auth = auth;