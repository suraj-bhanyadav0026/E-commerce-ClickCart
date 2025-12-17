// ========================================
// CLICKCART - CONFIGURATION
// ========================================

const CONFIG = {
    // API Base URL - Change this when deploying
    API_URL: 'http://localhost:5001/api',
    
    // Razorpay Key (Get from razorpay.com)
    RAZORPAY_KEY: 'rzp_test_xxxxxxxxxxxxx',
    
    // App Settings
    APP_NAME: 'ClickCart',
    CURRENCY: '₹',
    CURRENCY_CODE: 'INR',
    
    // Pagination
    PRODUCTS_PER_PAGE: 12,
    
    // Free shipping threshold
    FREE_SHIPPING_MIN: 500,
    SHIPPING_COST: 50,
    
    // Tax rate (GST)
    TAX_RATE: 0.18,
    
    // Local Storage Keys
    STORAGE_KEYS: {
        TOKEN: 'clickcart_token',
        USER: 'clickcart_user',
        CART: 'clickcart_cart',
        WISHLIST: 'clickcart_wishlist'
    }
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.STORAGE_KEYS);

