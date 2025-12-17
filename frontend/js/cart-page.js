// ========================================
// CLICKCART - CART PAGE
// ========================================

let cartData = { items: [], totalAmount: 0 };
let appliedDiscount = 0;

// Initialize cart page
document.addEventListener('DOMContentLoaded', () => {
    loadCartItems();
});

// Load cart items
async function loadCartItems() {
    try {
        cartData = await Cart.get();
        renderCart();
    } catch (error) {
        console.error('Error loading cart:', error);
        // Load from local storage
        cartData = Cart.getLocal();
        renderCart();
    }
}

// Render cart
function renderCart() {
    const container = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const cartLayout = document.getElementById('cartLayout');

    if (!cartData.items || cartData.items.length === 0) {
        cartLayout.classList.add('hidden');
        emptyCart.classList.remove('hidden');
        return;
    }

    cartLayout.classList.remove('hidden');
    emptyCart.classList.add('hidden');

    container.innerHTML = cartData.items.map(item => {
        const product = item.product || item;
        return `
            <div class="cart-item" data-id="${item._id}">
                <div class="cart-item-image">
                    <a href="product.html?id=${product._id}">
                        <img src="${product.thumbnail || 'https://via.placeholder.com/120'}" alt="${product.name}">
                    </a>
                </div>
                <div class="cart-item-info">
                    <h3><a href="product.html?id=${product._id}">${product.name || 'Product'}</a></h3>
                    <div class="cart-item-brand">${product.brand || ''}</div>
                    <div class="cart-item-meta">
                        ${item.size ? `<span>Size: ${item.size}</span>` : ''}
                        ${item.color ? `<span>Color: ${item.color}</span>` : ''}
                    </div>
                    <div class="cart-item-price">${formatPrice(item.price || product.price)}</div>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button onclick="updateQuantity('${item._id}', ${item.quantity - 1})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity('${item._id}', ${item.quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="remove-btn" onclick="removeItem('${item._id}')">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `;
    }).join('');

    updateSummary();
}

// Update quantity
async function updateQuantity(itemId, quantity) {
    if (quantity < 1) {
        removeItem(itemId);
        return;
    }

    try {
        cartData = await Cart.update(itemId, quantity);
        renderCart();
    } catch (error) {
        console.error('Error updating quantity:', error);
    }
}

// Remove item
async function removeItem(itemId) {
    try {
        cartData = await Cart.remove(itemId);
        renderCart();
    } catch (error) {
        console.error('Error removing item:', error);
    }
}

// Update summary
function updateSummary() {
    const totals = Cart.calculateTotals(cartData.items);

    document.getElementById('subtotal').textContent = formatPrice(totals.subtotal);
    document.getElementById('shipping').textContent = totals.shipping === 0 ? 'FREE' : formatPrice(totals.shipping);
    document.getElementById('tax').textContent = formatPrice(totals.tax);

    const finalTotal = totals.total - appliedDiscount;
    document.getElementById('total').textContent = formatPrice(finalTotal);

    if (appliedDiscount > 0) {
        document.getElementById('discountRow').style.display = 'flex';
        document.getElementById('discount').textContent = `-${formatPrice(appliedDiscount)}`;
    }
}

// Apply coupon
async function applyCoupon() {
    const code = document.getElementById('couponInput').value.trim();
    const messageEl = document.getElementById('couponMessage');

    if (!code) {
        messageEl.textContent = 'Please enter a coupon code';
        messageEl.className = 'coupon-message error';
        return;
    }

    try {
        const totals = Cart.calculateTotals(cartData.items);
        const result = await API.orders.validateCoupon(code, totals.subtotal);
        
        appliedDiscount = result.discount;
        messageEl.textContent = result.message;
        messageEl.className = 'coupon-message success';
        updateSummary();
    } catch (error) {
        messageEl.textContent = error.message || 'Invalid coupon code';
        messageEl.className = 'coupon-message error';
        appliedDiscount = 0;
        updateSummary();
    }
}

// Proceed to checkout
function proceedToCheckout() {
    if (!Auth.requireAuth()) {
        return;
    }

    if (cartData.items.length === 0) {
        showToast('Your cart is empty', 'warning');
        return;
    }

    // Store discount info
    if (appliedDiscount > 0) {
        sessionStorage.setItem('appliedCoupon', document.getElementById('couponInput').value);
        sessionStorage.setItem('appliedDiscount', appliedDiscount);
    }

    window.location.href = 'checkout.html';
}

