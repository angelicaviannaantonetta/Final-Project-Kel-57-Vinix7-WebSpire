// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenu) {
        mobileMenu.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }

    // FAQ Accordion
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentNode;
            item.classList.toggle('active');
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            }
        });
    });

    // Navbar background on scroll
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if(window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = 'white';
            header.style.backdropFilter = 'none';
        }
    });

    // Load pricing packages
    loadPricingPackages();
});

// Order System Functions
class OrderSystem {
    constructor() {
        this.orders = JSON.parse(localStorage.getItem('orders')) || [];
        this.packages = JSON.parse(localStorage.getItem('packages')) || this.getDefaultPackages();
        this.bankAccounts = JSON.parse(localStorage.getItem('bankAccounts')) || this.getDefaultBankAccounts();
        this.adminCredentials = {
            username: 'admin',
            password: 'admin123'
        };
    }

    // Get default packages
    getDefaultPackages() {
        return [
            {
                id: 'standard',
                name: 'Standard',
                price: 850000,
                description: 'Cocok untuk bisnis kecil atau profil perusahaan',
                popular: false,
                features: [
                    '5 Halaman Website',
                    'Desain Responsif',
                    'Copywriting',
                    'Form Kontak',
                    'Desain Aset Pendukung Web',
                    'Optimasi Mobile',
                    'Optimasi SEO Dasar',
                    'Sistem Admin',
                    'Integrasi Media Sosial'
                ],
                included: [true, true, true, true, true, true, true, true, true]
            },
            {
                id: 'business',
                name: 'Business',
                price: 2000000,
                description: 'Ideal untuk UMKM yang ingin berkembang',
                popular: true,
                features: [
                    '10 Halaman Website',
                    'Desain Responsif',
                    'Copywriting',
                    'Form Kontak & Newsletter',
                    'Desain Aset Pendukung Web',
                    'Optimasi Mobile',
                    'Optimasi SEO Menengah',
                    'Sistem Admin',
                    'Integrasi Media Sosial'
                ],
                included: [true, true, true, true, true, true, true, true, true]
            },
            {
                id: 'premium',
                name: 'Premium',
                price: 2500000,
                description: 'Solusi lengkap untuk perusahaan besar',
                popular: false,
                features: [
                    '10 Halaman ke Atas',
                    'Desain Custom & Responsif',
                    'Copywriting',
                    'Sistem Kontak Lengkap',
                    'Desain Aset Pendukung Web',
                    'Optimasi Mobile',
                    'Optimasi SEO Advanced',
                    'Sistem Admin Advanced',
                    'Integrasi Media Sosial & Analytics'
                ],
                included: [true, true, true, true, true, true, true, true, true]
            }
        ];
    }

    // Get default bank accounts
    getDefaultBankAccounts() {
        return [
            {
                id: '1',
                bankName: 'BCA',
                accountNumber: '123456789012',
                accountHolder: 'PT. Vinix7 WebSpire Indonesia',
                bankLogo: null,
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                bankName: 'Mandiri',
                accountNumber: '987654321098',
                accountHolder: 'PT. Vinix7 WebSpire Indonesia',
                bankLogo: null,
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: '3',
                bankName: 'BNI',
                accountNumber: '567890123456',
                accountHolder: 'PT. Vinix7 WebSpire Indonesia',
                bankLogo: null,
                isActive: true,
                createdAt: new Date().toISOString()
            }
        ];
    }

    // Save orders to localStorage
    saveOrders() {
        localStorage.setItem('orders', JSON.stringify(this.orders));
    }

    // Save packages to localStorage
    savePackages() {
        localStorage.setItem('packages', JSON.stringify(this.packages));
    }

    // Save bank accounts to localStorage
    saveBankAccounts() {
        localStorage.setItem('bankAccounts', JSON.stringify(this.bankAccounts));
    }

    // Create new order
    createOrder(orderData) {
        const order = {
            id: Date.now().toString(),
            ...orderData,
            status: 'pending',
            createdAt: new Date().toISOString(),
            paymentProof: null
        };
        
        this.orders.push(order);
        this.saveOrders();
        return order;
    }

