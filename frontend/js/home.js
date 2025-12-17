// ========================================
// CLICKCART - HOME PAGE
// ========================================

// Load featured products
async function loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;

    try {
        const products = await API.products.getFeatured();
        
        if (products.length === 0) {
            container.innerHTML = '<p class="text-center">No featured products available.</p>';
            return;
        }

        container.innerHTML = products.map(product => createProductCard(product)).join('');
    } catch (error) {
        console.error('Error loading featured products:', error);
        // Fallback: Load sample products for demo
        loadSampleProducts(container);
    }
}

// Load new arrivals
async function loadNewArrivals() {
    const container = document.getElementById('newArrivals');
    if (!container) return;

    try {
        const { products } = await API.products.getAll({ sort: 'newest', limit: 4 });
        
        if (products.length === 0) {
            container.innerHTML = '<p class="text-center">No new arrivals.</p>';
            return;
        }

        container.innerHTML = products.map(product => createProductCard(product)).join('');
    } catch (error) {
        console.error('Error loading new arrivals:', error);
        loadSampleProducts(container, 4);
    }
}

// Sample products for demo (when API is not available)
function loadSampleProducts(container, count = 8) {
    const sampleProducts = [
        {
            _id: '1',
            name: 'Premium Cotton T-Shirt',
            brand: 'StyleCraft',
            price: 599,
            originalPrice: 999,
            discount: 40,
            rating: 4.5,
            numReviews: 128,
            thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300',
            isFeatured: true
        },
        {
            _id: '2',
            name: 'Classic Denim Jeans',
            brand: 'DenimCo',
            price: 1299,
            originalPrice: 1999,
            discount: 35,
            rating: 4.3,
            numReviews: 89,
            thumbnail: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300',
            isFeatured: true
        },
        {
            _id: '3',
            name: 'Leather Chronograph Watch',
            brand: 'TimeMaster',
            price: 2999,
            originalPrice: 4999,
            discount: 40,
            rating: 4.7,
            numReviews: 56,
            thumbnail: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=300',
            isFeatured: true
        },
        {
            _id: '4',
            name: 'Wireless Bluetooth Earbuds',
            brand: 'SoundPro',
            price: 1499,
            originalPrice: 2499,
            discount: 40,
            rating: 4.4,
            numReviews: 234,
            thumbnail: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300',
            isFeatured: true
        },
        {
            _id: '5',
            name: 'Running Sports Shoes',
            brand: 'SpeedRun',
            price: 2499,
            originalPrice: 3999,
            discount: 38,
            rating: 4.6,
            numReviews: 178,
            thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
            isFeatured: true
        },
        {
            _id: '6',
            name: 'Designer Sunglasses',
            brand: 'VisionStyle',
            price: 899,
            originalPrice: 1499,
            discount: 40,
            rating: 4.2,
            numReviews: 67,
            thumbnail: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300',
            isFeatured: false
        },
        {
            _id: '7',
            name: 'Casual Hoodie',
            brand: 'ComfortWear',
            price: 999,
            originalPrice: 1599,
            discount: 37,
            rating: 4.5,
            numReviews: 92,
            thumbnail: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300',
            isFeatured: true
        },
        {
            _id: '8',
            name: 'Leather Wallet',
            brand: 'LeatherCraft',
            price: 699,
            originalPrice: 999,
            discount: 30,
            rating: 4.4,
            numReviews: 143,
            thumbnail: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=300',
            isFeatured: false
        }
    ];

    container.innerHTML = sampleProducts.slice(0, count).map(product => createProductCard(product)).join('');
}

// Initialize home page
document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedProducts();
    loadNewArrivals();
});

