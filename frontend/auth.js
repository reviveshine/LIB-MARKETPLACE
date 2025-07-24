// Authentication JavaScript for LIB MARKETPLACE
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    // Add authorization header if token exists
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
}

// Show notification message
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.insertBefore(notification, document.body.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Signing in...';
        submitButton.disabled = true;

        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(loginData)
        });

        // Store token and user data
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        showNotification('Login successful! Redirecting...', 'success');
        
        // Redirect to marketplace after a brief delay
        setTimeout(() => {
            window.location.href = 'marketplace.html';
        }, 1500);

    } catch (error) {
        showNotification(error.message, 'error');
        
        // Reset button
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Handle registration form submission
async function handleRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const registerData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        password: formData.get('password'),
        userType: formData.get('userType') || 'buyer'
    };

    // Validate password confirmation
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    try {
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Creating account...';
        submitButton.disabled = true;

        const response = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(registerData)
        });

        showNotification('Registration successful! Please sign in.', 'success');
        
        // Redirect to login after a brief delay
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);

    } catch (error) {
        showNotification(error.message, 'error');
        
        // Reset button
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    return token && user;
}

// Logout function
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Initialize page based on current page
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Add form event listeners
    if (currentPage === 'login.html') {
        const loginForm = document.querySelector('.auth-form');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
    } else if (currentPage === 'register.html') {
        const registerForm = document.querySelector('.auth-form');
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegister);
        }
    }
    
    // Update navigation based on auth status
    updateNavigation();
});

// Update navigation based on authentication status
function updateNavigation() {
    const isAuthenticated = checkAuth();
    const nav = document.querySelector('.nav');
    
    if (nav && isAuthenticated) {
        const user = JSON.parse(localStorage.getItem('user'));
        
        // Replace login/register buttons with user menu
        const authLinks = nav.querySelectorAll('a[href="login.html"], a[href="register.html"]');
        authLinks.forEach(link => link.style.display = 'none');
        
        // Add user greeting and logout
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';
        userInfo.innerHTML = `
            <span>Welcome, ${user.firstName}!</span>
            <button onclick="logout()" class="btn-secondary">Logout</button>
        `;
        nav.appendChild(userInfo);
    }
}