    // Get all orders
    getOrders() {
        return this.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Update order status
    updateOrderStatus(orderId, status) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            this.saveOrders();
            return true;
        }
        return false;
    }

    // Delete order
    deleteOrder(orderId) {
        const orderIndex = this.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            // Adjust customer stats if order was not cancelled
            const order = this.orders[orderIndex];
            if (order.status !== 'cancelled') {
                this.adjustCustomerStats(order.email, -1, -order.packagePrice);
            }
            
            this.orders.splice(orderIndex, 1);
            this.saveOrders();
            return true;
        }
        return false;
    }

    // Add payment proof
    addPaymentProof(orderId, fileData) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.paymentProof = fileData;
            order.status = 'paid';
            this.saveOrders();
            return true;
        }
        return false;
    }

    // Package management
    getPackages() {
        return this.packages;
    }

    getPackage(packageId) {
        return this.packages.find(p => p.id === packageId);
    }

    addPackage(packageData) {
        const newPackage = {
            id: Date.now().toString(),
            ...packageData,
            popular: false
        };
        this.packages.push(newPackage);
        this.savePackages();
        return newPackage;
    }

    updatePackage(packageId, packageData) {
        const packageIndex = this.packages.findIndex(p => p.id === packageId);
        if (packageIndex !== -1) {
            this.packages[packageIndex] = { ...this.packages[packageIndex], ...packageData };
            this.savePackages();
            return true;
        }
        return false;
    }

    deletePackage(packageId) {
        const packageIndex = this.packages.findIndex(p => p.id === packageId);
        if (packageIndex !== -1) {
            this.packages.splice(packageIndex, 1);
            this.savePackages();
            return true;
        }
        return false;
    }

    setPopularPackage(packageId) {
        // Reset all packages to not popular
        this.packages.forEach(pkg => {
            pkg.popular = false;
        });
        
        // Set the selected package as popular
        const packageIndex = this.packages.findIndex(p => p.id === packageId);
        if (packageIndex !== -1) {
            this.packages[packageIndex].popular = true;
            this.savePackages();
            return true;
        }
        return false;
    }

    // Package prices
    getPackagePrice(packageType) {
        const pkg = this.packages.find(p => p.id === packageType);
        return pkg ? pkg.price : 0;
    }

    // Package details
    getPackageDetails(packageType) {
        const pkg = this.packages.find(p => p.id === packageType);
        if (pkg) {
            return {
                name: pkg.name,
                price: pkg.price,
                description: pkg.description
            };
        }
        
        // Fallback to default packages if not found
        const details = {
            'standard': {
                name: 'Standard',
                price: 850000,
                description: 'Cocok untuk bisnis kecil atau profil perusahaan'
            },
            'business': {
                name: 'Business',
                price: 2000000,
                description: 'Ideal untuk UMKM yang ingin berkembang'
            },
            'premium': {
                name: 'Premium',
                price: 2500000,
                description: 'Solusi lengkap untuk perusahaan besar'
            }
        };
        return details[packageType] || details.standard;
    }

    // Bank Account Management
    getBankAccounts() {
        return this.bankAccounts.filter(account => account.isActive)
            .concat(this.bankAccounts.filter(account => !account.isActive));
    }

    getActiveBankAccounts() {
        return this.bankAccounts.filter(account => account.isActive);
    }

    getBankAccount(accountId) {
        return this.bankAccounts.find(account => account.id === accountId);
    }

    addBankAccount(accountData) {
        const newAccount = {
            id: Date.now().toString(),
            ...accountData,
            createdAt: new Date().toISOString()
        };
        this.bankAccounts.push(newAccount);
        this.saveBankAccounts();
        return newAccount;
    }

    updateBankAccount(accountId, accountData) {
        const accountIndex = this.bankAccounts.findIndex(account => account.id === accountId);
        if (accountIndex !== -1) {
            this.bankAccounts[accountIndex] = { 
                ...this.bankAccounts[accountIndex], 
                ...accountData,
                updatedAt: new Date().toISOString()
            };
            this.saveBankAccounts();
            return true;
        }
        return false;
    }

    deleteBankAccount(accountId) {
        const accountIndex = this.bankAccounts.findIndex(account => account.id === accountId);
        if (accountIndex !== -1) {
            this.bankAccounts.splice(accountIndex, 1);
            this.saveBankAccounts();
            return true;
        }
        return false;
    }

    toggleBankAccountStatus(accountId) {
        const accountIndex = this.bankAccounts.findIndex(account => account.id === accountId);
        if (accountIndex !== -1) {
            this.bankAccounts[accountIndex].isActive = !this.bankAccounts[accountIndex].isActive;
            this.bankAccounts[accountIndex].updatedAt = new Date().toISOString();
            this.saveBankAccounts();
            return true;
        }
        return false;
    }

    // Get customers with statistics (excluding cancelled orders)
    getCustomersWithStats() {
        const customersMap = {};
        
        this.orders.forEach(order => {
            // Skip cancelled orders for customer statistics
            if (order.status === 'cancelled') return;
            
            if (!customersMap[order.email]) {
                customersMap[order.email] = {
                    name: order.name,
                    email: order.email,
                    phone: order.phone,
                    orders: 0,
                    totalSpent: 0
                };
            }
            customersMap[order.email].orders++;
            customersMap[order.email].totalSpent += order.packagePrice;
        });
        
        return Object.values(customersMap);
    }

    // Adjust customer statistics when order status changes
    adjustCustomerStats(email, orderChange, amountChange) {
        // This method is called when order status changes to/from cancelled
        // orderChange: +1 when adding order, -1 when removing order
        // amountChange: positive when adding amount, negative when removing amount
        
        // Note: The actual customer stats are calculated dynamically in getCustomersWithStats()
        // This method is mainly for future extensibility if we decide to store customer stats separately
        console.log(`Adjusting stats for ${email}: orders ${orderChange}, amount ${formatCurrency(amountChange)}`);
    }
}

