// ========================================
// CLICKCART - MAIN JAVASCRIPT
// ========================================

// Toast Notification System
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'fa-check',
        error: 'fa-times',
        warning: 'fa-exclamation',
        info: 'fa-info'
    };

    toast.innerHTML = `
        <span class="toast-icon"><i class="fas ${icons[type]}"></i></span>
        <span class="toast-message">${message}</span>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;

    container.appendChild(toast);

    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    });

    // Auto remove
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('toast-exit');
            setTimeout(() => toast.remove(), 300);
        }
    }, duration);
}

// Format price
function formatPrice(price) {
    return `${CONFIG.CURRENCY}${price.toLocaleString('en-IN')}`;
}

// Generate star rating HTML
function generateStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars && hasHalf) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// Create product card HTML
function createProductCard(product) {
    const isWishlisted = Wishlist.isInWishlist(product._id);
    const discount = product.discount || (product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0);

    return `
        <div class="product-card" data-id="${product._id}">
            <div class="product-image">
                <a href="product.html?id=${product._id}">
                    <img src="${product.thumbnail || product.images?.[0] || 'https://via.placeholder.com/300'}" 
                         alt="${product.name}" 
                         loading="lazy">
                </a>
                <div class="product-badges">
                    ${discount > 0 ? `<span class="product-badge badge-discount">-${discount}%</span>` : ''}
                </div>
                <div class="product-actions">
                    <button class="action-btn ${isWishlisted ? 'wishlisted' : ''}" 
                            onclick="toggleWishlist('${product._id}')" 
                            title="Add to Wishlist">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="action-btn" 
                            onclick="quickAddToCart('${product._id}')" 
                            title="Add to Cart">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                    <a href="product.html?id=${product._id}" class="action-btn" title="View Details">
                        <i class="fas fa-eye"></i>
                    </a>
                </div>
            </div>
            <div class="product-info">
                <span class="product-brand">${product.brand}</span>
                <h3 class="product-name">
                    <a href="product.html?id=${product._id}">${product.name}</a>
                </h3>
                <div class="product-rating">
                    <span class="stars">${generateStars(product.rating || 0)}</span>
                    <span class="rating-count">(${product.numReviews || 0})</span>
                </div>
                <div class="product-price">
                    <span class="current-price">${formatPrice(product.price)}</span>
                    ${product.originalPrice ? `<span class="original-price">${formatPrice(product.originalPrice)}</span>` : ''}
                </div>
            </div>
        </div>
    `;
}

// Quick add to cart
async function quickAddToCart(productId) {
    try {
        // Fetch product details if needed
        const { product } = await API.products.getById(productId);
        await Cart.add(productId, 1, null, null, product);
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

// Toggle wishlist
async function toggleWishlist(productId) {
    try {
        const result = await Wishlist.toggle(productId);
        
        // Update button UI
        const btn = document.querySelector(`.product-card[data-id="${productId}"] .action-btn:first-child`);
        if (btn) {
            btn.classList.toggle('wishlisted', result.added);
        }
    } catch (error) {
        console.error('Error toggling wishlist:', error);
    }
}

// Header scroll effect
function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Mobile menu toggle
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('show');
            menuToggle.querySelector('i').classList.toggle('fa-bars');
            menuToggle.querySelector('i').classList.toggle('fa-times');
        });
    }
}

// Search functionality
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.search-btn');

    if (searchInput) {
        const performSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `products.html?search=${encodeURIComponent(query)}`;
            }
        };

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        if (searchBtn) {
            searchBtn.addEventListener('click', performSearch);
        }
    }
}

// Countdown Timer
function initCountdown() {
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (!daysEl) return;

    // Set end date to 7 days from now
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    function updateCountdown() {
        const now = new Date();
        const diff = endDate - now;

        if (diff <= 0) {
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Newsletter form
function initNewsletter() {
    const form = document.getElementById('newsletterForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = form.querySelector('input[type="email"]').value;
            showToast('Thanks for subscribing!', 'success');
            form.reset();
        });
    }
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize all common functionality
document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initMobileMenu();
    initSearch();
    initCountdown();
    initNewsletter();
});

