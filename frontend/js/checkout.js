// ========================================
// CLICKCART - CHECKOUT PAGE
// ========================================

let cartData = { items: [], totalAmount: 0 };
let shippingAddress = null;
let paymentMethod = 'Razorpay';
let currentStep = 1;
let appliedDiscount = 0;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Check auth
    if (!Auth.isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    // Load cart
    try {
        cartData = await Cart.get();
        if (!cartData.items || cartData.items.length === 0) {
            showToast('Your cart is empty', 'warning');
            window.location.href = 'cart-page.html';
            return;
        }
    } catch (error) {
        cartData = Cart.getLocal();
    }

    // Load saved discount
    const savedDiscount = sessionStorage.getItem('appliedDiscount');
    if (savedDiscount) {
        appliedDiscount = parseFloat(savedDiscount);
    }

    renderOrderSummary();
    loadSavedAddresses();
    setupAddressForm();
});

// Render order summary
function renderOrderSummary() {
    const itemsContainer = document.getElementById('summaryItems');
    
    itemsContainer.innerHTML = cartData.items.map(item => {
        const product = item.product || item;
        return `
            <div class="summary-item">
                <img src="${product.thumbnail || 'https://via.placeholder.com/50'}" alt="${product.name}">
                <div class="summary-item-info">
                    <div class="summary-item-name">${product.name}</div>
                    <div class="summary-item-qty">Qty: ${item.quantity}</div>
                </div>
            </div>
        `;
    }).join('');

    updateTotals();
}

// Update totals
function updateTotals() {
    const totals = Cart.calculateTotals(cartData.items);

    document.getElementById('subtotal').textContent = formatPrice(totals.subtotal);
    document.getElementById('shipping').textContent = totals.shipping === 0 ? 'FREE' : formatPrice(totals.shipping);
    document.getElementById('tax').textContent = formatPrice(totals.tax);

    if (appliedDiscount > 0) {
        document.getElementById('discountRow').style.display = 'flex';
        document.getElementById('discount').textContent = `-${formatPrice(appliedDiscount)}`;
    }

    const finalTotal = totals.total - appliedDiscount;
    document.getElementById('total').textContent = formatPrice(finalTotal);
}

// Load saved addresses
async function loadSavedAddresses() {
    try {
        const addresses = await API.users.getAddresses();
        
        if (addresses.length > 0) {
            const container = document.getElementById('savedAddresses');
            container.innerHTML = addresses.map((addr, i) => `
                <div class="saved-address ${addr.isDefault ? 'selected' : ''}" 
                     onclick="selectAddress(${i}, this)" data-index="${i}">
                    <h4>${addr.fullName}</h4>
                    <p>${addr.addressLine1}, ${addr.addressLine2 || ''}<br>
                    ${addr.city}, ${addr.state} - ${addr.pincode}<br>
                    Phone: ${addr.phone}</p>
                </div>
            `).join('');

            // Set default address
            const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
            shippingAddress = defaultAddr;
        }
    } catch (error) {
        console.log('No saved addresses');
    }
}

// Select saved address
function selectAddress(index, element) {
    document.querySelectorAll('.saved-address').forEach(a => a.classList.remove('selected'));
    element.classList.add('selected');
    // Address will be fetched from API when needed
}

// Setup address form
function setupAddressForm() {
    const form = document.getElementById('addressForm');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        shippingAddress = {
            fullName: formData.get('fullName'),
            phone: formData.get('phone'),
            addressLine1: formData.get('addressLine1'),
            addressLine2: formData.get('addressLine2'),
            city: formData.get('city'),
            state: formData.get('state'),
            pincode: formData.get('pincode')
        };

        // Validate
        if (!shippingAddress.fullName || !shippingAddress.phone || 
            !shippingAddress.addressLine1 || !shippingAddress.city || 
            !shippingAddress.state || !shippingAddress.pincode) {
            showToast('Please fill all required fields', 'warning');
            return;
        }

        goToStep(2);
    });
}

