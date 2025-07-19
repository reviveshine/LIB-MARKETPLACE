// Sample product data
const sampleProducts = [
    {
        id: 1,
        title: "Wireless Bluetooth Headphones",
        price: 79.99,
        category: "electronics",
        seller: "TechStore Pro",
        rating: 4.5,
        reviews: 234,
        image: "https://via.placeholder.com/250x200?text=Headphones"
    },
    {
        id: 2,
        title: "Vintage Leather Jacket",
        price: 149.99,
        category: "clothing",
        seller: "Fashion Hub",
        rating: 4.8,
        reviews: 89,
        image: "https://via.placeholder.com/250x200?text=Jacket"
    },
    {
        id: 3,
        title: "Smart Home Security Camera",
        price: 129.99,
        category: "electronics",
        seller: "SecureHome",
        rating: 4.3,
        reviews: 156,
        image: "https://via.placeholder.com/250x200?text=Camera"
    },
    {
        id: 4,
        title: "Organic Garden Tools Set",
        price: 45.99,
        category: "home",
        seller: "Green Thumb",
        rating: 4.6,
        reviews: 78,
        image: "https://via.placeholder.com/250x200?text=Tools"
    },
    {
        id: 5,
        title: "Programming Books Bundle",
        price: 89.99,
        category: "books",
        seller: "CodeBooks",
        rating: 4.7,
        reviews: 342,
        image: "https://via.placeholder.com/250x200?text=Books"
    },
    {
        id: 6,
        title: "Yoga Mat Premium",
        price: 34.99,
        category: "sports",
        seller: "FitLife Store",
        rating: 4.4,
        reviews: 201,
        image: "https://via.placeholder.com/250x200?text=Yoga+Mat"
    }
];

let currentPage = 1;
const productsPerPage = 6;
let filteredProducts = [...sampleProducts];
let currentUserType = 'buyer';

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
});

// Load and display products
function loadProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';
    
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const pageProducts = filteredProducts.slice(start, end);
    
    pageProducts.forEach(product => {
        const card = createProductCard(product);
        grid.appendChild(card);
    });
    
    updatePagination();
}

// Create product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <img src="${product.image}" alt="${product.title}" class="product-image">
        <div class="product-info">
            <h3 class="product-title">${product.title}</h3>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <p class="product-seller">by ${product.seller}</p>
            <div class="product-rating">
                <span class="stars">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5-Math.floor(product.rating))}</span>
                <span>(${product.reviews} reviews)</span>
            </div>
        </div>
    `;
    card.onclick = () => viewProduct(product.id);
    return card;
}

// Search products
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    filteredProducts = sampleProducts.filter(product => 
        product.title.toLowerCase().includes(searchTerm) ||
        product.seller.toLowerCase().includes(searchTerm)
    );
    currentPage = 1;
    loadProducts();
}

// Filter products
function filterProducts() {
    const category = document.getElementById('categoryFilter').value;
    const priceRange = document.getElementById('priceFilter').value;
    
    filteredProducts = sampleProducts.filter(product => {
        let matchCategory = !category || product.category === category;
        let matchPrice = true;
        
        if (priceRange) {
            if (priceRange === '0-50') matchPrice = product.price <= 50;
            else if (priceRange === '50-100') matchPrice = product.price > 50 && product.price <= 100;
            else if (priceRange === '100-500') matchPrice = product.price > 100 && product.price <= 500;
            else if (priceRange === '500+') matchPrice = product.price > 500;
        }
        
        return matchCategory && matchPrice;
    });
    
    currentPage = 1;
    loadProducts();
}

// Sort products
function sortProducts() {
    const sortBy = document.getElementById('sortFilter').value;
    
    switch(sortBy) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'newest':
            filteredProducts.reverse();
            break;
        default:
            filteredProducts = [...sampleProducts];
    }
    
    loadProducts();
}

// Pagination functions
function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages;
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        loadProducts();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        loadProducts();
    }
}

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function switchModal(closeId, openId) {
    closeModal(closeId);
    openModal(openId);
}

// Tab switching for signup
function switchTab(type) {
    currentUserType = type;
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent.toLowerCase() === type) {
            tab.classList.add('active');
        }
    });
    
    contents.forEach(content => {
        content.classList.remove('active');
    });
    
    if (type === 'buyer') {
        document.getElementById('buyerFields').classList.add('active');
    } else {
        document.getElementById('sellerFields').classList.add('active');
    }
}

// Handle login
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const remember = document.getElementById('rememberMe').checked;
    
    // Simulate login API call
    console.log('Login attempt:', { email, password, remember });
    
    // Show success message
    alert('Login successful! Redirecting to dashboard...');
    closeModal('loginModal');
    
    // In real app, would redirect to appropriate dashboard
    // window.location.href = '/dashboard';
}

// Handle signup
function handleSignup(event) {
    event.preventDefault();
    
    let userData = {
        userType: currentUserType,
        agreeTerms: document.getElementById('agreeTerms').checked
    };
    
    if (currentUserType === 'buyer') {
        userData = {
            ...userData,
            name: document.getElementById('buyerName').value,
            email: document.getElementById('buyerEmail').value,
            phone: document.getElementById('buyerPhone').value,
            password: document.getElementById('buyerPassword').value
        };
        
        // Validate password match
        if (userData.password !== document.getElementById('buyerConfirmPassword').value) {
            alert('Passwords do not match!');
            return;
        }
    } else {
        userData = {
            ...userData,
            businessName: document.getElementById('businessName').value,
            email: document.getElementById('sellerEmail').value,
            phone: document.getElementById('sellerPhone').value,
            businessType: document.getElementById('businessType').value,
            password: document.getElementById('sellerPassword').value
        };
        
        // Validate password match
        if (userData.password !== document.getElementById('sellerConfirmPassword').value) {
            alert('Passwords do not match!');
            return;
        }
    }
    
    // Simulate signup API call
    console.log('Signup data:', userData);
    
    // Show verification modal
    closeModal('signupModal');
    openModal('verificationModal');
}

// Verification functions
function verifyEmail() {
    const code = document.getElementById('emailCode').value;
    if (code.length === 6) {
        console.log('Email verification code:', code);
        document.getElementById('emailStep').classList.remove('active');
        document.getElementById('smsStep').classList.add('active');
    } else {
        alert('Please enter a valid 6-digit code');
    }
}

function verifySMS() {
    const code = document.getElementById('smsCode').value;
    if (code.length === 6) {
        console.log('SMS verification code:', code);
        document.getElementById('smsStep').classList.remove('active');
        document.getElementById('kycStep').classList.add('active');
    } else {
        alert('Please enter a valid 6-digit code');
    }
}

function uploadKYC() {
    const docType = document.getElementById('docType').value;
    const fileInput = document.getElementById('docUpload');
    
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        console.log('KYC upload:', { docType, fileName: file.name });
        
        // Simulate upload
        alert('Document uploaded successfully! Your account is pending verification.');
        closeModal('verificationModal');
        
        // In real app, would upload file and redirect
        // window.location.href = '/dashboard';
    } else {
        alert('Please select a document to upload');
    }
}

// View product details
function viewProduct(productId) {
    console.log('Viewing product:', productId);
    // In real app, would navigate to product detail page
    alert(`Viewing product ${productId}. In a real app, this would navigate to the product detail page.`);
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}