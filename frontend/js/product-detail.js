// ========================================
// CLICKCART - PRODUCT DETAIL PAGE
// ========================================

let currentProduct = null;
let selectedSize = null;
let selectedColor = null;
let selectedRating = 0;

// Sample product for demo
const sampleProduct = {
    _id: '1',
    name: 'Premium Cotton T-Shirt',
    brand: 'StyleCraft',
    description: 'Experience ultimate comfort with our Premium Cotton T-Shirt. Made from 100% organic cotton, this t-shirt features a relaxed fit that\'s perfect for everyday wear. The breathable fabric keeps you cool and comfortable all day long. Available in multiple colors and sizes.',
    price: 599,
    originalPrice: 999,
    discount: 40,
    rating: 4.5,
    numReviews: 128,
    category: 'clothing',
    stock: 50,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
        { name: 'White', hex: '#FFFFFF' },
        { name: 'Black', hex: '#000000' },
        { name: 'Navy', hex: '#1e3a5f' }
    ],
    images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300'
};

const sampleReviews = [
    {
        _id: 'r1',
        user: { name: 'Rahul Sharma' },
        rating: 5,
        title: 'Excellent quality!',
        comment: 'Amazing t-shirt! The fabric is very soft and comfortable. Fits perfectly as per the size chart. Highly recommended!',
        isVerifiedPurchase: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
        _id: 'r2',
        user: { name: 'Priya Patel' },
        rating: 4,
        title: 'Good product',
        comment: 'Nice t-shirt, good quality cotton. Color is exactly as shown. Delivery was quick.',
        isVerifiedPurchase: true,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    }
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const productId = new URLSearchParams(window.location.search).get('id');
    loadProduct(productId);
    setupReviewForm();
    setupStarInput();
});

// Load product
async function loadProduct(productId) {
    try {
        const { product, reviews } = await API.products.getById(productId);
        currentProduct = product;
        renderProduct(product);
        renderReviews(reviews);
        loadRelatedProducts(productId);
    } catch (error) {
        console.error('Error loading product:', error);
        // Use sample data
        currentProduct = sampleProduct;
        renderProduct(sampleProduct);
        renderReviews(sampleReviews);
        loadSampleRelatedProducts();
    }
}

// Render product
function renderProduct(product) {
    document.title = `${product.name} - ClickCart`;
    
    // Basic info
    document.getElementById('productBrand').textContent = product.brand;
    document.getElementById('productTitle').textContent = product.name;
    document.getElementById('productDescription').textContent = product.description;
    document.getElementById('productCategory').textContent = product.category;
    
    // Rating
    document.getElementById('productStars').innerHTML = generateStars(product.rating);
    document.getElementById('productRating').textContent = product.rating?.toFixed(1) || '0';
    document.getElementById('reviewCount').textContent = product.numReviews || 0;
    
    // Price
    document.getElementById('currentPrice').textContent = formatPrice(product.price);
    if (product.originalPrice) {
        document.getElementById('originalPrice').textContent = formatPrice(product.originalPrice);
        const discount = Math.round((1 - product.price / product.originalPrice) * 100);
        document.getElementById('discountBadge').textContent = `${discount}% OFF`;
    }
    
    // Images
    const mainImage = document.getElementById('mainImage');
    mainImage.innerHTML = `<img src="${product.images?.[0] || product.thumbnail}" alt="${product.name}">`;
    
    if (product.images && product.images.length > 1) {
        const thumbnails = document.getElementById('thumbnails');
        thumbnails.innerHTML = product.images.map((img, i) => `
            <div class="thumbnail ${i === 0 ? 'active' : ''}" onclick="changeImage('${img}', this)">
                <img src="${img}" alt="Thumbnail ${i + 1}">
            </div>
        `).join('');
    }
    
    // Sizes
    if (product.sizes && product.sizes.length > 0) {
        document.getElementById('sizeGroup').style.display = 'block';
        document.getElementById('sizeOptions').innerHTML = product.sizes.map(size => `
            <button class="size-btn" onclick="selectSize('${size}', this)">${size}</button>
        `).join('');
    }
    
    // Colors
    if (product.colors && product.colors.length > 0) {
        document.getElementById('colorGroup').style.display = 'block';
        document.getElementById('colorOptions').innerHTML = product.colors.map(color => `
            <button class="color-btn" style="background-color: ${color.hex}" 
                    title="${color.name}" 
                    onclick="selectColor('${color.name}', this)"></button>
        `).join('');
    }
    
    // Stock
    const stockInfo = document.getElementById('stockInfo');
    if (product.stock > 10) {
        stockInfo.textContent = 'In Stock';
        stockInfo.className = 'stock-info';
    } else if (product.stock > 0) {
        stockInfo.textContent = `Only ${product.stock} left!`;
        stockInfo.className = 'stock-info low';
    } else {
        stockInfo.textContent = 'Out of Stock';
        stockInfo.className = 'stock-info out';
    }
    
    // Wishlist button
    updateWishlistButton();
}

// Change main image
function changeImage(src, element) {
    document.querySelector('#mainImage img').src = src;
    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
    element.classList.add('active');
}

// Select size
function selectSize(size, element) {
    selectedSize = size;
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    element.classList.add('active');
}

