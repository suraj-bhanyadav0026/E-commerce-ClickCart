// ========================================
// CLICKCART - ORDERS PAGE
// ========================================

// Sample orders for demo
const sampleOrders = [
    {
        _id: '1',
        trackingNumber: 'CC123ABC456',
        orderStatus: 'Delivered',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        deliveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        totalPrice: 2499,
        orderItems: [
            { name: 'Premium Cotton T-Shirt', price: 599, quantity: 2, size: 'L', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100' },
            { name: 'Classic Denim Jeans', price: 1299, quantity: 1, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=100' }
        ],
        statusHistory: [
            { status: 'Pending', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
            { status: 'Confirmed', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
            { status: 'Shipped', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
            { status: 'Delivered', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
        ]
    },
    {
        _id: '2',
        trackingNumber: 'CC789DEF012',
        orderStatus: 'Shipped',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        expectedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        totalPrice: 3999,
        orderItems: [
            { name: 'Wireless Bluetooth Earbuds', price: 1499, quantity: 1, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100' },
            { name: 'Running Sports Shoes', price: 2499, quantity: 1, size: 'UK 9', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100' }
        ],
        statusHistory: [
            { status: 'Pending', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
            { status: 'Confirmed', date: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000) },
            { status: 'Shipped', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
        ]
    },
    {
        _id: '3',
        trackingNumber: 'CC345GHI678',
        orderStatus: 'Pending',
        createdAt: new Date(),
        totalPrice: 899,
        orderItems: [
            { name: 'Designer Sunglasses', price: 899, quantity: 1, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100' }
        ],
        statusHistory: [
            { status: 'Pending', date: new Date() }
        ]
    }
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (!Auth.isLoggedIn()) {
        document.getElementById('ordersList').classList.add('hidden');
        document.getElementById('emptyOrders').classList.remove('hidden');
        return;
    }

    loadOrders();
});

// Load orders
async function loadOrders() {
    try {
        const orders = await API.orders.getAll();
        renderOrders(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
        // Use sample data
        renderOrders(sampleOrders);
    }
}

// Render orders
function renderOrders(orders) {
    const container = document.getElementById('ordersList');
    const emptyState = document.getElementById('emptyOrders');

    if (!orders || orders.length === 0) {
        container.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    container.classList.remove('hidden');
    emptyState.classList.add('hidden');

    container.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <span class="order-id">Order #${order.trackingNumber}</span>
                    <span class="order-date">Placed on ${formatDate(order.createdAt)}</span>
                </div>
                <span class="order-status ${order.orderStatus.toLowerCase()}">${order.orderStatus}</span>
            </div>
            
            <div class="order-items">
                ${order.orderItems.map(item => `
                    <div class="order-item">
                        <div class="order-item-image">
                            <img src="${item.image || 'https://via.placeholder.com/80'}" alt="${item.name}">
                        </div>
                        <div class="order-item-info">
                            <div class="order-item-name">${item.name}</div>
                            <div class="order-item-meta">
                                Qty: ${item.quantity}
                                ${item.size ? ` | Size: ${item.size}` : ''}
                            </div>
                        </div>
                        <div class="order-item-price">${formatPrice(item.price)}</div>
                    </div>
                `).join('')}
            </div>

            ${renderTrackingTimeline(order)}

            <div class="order-footer">
                <span class="order-total">Total: ${formatPrice(order.totalPrice)}</span>
                <div class="order-actions">
                    ${order.orderStatus === 'Pending' ? 
                        `<button class="btn btn-outline btn-sm" onclick="cancelOrder('${order._id}')">Cancel Order</button>` : ''}
                    <button class="btn btn-secondary btn-sm" onclick="viewOrderDetails('${order._id}')">View Details</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Render tracking timeline
function renderTrackingTimeline(order) {
    const steps = [
        { status: 'Pending', icon: 'fa-clock', label: 'Order Placed' },
        { status: 'Confirmed', icon: 'fa-check', label: 'Confirmed' },
        { status: 'Shipped', icon: 'fa-truck', label: 'Shipped' },
        { status: 'Delivered', icon: 'fa-box', label: 'Delivered' }
    ];

    const statusOrder = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
    const currentIndex = statusOrder.indexOf(order.orderStatus);

    if (order.orderStatus === 'Cancelled') {
        return `
            <div class="tracking-section">
                <div class="tracking-title"><i class="fas fa-times-circle"></i> Order Cancelled</div>
            </div>
        `;
    }

    return `
        <div class="tracking-section">
            <div class="tracking-title">
                <i class="fas fa-shipping-fast"></i> 
                ${order.orderStatus === 'Delivered' ? 'Delivered on ' + formatDate(order.deliveredAt) : 
                  order.expectedDelivery ? 'Expected by ' + formatDate(order.expectedDelivery) : 'Tracking'}
            </div>
            <div class="tracking-timeline">
                ${steps.map((step, i) => {
                    const stepIndex = statusOrder.indexOf(step.status);
                    let className = '';
                    if (stepIndex < currentIndex || (stepIndex === currentIndex && step.status === order.orderStatus)) {
                        className = stepIndex === currentIndex ? 'current' : 'completed';
                    }
                    return `
                        <div class="tracking-step ${className}">
                            <div class="tracking-icon"><i class="fas ${step.icon}"></i></div>
                            <span class="tracking-label">${step.label}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Track order
async function trackOrder() {
    const input = document.getElementById('trackingInput').value.trim();
    if (!input) {
        showToast('Please enter a tracking number', 'warning');
        return;
    }

    try {
        const order = await API.orders.track(input);
        // Scroll to order or show in modal
        showToast(`Order Status: ${order.orderStatus}`, 'info');
    } catch (error) {
        showToast('Order not found', 'error');
    }
}

// Cancel order
async function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
        await API.orders.cancel(orderId, 'Cancelled by user');
        showToast('Order cancelled successfully', 'success');
        loadOrders();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// View order details
function viewOrderDetails(orderId) {
    window.location.href = `order-details.html?id=${orderId}`;
}

