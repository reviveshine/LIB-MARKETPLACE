// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';
let authToken = localStorage.getItem('authToken');
let currentUser = null;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    checkAPIHealth();
    setupEventListeners();
});

// Check if user is authenticated
function checkAuthStatus() {
    if (authToken) {
        fetchCurrentUser();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Auth buttons
    document.getElementById('loginBtn').addEventListener('click', () => showModal('login'));
    document.getElementById('registerBtn').addEventListener('click', () => showModal('register'));
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Modal controls
    document.querySelector('.close').addEventListener('click', hideModal);
    document.getElementById('showRegister').addEventListener('click', () => switchAuthForm('register'));
    document.getElementById('showLogin').addEventListener('click', () => switchAuthForm('login'));
    
    // Form submissions
    document.getElementById('loginFormSubmit').addEventListener('submit', handleLogin);
    document.getElementById('registerFormSubmit').addEventListener('submit', handleRegister);
    
    // Test buttons
    document.getElementById('testHealth').addEventListener('click', testAPIHealth);
    document.getElementById('testRegister').addEventListener('click', testRegister);
    document.getElementById('testLogin').addEventListener('click', testLogin);
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('authModal')) {
            hideModal();
        }
    });
}

// API Health Check
async function checkAPIHealth() {
    try {
        const response = await axios.get(`${API_BASE_URL}/health`);
        if (response.data.status === 'OK') {
            updateAPIStatus('🟢 API Online', '#059669');
        }
    } catch (error) {
        updateAPIStatus('🔴 API Offline', '#EF4444');
    }
}

function updateAPIStatus(text, color) {
    const statusElement = document.getElementById('apiStatus');
    statusElement.textContent = text;
    statusElement.style.color = color;
}

// Modal functions
function showModal(type) {
    document.getElementById('authModal').style.display = 'block';
    switchAuthForm(type);
}

function hideModal() {
    document.getElementById('authModal').style.display = 'none';
}

function switchAuthForm(type) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (type === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            email,
            password
        });
        
        if (response.data.success) {
            authToken = response.data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = response.data.user;
            updateUIAfterAuth();
            hideModal();
            showNotification('Login successful!', 'success');
        }
    } catch (error) {
        const message = error.response?.data?.message || 'Login failed';
        showNotification(message, 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const formData = {
        firstName: document.getElementById('regFirstName').value,
        lastName: document.getElementById('regLastName').value,
        email: document.getElementById('regEmail').value,
        phone: document.getElementById('regPhone').value,
        password: document.getElementById('regPassword').value,
        role: document.getElementById('regRole').value
    };
    
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, formData);
        
        if (response.data.success) {
            authToken = response.data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = response.data.user;
            updateUIAfterAuth();
            hideModal();
            showNotification('Registration successful!', 'success');
        }
    } catch (error) {
        const message = error.response?.data?.message || 'Registration failed';
        showNotification(message, 'error');
    }
}

async function fetchCurrentUser() {
    try {
        const response = await axios.get(`${API_BASE_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.data.success) {
            currentUser = response.data.user;
            updateUIAfterAuth();
        }
    } catch (error) {
        // Token might be invalid, clear it
        logout();
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    updateUIAfterLogout();
    showNotification('Logged out successfully', 'info');
}

function updateUIAfterAuth() {
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('registerBtn').style.display = 'none';
    document.getElementById('userMenu').style.display = 'flex';
    document.getElementById('userName').textContent = currentUser.firstName;
}

function updateUIAfterLogout() {
    document.getElementById('loginBtn').style.display = 'inline-block';
    document.getElementById('registerBtn').style.display = 'inline-block';
    document.getElementById('userMenu').style.display = 'none';
}

// Test functions
async function testAPIHealth() {
    try {
        const response = await axios.get(`${API_BASE_URL}/health`);
        displayTestResult('API Health Test', response.data);
    } catch (error) {
        displayTestResult('API Health Test', { error: error.message });
    }
}

async function testRegister() {
    const testUser = {
        firstName: 'Test',
        lastName: 'User',
        email: `test${Date.now()}@example.com`,
        phone: '+1234567890',
        password: 'password123',
        role: 'buyer'
    };
    
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
        displayTestResult('Register Test', response.data);
    } catch (error) {
        displayTestResult('Register Test', error.response?.data || { error: error.message });
    }
}

async function testLogin() {
    const testCredentials = {
        email: 'test@example.com',
        password: 'password123'
    };
    
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, testCredentials);
        displayTestResult('Login Test', response.data);
    } catch (error) {
        displayTestResult('Login Test', error.response?.data || { error: error.message });
    }
}

function displayTestResult(testName, result) {
    const resultsDiv = document.getElementById('testResults');
    const timestamp = new Date().toLocaleTimeString();
    resultsDiv.textContent += `\n[${timestamp}] ${testName}:\n${JSON.stringify(result, null, 2)}\n${'='.repeat(50)}\n`;
    resultsDiv.scrollTop = resultsDiv.scrollHeight;
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#059669',
        error: '#EF4444',
        info: '#3B82F6',
        warning: '#F59E0B'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

# LIB MARKETPLACE Project Structure Fix Script

Write-Host "🔧 Fixing LIB MARKETPLACE Project Structure..." -ForegroundColor Green

# Navigate to the main project directory
Set-Location "C:\Users\reviv\Projects\LIB-MARKETPLACE"

# Remove nested/duplicate directories
Write-Host "🧹 Cleaning up duplicate directories..." -ForegroundColor Yellow
if (Test-Path "Backend\backend") {
    Remove-Item "Backend\backend" -Recurse -Force
    Write-Host "✅ Removed nested backend directory" -ForegroundColor Green
}

if (Test-Path "LIB-MARKETPLACE") {
    # Move any useful files from LIB-MARKETPLACE to main directory
    if (Test-Path "LIB-MARKETPLACE\frontend" -and !(Test-Path "frontend")) {
        Move-Item "LIB-MARKETPLACE\frontend" "frontend"
    }
    Remove-Item "LIB-MARKETPLACE" -Recurse -Force
    Write-Host "✅ Removed duplicate LIB-MARKETPLACE directory" -ForegroundColor Green
}

# Create proper directory structure
$directories = @(
    "Backend\src\config",
    "Backend\src\controllers",
    "Backend\src\middleware",
    "Backend\src\models",
    "Backend\src\routes",
    "Backend\src\services",
    "Backend\src\utils",
    "Backend\tests\unit",
    "Backend\tests\integration",
    "Backend\logs",
    "Backend\uploads",
    "frontend\src\components",
    "frontend\src\pages",
    "frontend\src\services",
    "frontend\src\styles",
    "frontend\public",
    "assets\images",
    "assets\logos",
    "docs\api"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ Created directory: $dir" -ForegroundColor Green
    }
}

# Create .gitkeep files for empty directories
@("Backend\logs", "Backend\uploads", "frontend\public") | ForEach-Object {
    if (!(Test-Path "$_\.gitkeep")) {
        New-Item -ItemType File -Path "$_\.gitkeep" -Force | Out-Null
    }
}

Write-Host "🎉 Project structure fixed successfully!" -ForegroundColor Green