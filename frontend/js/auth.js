// ========================================
// CLICKCART - AUTHENTICATION
// ========================================

const Auth = {
    // Check if user is logged in
    isLoggedIn() {
        return !!this.getToken();
    },

    // Get token
    getToken() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    },

    // Get current user
    getUser() {
        const user = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
        return user ? JSON.parse(user) : null;
    },

    // Save auth data
    saveAuth(data) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, data.token);
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify({
            _id: data._id,
            name: data.name,
            email: data.email,
            role: data.role,
            avatar: data.avatar
        }));
    },

    // Clear auth data
    clearAuth() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
    },

    // Login
    async login(email, password) {
        try {
            const data = await API.auth.login(email, password);
            this.saveAuth(data);
            this.updateUI();
            showToast('Welcome back!', 'success');
            return data;
        } catch (error) {
            showToast(error.message, 'error');
            throw error;
        }
    },

    // Register
    async register(name, email, password) {
        try {
            const data = await API.auth.register(name, email, password);
            this.saveAuth(data);
            this.updateUI();
            showToast('Account created successfully!', 'success');
            return data;
        } catch (error) {
            showToast(error.message, 'error');
            throw error;
        }
    },

    // Logout
    logout() {
        this.clearAuth();
        Cart.clearLocal();
        this.updateUI();
        showToast('Logged out successfully', 'success');
        
        // Redirect if on protected page
        const protectedPages = ['profile.html', 'orders.html', 'checkout.html'];
        const currentPage = window.location.pathname.split('/').pop();
        if (protectedPages.includes(currentPage)) {
            window.location.href = 'index.html';
        }
    },

    // Update UI based on auth state
    updateUI() {
        const userDropdown = document.getElementById('userDropdown');
        if (!userDropdown) return;

        if (this.isLoggedIn()) {
            const user = this.getUser();
            userDropdown.innerHTML = `
                <div style="padding: var(--space-md); border-bottom: 1px solid var(--gray-700);">
                    <strong>${user.name}</strong>
                    <small style="display: block; color: var(--gray-500);">${user.email}</small>
                </div>
                <a href="profile.html"><i class="fas fa-user"></i> My Profile</a>
                <a href="orders.html"><i class="fas fa-box"></i> My Orders</a>
                <a href="wishlist.html"><i class="fas fa-heart"></i> Wishlist</a>
                ${user.role === 'admin' ? '<a href="admin/index.html"><i class="fas fa-cog"></i> Admin Panel</a>' : ''}
                <button onclick="Auth.logout()"><i class="fas fa-sign-out-alt"></i> Logout</button>
            `;
        } else {
            userDropdown.innerHTML = `
                <button onclick="openLoginModal()"><i class="fas fa-sign-in-alt"></i> Login</button>
                <button onclick="openLoginModal('register')"><i class="fas fa-user-plus"></i> Register</button>
            `;
        }
    },

    // Check auth on protected pages
    requireAuth() {
        if (!this.isLoggedIn()) {
            showToast('Please login to continue', 'warning');
            openLoginModal();
            return false;
        }
        return true;
    },

    // Check if user is admin
    isAdmin() {
        const user = this.getUser();
        return user && user.role === 'admin';
    }
};

// Login Modal Functions
function openLoginModal(tab = 'login') {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('show');
        switchAuthTab(tab);
    }
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function switchAuthTab(tab) {
    const tabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    tabs.forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tab);
    });

    if (loginForm && registerForm) {
        loginForm.classList.toggle('hidden', tab !== 'login');
        registerForm.classList.toggle('hidden', tab !== 'register');
    }
}

// Initialize auth UI on page load
document.addEventListener('DOMContentLoaded', () => {
    Auth.updateUI();

    // Auth tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => switchAuthTab(tab.dataset.tab));
    });

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            try {
                await Auth.login(formData.get('email'), formData.get('password'));
                closeLoginModal();
                loginForm.reset();
            } catch (error) {
                // Error handled in Auth.login
            }
        });
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            
            if (formData.get('password') !== formData.get('confirmPassword')) {
                showToast('Passwords do not match', 'error');
                return;
            }

            try {
                await Auth.register(
                    formData.get('name'),
                    formData.get('email'),
                    formData.get('password')
                );
                closeLoginModal();
                registerForm.reset();
            } catch (error) {
                // Error handled in Auth.register
            }
        });
    }

    // Modal close button
    const closeBtn = document.getElementById('closeLoginModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeLoginModal);
    }

    // Close modal on overlay click
    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeLoginModal);
    }
});