// Go to step
function goToStep(step) {
    currentStep = step;

    // Update steps UI
    document.querySelectorAll('.step').forEach((s, i) => {
        s.classList.remove('active', 'completed');
        if (i + 1 < step) s.classList.add('completed');
        if (i + 1 === step) s.classList.add('active');
    });

    // Show/hide sections
    document.getElementById('addressSection').classList.toggle('hidden', step !== 1);
    document.getElementById('paymentSection').classList.toggle('hidden', step !== 2);
    document.getElementById('reviewSection').classList.toggle('hidden', step !== 3);

    // Update review section
    if (step === 3) {
        updateReviewSection();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update review section
function updateReviewSection() {
    // Address
    document.getElementById('reviewAddress').innerHTML = `
        <strong>${shippingAddress.fullName}</strong><br>
        ${shippingAddress.addressLine1}, ${shippingAddress.addressLine2 || ''}<br>
        ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}<br>
        Phone: ${shippingAddress.phone}
    `;

    // Payment method
    paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    document.getElementById('reviewPayment').textContent = 
        paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment (Razorpay)';

    // Items
    document.getElementById('reviewItems').innerHTML = cartData.items.map(item => {
        const product = item.product || item;
        return `
            <div class="review-item">
                <img src="${product.thumbnail || 'https://via.placeholder.com/60'}" alt="${product.name}">
                <div class="review-item-info">
                    <div class="review-item-name">${product.name}</div>
                    <div class="review-item-meta">
                        Qty: ${item.quantity}
                        ${item.size ? ` | Size: ${item.size}` : ''}
                        ${item.color ? ` | Color: ${item.color}` : ''}
                    </div>
                </div>
                <div class="review-item-price">${formatPrice(item.price * item.quantity)}</div>
            </div>
        `;
    }).join('');
}

// Place order
async function placeOrder() {
    const btn = document.getElementById('placeOrderBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    try {
        const couponCode = sessionStorage.getItem('appliedCoupon') || null;

        const orderData = {
            shippingAddress,
            paymentMethod,
            couponCode
        };

        const order = await API.orders.create(orderData);

        if (paymentMethod === 'Razorpay') {
            // Initiate Razorpay payment
            await initiateRazorpay(order);
        } else {
            // COD - Show success
            showOrderSuccess(order);
        }
    } catch (error) {
        showToast(error.message || 'Failed to place order', 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-lock"></i> Place Order';
    }
}

// Initiate Razorpay
async function initiateRazorpay(order) {
    try {
        const { id: razorpayOrderId, amount } = await API.payment.createOrder(order.totalPrice, order._id);
        
        const options = {
            key: CONFIG.RAZORPAY_KEY,
            amount: amount,
            currency: 'INR',
            name: 'ClickCart',
            description: `Order #${order.trackingNumber}`,
            order_id: razorpayOrderId,
            handler: async function(response) {
                try {
                    await API.payment.verify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        orderId: order._id
                    });
                    showOrderSuccess(order);
                } catch (error) {
                    showToast('Payment verification failed', 'error');
                }
            },
            prefill: {
                name: shippingAddress.fullName,
                contact: shippingAddress.phone
            },
            theme: {
                color: '#6366f1'
            }
        };

        const rzp = new Razorpay(options);
        rzp.open();
    } catch (error) {
        showToast('Payment initialization failed', 'error');
        const btn = document.getElementById('placeOrderBtn');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-lock"></i> Place Order';
    }
}

// Show order success
function showOrderSuccess(order) {
    // Clear session storage
    sessionStorage.removeItem('appliedCoupon');
    sessionStorage.removeItem('appliedDiscount');
    
    // Clear cart
    Cart.clearLocal();
    Cart.updateBadge(0);

    // Show modal
    document.getElementById('orderId').textContent = order.trackingNumber;
    document.getElementById('successModal').classList.add('show');
}

