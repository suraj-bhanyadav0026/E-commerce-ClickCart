// ========================================
// CLICKCART - ADMIN DASHBOARD
// ========================================

// Check admin access
document.addEventListener('DOMContentLoaded', () => {
    if (!Auth.isLoggedIn()) {
        window.location.href = '../index.html';
        return;
    }

    const user = Auth.getUser();
    if (user.role !== 'admin') {
        showToast('Access denied. Admin only.', 'error');
        window.location.href = '../index.html';
        return;
    }

    document.getElementById('adminName').textContent = user.name;
    loadDashboard();
    initMobileMenu();
});

// Load dashboard data
async function loadDashboard() {
    try {
        const data = await API.get('/admin/dashboard');
        renderStats(data.stats);
        renderRecentOrders(data.recentOrders);
        renderOrderStatus(data.ordersByStatus);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        // Show demo data
        renderDemoData();
    }
}

// Render stats
function renderStats(stats) {
    document.getElementById('totalRevenue').textContent = formatPrice(stats.totalRevenue);
    document.getElementById('totalOrders').textContent = stats.totalOrders;
    document.getElementById('totalProducts').textContent = stats.totalProducts;
    document.getElementById('totalUsers').textContent = stats.totalUsers;
}

// Render recent orders
function renderRecentOrders(orders) {
    const tbody = document.getElementById('recentOrders');

    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">No orders yet</td></tr>';
        return;
    }

    tbody.innerHTML = orders.slice(0, 5).map(order => `
        <tr>
            <td><strong>${order.trackingNumber}</strong></td>
            <td>${order.user?.name || 'Guest'}</td>
            <td>${formatPrice(order.totalPrice)}</td>
            <td><span class="status-badge ${order.orderStatus.toLowerCase()}">${order.orderStatus}</span></td>
            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

// Render order status
function renderOrderStatus(statusData) {
    const container = document.getElementById('orderStatusList');
    const statusMap = {
        'Pending': 'pending',
        'Confirmed': 'confirmed',
        'Shipped': 'shipped',
        'Delivered': 'delivered',
        'Cancelled': 'cancelled'
    };

    if (!statusData) return;

    container.innerHTML = Object.entries(statusMap).map(([status, className]) => {
        const data = statusData.find(s => s._id === status) || { count: 0 };
        return `
            <div class="status-item">
                <span class="status-dot ${className}"></span>
                <span>${status}</span>
                <span class="status-count">${data.count}</span>
            </div>
        `;
    }).join('');
}

// Demo data for offline/development
function renderDemoData() {
    document.getElementById('totalRevenue').textContent = '₹1,25,000';
    document.getElementById('totalOrders').textContent = '156';
    document.getElementById('totalProducts').textContent = '48';
    document.getElementById('totalUsers').textContent = '234';

    const demoOrders = [
        { trackingNumber: 'CC123ABC', user: { name: 'Rahul Kumar' }, totalPrice: 2499, orderStatus: 'Delivered', createdAt: new Date() },
        { trackingNumber: 'CC456DEF', user: { name: 'Priya Sharma' }, totalPrice: 1599, orderStatus: 'Shipped', createdAt: new Date() },
        { trackingNumber: 'CC789GHI', user: { name: 'Amit Singh' }, totalPrice: 3999, orderStatus: 'Confirmed', createdAt: new Date() },
        { trackingNumber: 'CC012JKL', user: { name: 'Sneha Patel' }, totalPrice: 899, orderStatus: 'Pending', createdAt: new Date() },
        { trackingNumber: 'CC345MNO', user: { name: 'Vikram Das' }, totalPrice: 4599, orderStatus: 'Delivered', createdAt: new Date() }
    ];

    renderRecentOrders(demoOrders);

    document.getElementById('orderStatusList').innerHTML = `
        <div class="status-item"><span class="status-dot pending"></span><span>Pending</span><span class="status-count">12</span></div>
        <div class="status-item"><span class="status-dot confirmed"></span><span>Confirmed</span><span class="status-count">8</span></div>
        <div class="status-item"><span class="status-dot shipped"></span><span>Shipped</span><span class="status-count">24</span></div>
        <div class="status-item"><span class="status-dot delivered"></span><span>Delivered</span><span class="status-count">98</span></div>
        <div class="status-item"><span class="status-dot cancelled"></span><span>Cancelled</span><span class="status-count">14</span></div>
    `;
}

// Mobile menu
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('show');
        });
    }
}

