// ========================================
// CLICKCART - PRODUCTS PAGE
// ========================================

let currentFilters = {
    category: '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    brand: '',
    search: '',
    sort: 'newest',
    page: 1
};

// Sample products for demo
const sampleProducts = [
    { _id: '1', name: 'Premium Cotton T-Shirt', brand: 'StyleCraft', price: 599, originalPrice: 999, rating: 4.5, numReviews: 128, category: 'clothing', thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300' },
    { _id: '2', name: 'Classic Denim Jeans', brand: 'DenimCo', price: 1299, originalPrice: 1999, rating: 4.3, numReviews: 89, category: 'clothing', thumbnail: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300' },
    { _id: '3', name: 'Leather Chronograph Watch', brand: 'TimeMaster', price: 2999, originalPrice: 4999, rating: 4.7, numReviews: 56, category: 'accessories', thumbnail: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=300' },
    { _id: '4', name: 'Wireless Bluetooth Earbuds', brand: 'SoundPro', price: 1499, originalPrice: 2499, rating: 4.4, numReviews: 234, category: 'electronics', thumbnail: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300' },
    { _id: '5', name: 'Running Sports Shoes', brand: 'SpeedRun', price: 2499, originalPrice: 3999, rating: 4.6, numReviews: 178, category: 'footwear', thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300' },
    { _id: '6', name: 'Designer Sunglasses', brand: 'VisionStyle', price: 899, originalPrice: 1499, rating: 4.2, numReviews: 67, category: 'accessories', thumbnail: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300' },
    { _id: '7', name: 'Casual Hoodie', brand: 'ComfortWear', price: 999, originalPrice: 1599, rating: 4.5, numReviews: 92, category: 'clothing', thumbnail: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300' },
    { _id: '8', name: 'Leather Wallet', brand: 'LeatherCraft', price: 699, originalPrice: 999, rating: 4.4, numReviews: 143, category: 'accessories', thumbnail: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=300' },
    { _id: '9', name: 'Smart Watch Pro', brand: 'TechWear', price: 3999, originalPrice: 5999, rating: 4.6, numReviews: 312, category: 'electronics', thumbnail: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=300' },
    { _id: '10', name: 'Canvas Backpack', brand: 'TravelPro', price: 1199, originalPrice: 1799, rating: 4.3, numReviews: 87, category: 'accessories', thumbnail: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300' },
    { _id: '11', name: 'Formal Leather Shoes', brand: 'ClassicStep', price: 3499, originalPrice: 4999, rating: 4.5, numReviews: 65, category: 'footwear', thumbnail: 'https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=300' },
    { _id: '12', name: 'Bluetooth Speaker', brand: 'SoundPro', price: 1999, originalPrice: 2999, rating: 4.4, numReviews: 198, category: 'electronics', thumbnail: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300' }
];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    parseURLParams();
    loadProducts();
    setupFilterListeners();
    loadBrands();
});

// Parse URL parameters
function parseURLParams() {
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('category')) {
        currentFilters.category = params.get('category');
        document.querySelector(`input[name="category"][value="${currentFilters.category}"]`)?.click();
    }
    
    if (params.has('search')) {
        currentFilters.search = params.get('search');
        document.getElementById('searchInput').value = currentFilters.search;
    }
    
    if (params.has('sort')) {
        currentFilters.sort = params.get('sort');
        document.getElementById('sortSelect').value = currentFilters.sort;
    }

    updatePageTitle();
}

// Update page title based on filters
function updatePageTitle() {
    const title = document.getElementById('pageTitle');
    const category = document.getElementById('currentCategory');
    
    if (currentFilters.category) {
        const categoryName = currentFilters.category.charAt(0).toUpperCase() + currentFilters.category.slice(1);
        title.innerHTML = `${categoryName} <span class="gradient-text">Collection</span>`;
        category.textContent = categoryName;
    } else if (currentFilters.search) {
        title.innerHTML = `Search: <span class="gradient-text">${currentFilters.search}</span>`;
        category.textContent = 'Search Results';
    } else {
        title.innerHTML = 'All <span class="gradient-text">Products</span>';
        category.textContent = 'All Products';
    }
}

// Load products
async function loadProducts() {
    const grid = document.getElementById('productsGrid');
    
    try {
        const { products, total, pages, page } = await API.products.getAll(currentFilters);
        renderProducts(products);
        renderPagination(pages, page);
        document.getElementById('resultsCount').textContent = total;
    } catch (error) {
        console.error('Error loading products:', error);
        // Use sample products for demo
        renderSampleProducts();
    }
}

// Render sample products (fallback)
function renderSampleProducts() {
    let filtered = [...sampleProducts];
    
    // Apply filters
    if (currentFilters.category) {
        filtered = filtered.filter(p => p.category === currentFilters.category);
    }
    
    if (currentFilters.search) {
        const search = currentFilters.search.toLowerCase();
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(search) || 
            p.brand.toLowerCase().includes(search)
        );
    }
    
    if (currentFilters.minPrice) {
        filtered = filtered.filter(p => p.price >= parseInt(currentFilters.minPrice));
    }
    
    if (currentFilters.maxPrice) {
        filtered = filtered.filter(p => p.price <= parseInt(currentFilters.maxPrice));
    }
    
    if (currentFilters.rating) {
        filtered = filtered.filter(p => p.rating >= parseInt(currentFilters.rating));
    }
    
    // Apply sort
    switch (currentFilters.sort) {
        case 'price_asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price_desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
    }
    
    renderProducts(filtered);
    document.getElementById('resultsCount').textContent = filtered.length;
    renderPagination(1, 1);
}

// Render products
function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No Products Found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button class="btn btn-primary" onclick="clearFilters()">Clear Filters</button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = products.map(product => createProductCard(product)).join('');
}

// Render pagination
function renderPagination(totalPages, currentPage) {
    const container = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = `
        <button ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<button disabled>...</button>`;
        }
    }
    
    html += `
        <button ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    container.innerHTML = html;
}

// Setup filter listeners
function setupFilterListeners() {
    // Category filters
    document.querySelectorAll('input[name="category"]').forEach(input => {
        input.addEventListener('change', (e) => {
            currentFilters.category = e.target.value;
            currentFilters.page = 1;
            updatePageTitle();
            loadProducts();
            updateURL();
        });
    });
    
    // Rating filters
    document.querySelectorAll('input[name="rating"]').forEach(input => {
        input.addEventListener('change', (e) => {
            currentFilters.rating = e.target.value;
            currentFilters.page = 1;
            loadProducts();
        });
    });
}

// Load brands
async function loadBrands() {
    const container = document.getElementById('brandFilters');
    
    try {
        const brands = await API.products.getBrands();
        container.innerHTML = brands.map(brand => `
            <label class="filter-option">
                <input type="checkbox" name="brand" value="${brand}">
                <span>${brand}</span>
            </label>
        `).join('');
    } catch (error) {
        // Use sample brands
        const brands = ['StyleCraft', 'DenimCo', 'TimeMaster', 'SoundPro', 'SpeedRun'];
        container.innerHTML = brands.map(brand => `
            <label class="filter-option">
                <input type="checkbox" name="brand" value="${brand}">
                <span>${brand}</span>
            </label>
        `).join('');
    }
}

// Apply price filter
function applyPriceFilter() {
    currentFilters.minPrice = document.getElementById('minPrice').value;
    currentFilters.maxPrice = document.getElementById('maxPrice').value;
    currentFilters.page = 1;
    loadProducts();
}

// Apply sort
function applySort() {
    currentFilters.sort = document.getElementById('sortSelect').value;
    loadProducts();
}

// Go to page
function goToPage(page) {
    currentFilters.page = page;
    loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Clear filters
function clearFilters() {
    currentFilters = {
        category: '',
        minPrice: '',
        maxPrice: '',
        rating: '',
        brand: '',
        search: '',
        sort: 'newest',
        page: 1
    };
    
    document.querySelector('input[name="category"][value=""]').checked = true;
    document.querySelector('input[name="rating"][value=""]').checked = true;
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.getElementById('sortSelect').value = 'newest';
    
    updatePageTitle();
    loadProducts();
    updateURL();
}

// Toggle filters sidebar (mobile)
function toggleFilters() {
    document.getElementById('filtersSidebar').classList.toggle('show');
}

// Set grid view
function setGridView(view) {
    const grid = document.getElementById('productsGrid');
    const buttons = document.querySelectorAll('.view-toggle button');
    
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.closest('button').classList.add('active');
    
    if (view === 'list') {
        grid.classList.add('list-view');
    } else {
        grid.classList.remove('list-view');
    }
}

// Update URL with current filters
function updateURL() {
    const params = new URLSearchParams();
    
    if (currentFilters.category) params.set('category', currentFilters.category);
    if (currentFilters.search) params.set('search', currentFilters.search);
    if (currentFilters.sort !== 'newest') params.set('sort', currentFilters.sort);
    
    const newURL = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', newURL);
}