// Initialize order system
const orderSystem = new OrderSystem();

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Set icon based on type
    let icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add notification styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                background: white;
                color: #333;
                border-radius: 8px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.15);
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 10px;
                max-width: 400px;
                border-left: 4px solid #4bb543;
                animation: slideInRight 0.3s ease;
            }
            .notification.error {
                border-left-color: #e63946;
            }
            .notification.warning {
                border-left-color: #ff9e00;
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
                flex: 1;
            }
            .notification.success .notification-content i {
                color: #4bb543;
            }
            .notification.error .notification-content i {
                color: #e63946;
            }
            .notification.warning .notification-content i {
                color: #ff9e00;
            }
            .notification-close {
                background: none;
                border: none;
                color: #666;
                cursor: pointer;
                padding: 5px;
                border-radius: 4px;
            }
            .notification-close:hover {
                background: #f5f5f5;
            }
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}


// Load pricing packages on the main page
function loadPricingPackages() {
    const pricingGrid = document.getElementById('pricingGrid');
    if (!pricingGrid) return;

    const packages = orderSystem.getPackages();
    
    pricingGrid.innerHTML = packages.map(pkg => `
        <div class="pricing-card ${pkg.popular ? 'popular' : ''}">
            ${pkg.popular ? '<div class="popular-badge">POPULAR</div>' : ''}
            <div class="pricing-header">
                <div class="pricing-name">${pkg.name}</div>
                <div class="pricing-desc">${pkg.description}</div>
                <div class="pricing-price">Mulai dari <span class="price-amount">${formatCurrency(pkg.price)}</span></div>
            </div>
            <div class="pricing-features">
                <ul>
                    ${pkg.features.map((feature, index) => `
                        <li>
                            <i class="fas fa-${pkg.included[index] ? 'check' : 'times'}"></i>
                            ${feature}
                        </li>
                    `).join('')}
                </ul>
            </div>
            <div class="pricing-cta">
                <a href="order.html?package=${pkg.id}" class="btn">Pesan Sekarang</a>
            </div>
        </div>
    `).join('');
}