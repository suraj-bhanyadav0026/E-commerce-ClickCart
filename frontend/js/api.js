// ========================================
// CLICKCART - API SERVICE
// ========================================

const API = {
    // Get auth token from storage
    getToken() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    },

    // Set auth headers
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (includeAuth) {
            const token = this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        
        return headers;
    },

    // Generic fetch wrapper
    async request(endpoint, options = {}) {
        const url = `${CONFIG.API_URL}${endpoint}`;
        const defaultOptions = {
            headers: this.getHeaders(options.auth !== false)
        };

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // GET request
    async get(endpoint, auth = true) {
        return this.request(endpoint, { method: 'GET', auth });
    },

    // POST request
    async post(endpoint, body, auth = true) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
            auth
        });
    },

    // PUT request
    async put(endpoint, body, auth = true) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
            auth
        });
    },

    // DELETE request
    async delete(endpoint, auth = true) {
        return this.request(endpoint, { method: 'DELETE', auth });
    },

    // ========== AUTH ENDPOINTS ==========
    auth: {
        async login(email, password) {
            return API.post('/auth/login', { email, password }, false);
        },

        async register(name, email, password) {
            return API.post('/auth/register', { name, email, password }, false);
        },

        async getProfile() {
            return API.get('/auth/me');
        },

        async forgotPassword(email) {
            return API.post('/auth/forgot-password', { email }, false);
        }
    },

    // ========== PRODUCTS ENDPOINTS ==========
    products: {
        async getAll(params = {}) {
            const query = new URLSearchParams(params).toString();
            return API.get(`/products?${query}`, false);
        },

        async getById(id) {
            return API.get(`/products/${id}`, false);
        },

        async getFeatured() {
            return API.get('/products/featured', false);
        },

        async getCategories() {
            return API.get('/products/categories', false);
        },

        async getBrands() {
            return API.get('/products/brands', false);
        },

        async getRelated(id) {
            return API.get(`/products/${id}/related`, false);
        }
    },

    // ========== CART ENDPOINTS ==========
    cart: {
        async get() {
            return API.get('/cart');
        },

        async add(productId, quantity = 1, size, color) {
            return API.post('/cart/add', { productId, quantity, size, color });
        },

        async update(itemId, quantity) {
            return API.put(`/cart/update/${itemId}`, { quantity });
        },

        async remove(itemId) {
            return API.delete(`/cart/remove/${itemId}`);
        },

        async clear() {
            return API.delete('/cart/clear');
        }
    },

    // ========== ORDERS ENDPOINTS ==========
    orders: {
        async create(orderData) {
            return API.post('/orders', orderData);
        },

        async getAll() {
            return API.get('/orders');
        },

        async getById(id) {
            return API.get(`/orders/${id}`);
        },

        async track(trackingNumber) {
            return API.get(`/orders/track/${trackingNumber}`, false);
        },

        async cancel(id, reason) {
            return API.post(`/orders/${id}/cancel`, { reason });
        },

        async validateCoupon(code, cartTotal) {
            return API.post('/orders/validate-coupon', { code, cartTotal });
        }
    },

    // ========== WISHLIST ENDPOINTS ==========
    wishlist: {
        async get() {
            return API.get('/wishlist');
        },

        async add(productId) {
            return API.post(`/wishlist/${productId}`, {});
        },

        async remove(productId) {
            return API.delete(`/wishlist/${productId}`);
        }
    },

    // ========== REVIEWS ENDPOINTS ==========
    reviews: {
        async getByProduct(productId, page = 1) {
            return API.get(`/reviews/${productId}?page=${page}`, false);
        },

        async create(productId, data) {
            return API.post(`/reviews/${productId}`, data);
        },

        async update(reviewId, data) {
            return API.put(`/reviews/${reviewId}`, data);
        },

        async delete(reviewId) {
            return API.delete(`/reviews/${reviewId}`);
        }
    },

    // ========== USER ENDPOINTS ==========
    users: {
        async updateProfile(data) {
            return API.put('/users/profile', data);
        },

        async getAddresses() {
            return API.get('/users/addresses');
        },

        async addAddress(address) {
            return API.post('/users/address', address);
        },

        async updateAddress(id, address) {
            return API.put(`/users/address/${id}`, address);
        },

        async deleteAddress(id) {
            return API.delete(`/users/address/${id}`);
        }
    },

    // ========== PAYMENT ENDPOINTS ==========
    payment: {
        async createOrder(amount, orderId) {
            return API.post('/payment/create-order', { amount, orderId });
        },

        async verify(data) {
            return API.post('/payment/verify', data);
        },

        async getKey() {
            return API.get('/payment/key', false);
        }
    }
};