// Select color
function selectColor(color, element) {
    selectedColor = color;
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    element.classList.add('active');
}

// Change quantity
function changeQuantity(delta) {
    const input = document.getElementById('quantity');
    let value = parseInt(input.value) + delta;
    if (value < 1) value = 1;
    if (currentProduct && value > currentProduct.stock) value = currentProduct.stock;
    input.value = value;
}

// Add to cart
async function addToCart() {
    if (!currentProduct) return;
    
    // Validate selections
    if (currentProduct.sizes?.length > 0 && !selectedSize) {
        showToast('Please select a size', 'warning');
        return;
    }
    
    if (currentProduct.colors?.length > 0 && !selectedColor) {
        showToast('Please select a color', 'warning');
        return;
    }
    
    const quantity = parseInt(document.getElementById('quantity').value);
    
    try {
        await Cart.add(currentProduct._id, quantity, selectedSize, selectedColor, currentProduct);
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

// Toggle wishlist
async function toggleProductWishlist() {
    if (!currentProduct) return;
    
    try {
        await Wishlist.toggle(currentProduct._id, currentProduct);
        updateWishlistButton();
    } catch (error) {
        console.error('Error toggling wishlist:', error);
    }
}

// Update wishlist button
function updateWishlistButton() {
    const btn = document.getElementById('wishlistBtn');
    const isWishlisted = currentProduct && Wishlist.isInWishlist(currentProduct._id);
    
    if (isWishlisted) {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-heart"></i>';
    } else {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="far fa-heart"></i>';
    }
}

// Render reviews
function renderReviews(reviews) {
    const container = document.getElementById('reviewsList');
    
    if (!reviews || reviews.length === 0) {
        container.innerHTML = '<p class="text-center" style="color: var(--gray-500);">No reviews yet. Be the first to review!</p>';
        return;
    }
    
    // Update summary
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    document.getElementById('avgRating').textContent = avg.toFixed(1);
    document.getElementById('avgStars').innerHTML = generateStars(avg);
    document.getElementById('totalReviews').textContent = reviews.length;
    
    container.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <div class="reviewer-info">
                    <div class="reviewer-avatar">${review.user.name.charAt(0)}</div>
                    <div>
                        <div class="reviewer-name">${review.user.name}</div>
                        <div class="reviewer-date">${formatDate(review.createdAt)}</div>
                    </div>
                </div>
                <div class="review-rating">${generateStars(review.rating)}</div>
            </div>
            ${review.title ? `<div class="review-title">${review.title}</div>` : ''}
            <div class="review-content">${review.comment}</div>
            ${review.isVerifiedPurchase ? '<div class="verified-badge"><i class="fas fa-check-circle"></i> Verified Purchase</div>' : ''}
        </div>
    `).join('');
}

// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Setup star input
function setupStarInput() {
    const starInput = document.getElementById('starInput');
    const stars = starInput.querySelectorAll('i');
    
    stars.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.rating);
            stars.forEach((s, i) => {
                if (i < selectedRating) {
                    s.classList.remove('far');
                    s.classList.add('fas', 'active');
                } else {
                    s.classList.remove('fas', 'active');
                    s.classList.add('far');
                }
            });
        });
    });
}

// Setup review form
function setupReviewForm() {
    const form = document.getElementById('reviewForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!Auth.requireAuth()) return;
        
        if (selectedRating === 0) {
            showToast('Please select a rating', 'warning');
            return;
        }
        
        const formData = new FormData(form);
        
        try {
            await API.reviews.create(currentProduct._id, {
                rating: selectedRating,
                title: formData.get('title'),
                comment: formData.get('comment')
            });
            
            showToast('Review submitted successfully!', 'success');
            form.reset();
            selectedRating = 0;
            document.querySelectorAll('#starInput i').forEach(s => {
                s.classList.remove('fas', 'active');
                s.classList.add('far');
            });
            
            // Reload reviews
            loadProduct(currentProduct._id);
        } catch (error) {
            showToast(error.message, 'error');
        }
    });
}

// Load related products
async function loadRelatedProducts(productId) {
    try {
        const products = await API.products.getRelated(productId);
        renderRelatedProducts(products);
    } catch (error) {
        loadSampleRelatedProducts();
    }
}

function loadSampleRelatedProducts() {
    const related = [
        { _id: '2', name: 'Classic Denim Jeans', brand: 'DenimCo', price: 1299, originalPrice: 1999, rating: 4.3, numReviews: 89, thumbnail: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300' },
        { _id: '7', name: 'Casual Hoodie', brand: 'ComfortWear', price: 999, originalPrice: 1599, rating: 4.5, numReviews: 92, thumbnail: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300' },
        { _id: '5', name: 'Running Sports Shoes', brand: 'SpeedRun', price: 2499, originalPrice: 3999, rating: 4.6, numReviews: 178, thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300' },
        { _id: '3', name: 'Leather Watch', brand: 'TimeMaster', price: 2999, originalPrice: 4999, rating: 4.7, numReviews: 56, thumbnail: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=300' }
    ];
    renderRelatedProducts(related);
}

function renderRelatedProducts(products) {
    const container = document.getElementById('relatedProducts');
    container.innerHTML = products.map(p => createProductCard(p)).join('');
}

