// ========================================
// CLICKCART - CART MANAGEMENT
// ========================================

const Cart = {
    // Get cart from local storage (for guests)
    getLocal() {
        const cart = localStorage.getItem(CONFIG.STORAGE_KEYS.CART);
        return cart ? JSON.parse(cart) : { items: [], totalAmount: 0 };
    },

    // Save cart to local storage
    saveLocal(cart) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.CART, JSON.stringify(cart));
        this.updateBadge();
    },

    // Clear local cart
    clearLocal() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.CART);
        this.updateBadge();
    },

    // Get cart (from API if logged in, otherwise local)
    async get() {
        if (Auth.isLoggedIn()) {
            try {
                const cart = await API.cart.get();
                this.updateBadge(cart.items?.length || 0);
                return cart;
            } catch (error) {
                console.error('Error fetching cart:', error);
                return this.getLocal();
            }
        }
        return this.getLocal();
    },

    // Add item to cart
    async add(productId, quantity = 1, size = null, color = null, product = null) {
        if (Auth.isLoggedIn()) {
            try {
                const cart = await API.cart.add(productId, quantity, size, color);
                this.updateBadge(cart.items?.length || 0);
                showToast('Added to cart!', 'success');
                return cart;
            } catch (error) {
                showToast(error.message, 'error');
                throw error;
            }
        } else {
            // Guest cart - store locally
            const cart = this.getLocal();
            const existingIndex = cart.items.findIndex(
                item => item.productId === productId && item.size === size && item.color === color
            );

            if (existingIndex > -1) {
                cart.items[existingIndex].quantity += quantity;
            } else {
                cart.items.push({
                    _id: Date.now().toString(),
                    productId,
                    quantity,
                    size,
                    color,
                    price: product?.price || 0,
                    product: product || { _id: productId }
                });
            }

            cart.totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            this.saveLocal(cart);
            showToast('Added to cart!', 'success');
            return cart;
        }
    },

    // Update item quantity
    async update(itemId, quantity) {
        if (Auth.isLoggedIn()) {
            try {
                const cart = await API.cart.update(itemId, quantity);
                this.updateBadge(cart.items?.length || 0);
                return cart;
            } catch (error) {
                showToast(error.message, 'error');
                throw error;
            }
        } else {
            const cart = this.getLocal();
            const item = cart.items.find(i => i._id === itemId);
            if (item) {
                item.quantity = quantity;
                cart.totalAmount = cart.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
                this.saveLocal(cart);
            }
            return cart;
        }
    },

    // Remove item from cart
    async remove(itemId) {
        if (Auth.isLoggedIn()) {
            try {
                const cart = await API.cart.remove(itemId);
                this.updateBadge(cart.items?.length || 0);
                showToast('Item removed from cart', 'success');
                return cart;
            } catch (error) {
                showToast(error.message, 'error');
                throw error;
            }
        } else {
            const cart = this.getLocal();
            cart.items = cart.items.filter(i => i._id !== itemId);
            cart.totalAmount = cart.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
            this.saveLocal(cart);
            showToast('Item removed from cart', 'success');
            return cart;
        }
    },

    // Clear cart
    async clear() {
        if (Auth.isLoggedIn()) {
            try {
                await API.cart.clear();
                this.updateBadge(0);
                return { items: [], totalAmount: 0 };
            } catch (error) {
                showToast(error.message, 'error');
                throw error;
            }
        } else {
            this.clearLocal();
            return { items: [], totalAmount: 0 };
        }
    },

    // Update cart badge
    updateBadge(count = null) {
        const badge = document.getElementById('cartCount');
        if (badge) {
            if (count !== null) {
                badge.textContent = count;
            } else {
                const cart = this.getLocal();
                badge.textContent = cart.items?.length || 0;
            }
        }
    },

    // Get cart count
    getCount() {
        const cart = this.getLocal();
        return cart.items?.length || 0;
    },

    // Calculate totals
    calculateTotals(items) {
        const subtotal = items.reduce((sum, item) => {
            const price = item.product?.price || item.price || 0;
            return sum + (price * item.quantity);
        }, 0);

        const shipping = subtotal >= CONFIG.FREE_SHIPPING_MIN ? 0 : CONFIG.SHIPPING_COST;
        const tax = Math.round(subtotal * CONFIG.TAX_RATE);
        const total = subtotal + shipping + tax;

        return { subtotal, shipping, tax, total };
    }
};

// Wishlist Management
const Wishlist = {
    getLocal() {
        const wishlist = localStorage.getItem(CONFIG.STORAGE_KEYS.WISHLIST);
        return wishlist ? JSON.parse(wishlist) : [];
    },

    saveLocal(wishlist) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
        this.updateBadge();
    },

    async get() {
        if (Auth.isLoggedIn()) {
            try {
                const wishlist = await API.wishlist.get();
                this.updateBadge(wishlist.length);
                return wishlist;
            } catch (error) {
                return this.getLocal();
            }
        }
        return this.getLocal();
    },

    async toggle(productId, product = null) {
        if (Auth.isLoggedIn()) {
            try {
                const wishlist = await this.get();
                const exists = wishlist.some(item => item._id === productId);
                
                if (exists) {
                    const newWishlist = await API.wishlist.remove(productId);
                    this.updateBadge(newWishlist.length);
                    showToast('Removed from wishlist', 'success');
                    return { added: false, wishlist: newWishlist };
                } else {
                    const newWishlist = await API.wishlist.add(productId);
                    this.updateBadge(newWishlist.length);
                    showToast('Added to wishlist!', 'success');
                    return { added: true, wishlist: newWishlist };
                }
            } catch (error) {
                showToast(error.message, 'error');
                throw error;
            }
        } else {
            // Guest wishlist
            let wishlist = this.getLocal();
            const index = wishlist.findIndex(item => item._id === productId);
            
            if (index > -1) {
                wishlist.splice(index, 1);
                this.saveLocal(wishlist);
                showToast('Removed from wishlist', 'success');
                return { added: false, wishlist };
            } else {
                wishlist.push(product || { _id: productId });
                this.saveLocal(wishlist);
                showToast('Added to wishlist!', 'success');
                return { added: true, wishlist };
            }
        }
    },

    isInWishlist(productId) {
        const wishlist = this.getLocal();
        return wishlist.some(item => item._id === productId);
    },

    updateBadge(count = null) {
        const badge = document.getElementById('wishlistCount');
        if (badge) {
            if (count !== null) {
                badge.textContent = count;
            } else {
                badge.textContent = this.getLocal().length;
            }
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    Cart.updateBadge();
    Wishlist.updateBadge();
});

