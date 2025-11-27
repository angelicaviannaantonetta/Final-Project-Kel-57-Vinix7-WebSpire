document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    initDashboard();
    
    // Check if admin is already logged in
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        showDashboard();
    }
    
    // Login form handling
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username === orderSystem.adminCredentials.username && 
            password === orderSystem.adminCredentials.password) {
            localStorage.setItem('adminLoggedIn', 'true');
            showDashboard();
            showNotification('Login berhasil!', 'success');
        } else {
            showNotification('Username atau password salah!', 'error');
        }
    });
    
    // Navigation handling
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav items
            document.querySelectorAll('.nav-item').forEach(nav => {
                nav.classList.remove('active');
            });
            
            // Add active class to clicked nav item
            this.classList.add('active');
            
            // Get the target section
            const targetSection = this.getAttribute('data-section');
            
            // Hide all sections
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Show target section
            document.getElementById(`${targetSection}Section`).classList.add('active');
            
            // Update page title
            updatePageTitle(targetSection);
            
            // Load section-specific data
            if (targetSection === 'orders') {
                loadOrders();
                loadFilterPackages(); // Load packages for filter dropdown
            } else if (targetSection === 'packages') {
                loadPackages();
            } else if (targetSection === 'customers') {
                loadCustomers();
            } else if (targetSection === 'bankAccounts') {
                loadBankAccounts();
            } else if (targetSection === 'overview') {
                loadOverview();
            }
        });
    });
    
    // Logout handling
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('adminLoggedIn');
        document.getElementById('dashboardSection').style.display = 'none';
        document.getElementById('loginSection').style.display = 'flex';
        showNotification('Logout berhasil!', 'success');
    });
    
    // Search functionality
    const searchOrders = document.getElementById('searchOrders');
    if (searchOrders) {
        searchOrders.addEventListener('input', function() {
            filterOrders(this.value);
        });
    }
    
    const searchCustomers = document.getElementById('searchCustomers');
    if (searchCustomers) {
        searchCustomers.addEventListener('input', function() {
            filterCustomers(this.value);
        });
    }

    // Package form handling
    const packageForm = document.getElementById('packageForm');
    packageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        savePackage();
    });

    // Edit order form handling
    const editOrderForm = document.getElementById('editOrderForm');
    editOrderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveOrderChanges();
    });

    // Bank Account form handling
    const bankAccountForm = document.getElementById('bankAccountForm');
    if (bankAccountForm) {
        bankAccountForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveBankAccount();
        });
    }
});

// Function to navigate to Orders section
function navigateToOrders() {
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
    });
    
    // Add active class to orders nav item
    document.querySelector('.nav-item[data-section="orders"]').classList.add('active');
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show orders section
    document.getElementById('ordersSection').classList.add('active');
    
    // Update page title
    updatePageTitle('orders');
    
    // Load orders data
    loadOrders();
    loadFilterPackages();
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Initialize dashboard
function initDashboard() {
    // Set current date
    const currentDate = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = currentDate.toLocaleDateString('id-ID', options);
    
    // Initialize charts
    initCharts();
}

// Show dashboard after login
function showDashboard() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'flex';
    
    // Load initial data
    loadOverview();
}

// Update page title based on active section
function updatePageTitle(section) {
    const titles = {
        'overview': 'Dashboard Overview',
        'orders': 'Manajemen Pemesanan',
        'packages': 'Manajemen Paket',
        'customers': 'Data Customers',
        'bankAccounts': 'Manajemen Rekening Bank'
    };
    
    const subtitles = {
        'overview': 'Ringkasan statistik dan aktivitas terbaru',
        'orders': 'Kelola semua pemesanan dari customers',
        'packages': 'Kelola paket layanan website',
        'customers': 'Data lengkap semua customers',
        'bankAccounts': 'Kelola informasi rekening bank untuk pembayaran'
    };
    
    document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';
    document.getElementById('pageSubtitle').textContent = subtitles[section] || '';
}

// Load overview data
function loadOverview() {
    const orders = orderSystem.getOrders();
    updateStatistics(orders);
    updateRecentActivities(orders);
    updateOrdersChart(orders);
}

// Update statistics cards
function updateStatistics(orders) {
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('pendingOrders').textContent = orders.filter(o => o.status === 'pending').length;
    document.getElementById('paidOrders').textContent = orders.filter(o => o.status === 'paid').length;
    document.getElementById('completedOrders').textContent = orders.filter(o => o.status === 'completed').length;
    document.getElementById('cancelledOrders').textContent = orders.filter(o => o.status === 'cancelled').length;
    
    // Update orders badge
    document.getElementById('ordersBadge').textContent = orders.length;
}

// Update recent activities
function updateRecentActivities(orders) {
    const activitiesContainer = document.getElementById('recentActivities');
    const recentOrders = orders.slice(0, 5); // Get 5 most recent orders
    
    if (recentOrders.length === 0) {
        activitiesContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Belum ada aktivitas</p>';
        return;
    }
    
    activitiesContainer.innerHTML = recentOrders.map(order => {
        const packageDetails = orderSystem.getPackageDetails(order.package);
        const statusIcon = getStatusIcon(order.status);
        const statusClass = getStatusClass(order.status);
        
        return `
            <div class="activity-item">
                <div class="customer-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="activity-icon ${statusClass}">
                    <i class="${statusIcon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${order.name} - ${packageDetails.name}</div>
                    <div class="activity-time">${formatDate(order.createdAt)}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Get status icon
function getStatusIcon(status) {
    const icons = {
        'pending': 'fas fa-clock',
        'paid': 'fas fa-check-circle',
        'completed': 'fas fa-trophy',
        'cancelled': 'fas fa-times-circle'
    };
    return icons[status] || 'fas fa-info-circle';
}

// Get status class
function getStatusClass(status) {
    const classes = {
        'pending': 'warning',
        'paid': 'primary',
        'completed': 'success',
        'cancelled': 'danger'
    };
    return classes[status] || 'primary';
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format date for CSV (without time)
function formatDateForCSV(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

// Initialize charts
function initCharts() {
    const ctx = document.getElementById('ordersChart').getContext('2d');
    
    // Create initial chart with empty data
    window.ordersChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Jumlah Pemesanan',
                data: Array(12).fill(0),
                backgroundColor: 'rgba(67, 97, 238, 0.7)',
                borderColor: 'rgba(67, 97, 238, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Bulan'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Jumlah Pemesanan'
                    },
                    ticks: {
                        precision: 0
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Pemesanan: ${context.parsed.y}`;
                        }
                    }
                }
            },
            // Enable zoom and pan
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            // Enable panning
            plugins: {
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'x',
                        modifierKey: 'ctrl'
                    },
                    zoom: {
                        wheel: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'x',
                    }
                }
            }
        }
    });

    // Add sync button functionality
    const syncButton = document.querySelector('.card-actions .btn-icon');
    if (syncButton) {
        syncButton.addEventListener('click', function() {
            refreshOrdersChart();
            showNotification('Grafik pemesanan telah diperbarui!', 'success');
        });
    }
}

// Refresh orders chart with latest data
function refreshOrdersChart() {
    const orders = orderSystem.getOrders();
    updateOrdersChart(orders);
}

// Update orders chart with real data for current year
function updateOrdersChart(orders) {
    if (!window.ordersChart) return;
    
    const currentYear = new Date().getFullYear();
    
    // Initialize monthly data for current year
    const monthlyData = Array(12).fill(0);
    
    // Count orders per month for current year
    orders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        const orderYear = orderDate.getFullYear();
        
        if (orderYear === currentYear) {
            const month = orderDate.getMonth(); // 0 = January, 11 = December
            monthlyData[month]++;
        }
    });
    
    // Update chart data
    window.ordersChart.data.datasets[0].data = monthlyData;
    window.ordersChart.update();
    
    // Update chart title with current year
    window.ordersChart.options.plugins.title = {
        display: true,
        text: `Statistik Pemesanan Tahun ${currentYear}`,
        font: {
            size: 16
        }
    };
    window.ordersChart.update();
}

// Load packages for filter dropdown
function loadFilterPackages() {
    const filterPackage = document.getElementById('filterPackage');
    const packages = orderSystem.getPackages();
    
    filterPackage.innerHTML = '<option value="">Semua Paket</option>' + 
        packages.map(pkg => `
            <option value="${pkg.id}">${pkg.name}</option>
        `).join('');
}

// Load orders with filter support
function loadOrders() {
    const orders = orderSystem.getOrders();
    displayOrders(orders);
}

// Display orders in table
function displayOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    
    if (orders.length === 0) {
        ordersList.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-shopping-cart" style="font-size: 2rem; margin-bottom: 10px; display: block; opacity: 0.5;"></i>
                    Belum ada pesanan
                </td>
            </tr>
        `;
        return;
    }
    
    ordersList.innerHTML = orders.map(order => {
        const packageDetails = orderSystem.getPackageDetails(order.package);
        const statusClass = `status-badge status-${order.status}`;
        const statusText = getStatusText(order.status);
        
        return `
            <tr>
                <td>
                    <div style="display: flex; align-items: center;">
                        <div class="customer-avatar" style="margin-right: 10px;">
                            <i class="fas fa-user"></i>
                        </div>
                        <div>
                            <strong>${order.name}</strong><br>
                            <small>${order.email}</small>
                        </div>
                    </div>
                </td>
                <td>${packageDetails.name}</td>
                <td>${formatDate(order.createdAt)}</td>
                <td>${formatCurrency(order.packagePrice)}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
                <td>
                    <div class="action-buttons">
                        <button onclick="viewOrderDetail('${order.id}')" class="btn btn-primary btn-sm">
                            <i class="fas fa-eye"></i> Lihat
                        </button>
                        <button onclick="editOrder('${order.id}')" class="btn btn-secondary btn-sm">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="showDeleteOrderModal('${order.id}')" class="btn btn-danger btn-sm">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                        <select onchange="updateOrderStatus('${order.id}', this.value)" style="padding: 5px; border-radius: 4px; border: 1px solid #ddd; font-size: 0.8rem;">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="paid" ${order.status === 'paid' ? 'selected' : ''}>Paid</option>
                            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Apply filters
function applyFilters() {
    const status = document.getElementById('filterStatus').value;
    const packageType = document.getElementById('filterPackage').value;
    const dateStart = document.getElementById('filterDateStart').value;
    const dateEnd = document.getElementById('filterDateEnd').value;
    
    let filteredOrders = orderSystem.getOrders();
    
    // Filter by status
    if (status) {
        filteredOrders = filteredOrders.filter(order => order.status === status);
    }
    
    // Filter by package
    if (packageType) {
        filteredOrders = filteredOrders.filter(order => order.package === packageType);
    }
    
    // Filter by date range
    if (dateStart) {
        const startDate = new Date(dateStart);
        filteredOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= startDate;
        });
    }
    
    if (dateEnd) {
        const endDate = new Date(dateEnd);
        endDate.setHours(23, 59, 59, 999); // Set to end of day
        filteredOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate <= endDate;
        });
    }
    
    // Apply search filter if any
    const searchTerm = document.getElementById('searchOrders').value;
    if (searchTerm) {
        filteredOrders = filteredOrders.filter(order => 
            order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.package.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    displayOrders(filteredOrders);
    
    // Show notification if no results
    if (filteredOrders.length === 0) {
        showNotification('Tidak ada pesanan yang sesuai dengan filter yang diterapkan', 'warning');
    }
}

// Reset filters
function resetFilters() {
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterPackage').value = '';
    document.getElementById('filterDateStart').value = '';
    document.getElementById('filterDateEnd').value = '';
    document.getElementById('searchOrders').value = '';
    
    loadOrders();
    showNotification('Filter telah direset', 'success');
}

// Load packages
function loadPackages() {
    const packages = orderSystem.getPackages();
    const packagesList = document.getElementById('packagesList');
    
    if (packages.length === 0) {
        packagesList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666; grid-column: 1 / -1;">
                <i class="fas fa-box" style="font-size: 2rem; margin-bottom: 10px; display: block; opacity: 0.5;"></i>
                Belum ada paket yang tersedia
            </div>
        `;
        return;
    }
    
    packagesList.innerHTML = packages.map(pkg => `
        <div class="package-card ${pkg.popular ? 'popular' : ''}">
            ${pkg.popular ? '<div class="popular-badge">POPULAR</div>' : ''}
            <div class="package-header">
                <div class="package-name">${pkg.name}</div>
                <div class="package-desc">${pkg.description}</div>
                <div class="package-price">Mulai dari <span class="price-amount">${formatCurrency(pkg.price)}</span></div>
            </div>
            <div class="package-features">
                <ul>
                    ${pkg.features.map((feature, index) => `
                        <li>
                            <i class="fas fa-${pkg.included[index] ? 'check' : 'times'}"></i>
                            ${feature}
                        </li>
                    `).join('')}
                </ul>
            </div>
            <div class="package-actions">
                <button onclick="editPackage('${pkg.id}')" class="btn btn-primary btn-sm">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button onclick="setPopularPackage('${pkg.id}')" class="btn btn-secondary btn-sm" ${pkg.popular ? 'disabled' : ''}>
                    <i class="fas fa-star"></i> ${pkg.popular ? 'Popular' : 'Jadikan Popular'}
                </button>
                <button onclick="deletePackage('${pkg.id}')" class="btn btn-danger btn-sm">
                    <i class="fas fa-trash"></i> Hapus
                </button>
            </div>
        </div>
    `).join('');
}

// Load customers
function loadCustomers() {
    const customers = orderSystem.getCustomersWithStats();
    const customersList = document.getElementById('customersList');
    
    if (customers.length === 0) {
        customersList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666; grid-column: 1 / -1;">
                <i class="fas fa-users" style="font-size: 2rem; margin-bottom: 10px; display: block; opacity: 0.5;"></i>
                Belum ada customer
            </div>
        `;
        return;
    }
    
    customersList.innerHTML = customers.map(customer => {
        return `
            <div class="customer-card">
                <div class="customer-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="customer-info">
                    <h4>${customer.name}</h4>
                    <p>${customer.email}</p>
                    <p>${customer.phone}</p>
                    <p><strong>${customer.orders}</strong> pesanan • ${formatCurrency(customer.totalSpent)}</p>
                </div>
            </div>
        `;
    }).join('');
}

// Load bank accounts
function loadBankAccounts() {
    const bankAccounts = orderSystem.getBankAccounts();
    const bankAccountsList = document.getElementById('bankAccountsList');
    
    if (bankAccounts.length === 0) {
        bankAccountsList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666; grid-column: 1 / -1;">
                <i class="fas fa-university" style="font-size: 2rem; margin-bottom: 10px; display: block; opacity: 0.5;"></i>
                Belum ada rekening bank yang terdaftar
            </div>
        `;
        return;
    }
    
    bankAccountsList.innerHTML = bankAccounts.map(account => {
        const defaultLogos = {
            'BCA': 'fas fa-building',
            'Mandiri': 'fas fa-landmark',
            'BNI': 'fas fa-university',
            'BRI': 'fas fa-piggy-bank',
            'CIMB': 'fas fa-credit-card'
        };
        
        const logoClass = defaultLogos[account.bankName] || 'fas fa-university';
        
        return `
            <div class="bank-account-card ${account.isActive ? '' : 'inactive'}">
                <div class="bank-account-header">
                    <div class="bank-logo">
                        ${account.bankLogo ? 
                            `<img src="${account.bankLogo}" alt="${account.bankName}">` : 
                            `<i class="${logoClass}"></i>`
                        }
                    </div>
                    <div class="bank-info">
                        <div class="bank-name">${account.bankName}</div>
                        <div class="account-number">${formatAccountNumber(account.accountNumber)}</div>
                        <div class="account-holder">${account.accountHolder}</div>
                    </div>
                </div>
                <div class="bank-account-status ${account.isActive ? 'status-active' : 'status-inactive'}">
                    ${account.isActive ? 'Aktif' : 'Nonaktif'}
                </div>
                <div class="bank-account-actions">
                    <button onclick="editBankAccount('${account.id}')" class="btn btn-primary btn-sm">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="toggleBankAccountStatus('${account.id}')" class="btn btn-secondary btn-sm">
                        <i class="fas fa-power-off"></i> ${account.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <button onclick="showDeleteBankAccountModal('${account.id}')" class="btn btn-danger btn-sm">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Filter orders (for search functionality)
function filterOrders(searchTerm) {
    const orders = orderSystem.getOrders();
    const filteredOrders = orders.filter(order => 
        order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.package.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const ordersList = document.getElementById('ordersList');
    
    if (filteredOrders.length === 0) {
        ordersList.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #666;">
                    Tidak ditemukan pesanan yang sesuai dengan pencarian
                </td>
            </tr>
        `;
        return;
    }
    
    ordersList.innerHTML = filteredOrders.map(order => {
        const packageDetails = orderSystem.getPackageDetails(order.package);
        const statusClass = `status-badge status-${order.status}`;
        const statusText = getStatusText(order.status);
        
        return `
            <tr>
                <td>
                    <div style="display: flex; align-items: center;">
                        <div class="customer-avatar" style="margin-right: 10px;">
                            <i class="fas fa-user"></i>
                        </div>
                        <div>
                            <strong>${order.name}</strong><br>
                            <small>${order.email}</small>
                        </div>
                    </div>
                </td>
                <td>${packageDetails.name}</td>
                <td>${formatDate(order.createdAt)}</td>
                <td>${formatCurrency(order.packagePrice)}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
                <td>
                    <div class="action-buttons">
                        <button onclick="viewOrderDetail('${order.id}')" class="btn btn-primary btn-sm">
                            <i class="fas fa-eye"></i> Lihat
                        </button>
                        <button onclick="editOrder('${order.id}')" class="btn btn-secondary btn-sm">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="showDeleteOrderModal('${order.id}')" class="btn btn-danger btn-sm">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                        <select onchange="updateOrderStatus('${order.id}', this.value)" style="padding: 5px; border-radius: 4px; border: 1px solid #ddd; font-size: 0.8rem;">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="paid" ${order.status === 'paid' ? 'selected' : ''}>Paid</option>
                            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Filter customers
function filterCustomers(searchTerm) {
    const customers = orderSystem.getCustomersWithStats();
    const filteredCustomers = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const customersList = document.getElementById('customersList');
    
    if (filteredCustomers.length === 0) {
        customersList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666; grid-column: 1 / -1;">
                Tidak ditemukan customer yang sesuai dengan pencarian
            </div>
        `;
        return;
    }
    
    customersList.innerHTML = filteredCustomers.map(customer => {
        return `
            <div class="customer-card">
                <div class="customer-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="customer-info">
                    <h4>${customer.name}</h4>
                    <p>${customer.email}</p>
                    <p>${customer.phone}</p>
                    <p><strong>${customer.orders}</strong> pesanan • ${formatCurrency(customer.totalSpent)}</p>
                </div>
            </div>
        `;
    }).join('');
}

// View order detail
function viewOrderDetail(orderId) {
    const orders = orderSystem.getOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    const packageDetails = orderSystem.getPackageDetails(order.package);
    const modal = document.getElementById('orderModal');
    const content = document.getElementById('orderDetailContent');
    
    // Create payment proof section
    let paymentProofSection = '';
    if (order.paymentProof) {
        paymentProofSection = `
            <div class="form-group">
                <h4>Bukti Pembayaran</h4>
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button onclick="viewPaymentProof('${order.id}')" class="btn btn-primary">
                        <i class="fas fa-eye"></i> Lihat Bukti
                    </button>
                    <button onclick="downloadPaymentProof('${order.id}')" class="btn btn-secondary">
                        <i class="fas fa-download"></i> Download Bukti
                    </button>
                </div>
                <p style="margin-top: 10px; font-size: 0.9rem; color: #666;">
                    <i class="fas fa-info-circle"></i> File: ${order.paymentProof.name}
                </p>
            </div>
        `;
    }
    
    content.innerHTML = `
        <div class="form-group">
            <h4>Informasi Customer</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px;">
                <div>
                    <label>Nama Lengkap</label>
                    <div class="form-control" style="background: #f8f9fa;">${order.name}</div>
                </div>
                <div>
                    <label>Email</label>
                    <div class="form-control" style="background: #f8f9fa;">${order.email}</div>
                </div>
                <div>
                    <label>No. WhatsApp</label>
                    <div class="form-control" style="background: #f8f9fa;">${order.phone}</div>
                </div>
                <div>
                    <label>Status</label>
                    <div class="form-control" style="background: #f8f9fa;">
                        <span class="status-badge status-${order.status}">${getStatusText(order.status)}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="form-group">
            <h4>Detail Pemesanan</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px;">
                <div>
                    <label>Paket</label>
                    <div class="form-control" style="background: #f8f9fa;">${packageDetails.name}</div>
                </div>
                <div>
                    <label>Harga</label>
                    <div class="form-control" style="background: #f8f9fa;">${formatCurrency(order.packagePrice)}</div>
                </div>
                <div>
                    <label>Tanggal Pemesanan</label>
                    <div class="form-control" style="background: #f8f9fa;">${formatDate(order.createdAt)}</div>
                </div>
                <div>
                    <label>Jadwal Meeting</label>
                    <div class="form-control" style="background: #f8f9fa;">${new Date(order.meetingDate).toLocaleString('id-ID')}</div>
                </div>
            </div>
        </div>
        
        <div class="form-group">
            <h4>Deskripsi Kebutuhan</h4>
            <div class="form-control" style="background: #f8f9fa; min-height: 100px;">${order.description}</div>
        </div>
        
        ${order.notes ? `
        <div class="form-group">
            <h4>Catatan Tambahan</h4>
            <div class="form-control" style="background: #f8f9fa; min-height: 80px;">${order.notes}</div>
        </div>
        ` : ''}
        
        ${paymentProofSection}
        
        <div style="margin-top: 25px; text-align: center;">
            <button onclick="closeModal()" class="btn btn-primary">Tutup</button>
        </div>
    `;
    
    modal.style.display = 'flex';
}

// Edit order
function editOrder(orderId) {
    const orders = orderSystem.getOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    // Populate package options
    const packageSelect = document.getElementById('editOrderPackage');
    const packages = orderSystem.getPackages();
    packageSelect.innerHTML = '<option value="">Pilih Paket</option>' + 
        packages.map(pkg => `
            <option value="${pkg.id}" ${order.package === pkg.id ? 'selected' : ''}>${pkg.name} - ${formatCurrency(pkg.price)}</option>
        `).join('');
    
    // Fill form with order data
    document.getElementById('editOrderId').value = order.id;
    document.getElementById('editOrderName').value = order.name;
    document.getElementById('editOrderEmail').value = order.email;
    document.getElementById('editOrderPhone').value = order.phone;
    document.getElementById('editOrderDescription').value = order.description;
    document.getElementById('editOrderMeetingDate').value = order.meetingDate.slice(0, 16);
    document.getElementById('editOrderStatus').value = order.status;
    document.getElementById('editOrderNotes').value = order.notes || '';
    
    // Show modal
    document.getElementById('editOrderModal').style.display = 'flex';
}

// Save order changes
function saveOrderChanges() {
    const orderId = document.getElementById('editOrderId').value;
    const name = document.getElementById('editOrderName').value;
    const email = document.getElementById('editOrderEmail').value;
    const phone = document.getElementById('editOrderPhone').value;
    const packageType = document.getElementById('editOrderPackage').value;
    const description = document.getElementById('editOrderDescription').value;
    const meetingDate = document.getElementById('editOrderMeetingDate').value;
    const status = document.getElementById('editOrderStatus').value;
    const notes = document.getElementById('editOrderNotes').value;
    
    // Validate form
    if (!name || !email || !phone || !packageType || !description || !meetingDate || !status) {
        showNotification('Harap lengkapi semua field yang wajib!', 'error');
        return;
    }
    
    // Find the order
    const orders = orderSystem.getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
        showNotification('Pesanan tidak ditemukan!', 'error');
        return;
    }
    
    // Get old status for customer stats adjustment
    const oldStatus = orders[orderIndex].status;
    
    // Update order
    const packageDetails = orderSystem.getPackageDetails(packageType);
    orders[orderIndex].name = name;
    orders[orderIndex].email = email;
    orders[orderIndex].phone = phone;
    orders[orderIndex].package = packageType;
    orders[orderIndex].packagePrice = packageDetails.price;
    orders[orderIndex].description = description;
    orders[orderIndex].meetingDate = meetingDate;
    orders[orderIndex].status = status;
    orders[orderIndex].notes = notes;
    
    // Save to localStorage
    orderSystem.saveOrders();
    
    // Update customer stats if status changed to/from cancelled
    if (oldStatus !== status) {
        if (oldStatus === 'cancelled' && status !== 'cancelled') {
            // Order was cancelled but now is not cancelled - add back to customer stats
            orderSystem.adjustCustomerStats(orders[orderIndex].email, 1, orders[orderIndex].packagePrice);
        } else if (oldStatus !== 'cancelled' && status === 'cancelled') {
            // Order is now cancelled - remove from customer stats
            orderSystem.adjustCustomerStats(orders[orderIndex].email, -1, -orders[orderIndex].packagePrice);
        }
    }
    
    showNotification('Pesanan berhasil diupdate!', 'success');
    closeEditOrderModal();
    loadOrders();
    loadOverview(); // Refresh overview stats
}

// Show delete order confirmation modal
function showDeleteOrderModal(orderId) {
    const orders = orderSystem.getOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    const packageDetails = orderSystem.getPackageDetails(order.package);
    
    document.getElementById('deleteOrderPreview').innerHTML = `
        <div class="order-preview-item">
            <strong>Customer:</strong>
            <span>${order.name}</span>
        </div>
        <div class="order-preview-item">
            <strong>Paket:</strong>
            <span>${packageDetails.name}</span>
        </div>
        <div class="order-preview-item">
            <strong>Harga:</strong>
            <span>${formatCurrency(order.packagePrice)}</span>
        </div>
        <div class="order-preview-item">
            <strong>Status:</strong>
            <span class="status-badge status-${order.status}">${getStatusText(order.status)}</span>
        </div>
    `;
    
    // Store order ID for deletion
    document.getElementById('deleteOrderModal').setAttribute('data-order-id', orderId);
    document.getElementById('deleteOrderModal').style.display = 'flex';
}

// Confirm order deletion
function confirmDeleteOrder() {
    const orderId = document.getElementById('deleteOrderModal').getAttribute('data-order-id');
    
    if (orderSystem.deleteOrder(orderId)) {
        showNotification('Pesanan berhasil dihapus!', 'success');
        closeDeleteOrderModal();
        loadOrders();
        loadOverview(); // Refresh overview stats
    } else {
        showNotification('Gagal menghapus pesanan!', 'error');
    }
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
    const orders = orderSystem.getOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        showNotification('Pesanan tidak ditemukan!', 'error');
        return;
    }
    
    const oldStatus = order.status;
    
    if (orderSystem.updateOrderStatus(orderId, newStatus)) {
        // Update customer stats if status changed to/from cancelled
        if (oldStatus !== newStatus) {
            if (oldStatus === 'cancelled' && newStatus !== 'cancelled') {
                // Order was cancelled but now is not cancelled - add back to customer stats
                orderSystem.adjustCustomerStats(order.email, 1, order.packagePrice);
            } else if (oldStatus !== 'cancelled' && newStatus === 'cancelled') {
                // Order is now cancelled - remove from customer stats
                orderSystem.adjustCustomerStats(order.email, -1, -order.packagePrice);
            }
        }
        
        showNotification('Status pesanan berhasil diupdate!', 'success');
        // Reload current section
        const activeSection = document.querySelector('.content-section.active').id;
        if (activeSection === 'ordersSection') {
            loadOrders();
        } else if (activeSection === 'overviewSection') {
            loadOverview();
        } else if (activeSection === 'customersSection') {
            loadCustomers();
        }
    } else {
        showNotification('Gagal mengupdate status pesanan!', 'error');
    }
}

// View payment proof
function viewPaymentProof(orderId) {
    const orders = orderSystem.getOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order || !order.paymentProof) {
        showNotification('Bukti pembayaran tidak ditemukan!', 'error');
        return;
    }
    
    const modal = document.getElementById('paymentProofModal');
    const content = document.getElementById('paymentProofContent');
    
    const fileExtension = order.paymentProof.name.split('.').pop().toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(fileExtension);
    const isPDF = fileExtension === 'pdf';
    
    let proofContent = '';
    
    if (isImage) {
        proofContent = `
            <div style="text-align: center;">
                <img src="${order.paymentProof.data}" 
                     alt="Bukti Pembayaran" 
                     style="max-width: 100%; max-height: 70vh; border: 1px solid #ddd; border-radius: 5px;">
                <p style="margin-top: 15px; color: #666;">${order.paymentProof.name}</p>
            </div>
        `;
    } else if (isPDF) {
        proofContent = `
            <div style="text-align: center;">
                <embed src="${order.paymentProof.data}" 
                       type="application/pdf" 
                       width="100%" 
                       height="600px"
                       style="border: 1px solid #ddd; border-radius: 5px;">
                <p style="margin-top: 15px; color: #666;">${order.paymentProof.name}</p>
                <div style="margin-top: 15px;">
                    <a href="${order.paymentProof.data}" 
                       download="${order.paymentProof.name}" 
                       class="btn btn-primary">
                        <i class="fas fa-download"></i> Download PDF
                    </a>
                </div>
            </div>
        `;
    } else {
        proofContent = `
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-file fa-3x" style="color: #666; margin-bottom: 15px;"></i>
                <p>Format file tidak dapat ditampilkan preview</p>
                <p style="color: #666;">${order.paymentProof.name}</p>
                <div style="margin-top: 15px;">
                    <a href="${order.paymentProof.data}" 
                       download="${order.paymentProof.name}" 
                       class="btn btn-primary">
                        <i class="fas fa-download"></i> Download File
                    </a>
                </div>
            </div>
        `;
    }
    
    content.innerHTML = proofContent;
    modal.style.display = 'flex';
}

// Download payment proof
function downloadPaymentProof(orderId) {
    const orders = orderSystem.getOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order || !order.paymentProof) {
        showNotification('Bukti pembayaran tidak ditemukan!', 'error');
        return;
    }
    
    try {
        const link = document.createElement('a');
        link.href = order.paymentProof.data;
        link.download = order.paymentProof.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Download bukti pembayaran berhasil!', 'success');
    } catch (error) {
        console.error('Error downloading file:', error);
        showNotification('Gagal mendownload bukti pembayaran!', 'error');
    }
}

// Export orders to CSV
function exportOrders() {
    const orders = orderSystem.getOrders();
    
    if (orders.length === 0) {
        showNotification('Tidak ada data pemesanan untuk di-export!', 'warning');
        return;
    }
    
    // Prepare CSV content
    const headers = ['Nama Customer', 'Email', 'No. WhatsApp', 'Paket', 'Harga', 'Status', 'Tanggal Pemesanan', 'Jadwal Meeting', 'Deskripsi Kebutuhan', 'Catatan Tambahan'];
    
    let csvContent = headers.join(',') + '\n';
    
    orders.forEach(order => {
        const packageDetails = orderSystem.getPackageDetails(order.package);
        const statusText = getStatusText(order.status);
        
        const row = [
            `"${order.name}"`,
            `"${order.email}"`,
            `"${order.phone}"`,
            `"${packageDetails.name}"`,
            `"${formatCurrency(order.packagePrice)}"`,
            `"${statusText}"`,
            `"${formatDateForCSV(order.createdAt)}"`,
            `"${new Date(order.meetingDate).toLocaleString('id-ID')}"`,
            `"${order.description.replace(/"/g, '""')}"`,
            `"${(order.notes || '').replace(/"/g, '""')}"`
        ];
        
        csvContent += row.join(',') + '\n';
    });
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const currentDate = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `data-pemesanan-${currentDate}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Data pemesanan berhasil di-export!', 'success');
}

// Package Management Functions
function showAddPackageModal() {
    document.getElementById('packageModalTitle').textContent = 'Tambah Paket Baru';
    document.getElementById('packageId').value = '';
    document.getElementById('packageName').value = '';
    document.getElementById('packagePrice').value = '';
    document.getElementById('packageDescription').value = '';
    document.getElementById('packagePopular').checked = false;
    
    // Reset features
    const featuresContainer = document.getElementById('packageFeatures');
    featuresContainer.innerHTML = '';
    
    // Add initial feature fields
    addFeatureField();
    addFeatureField();
    
    document.getElementById('packageModal').style.display = 'flex';
}

function addFeatureField(feature = '', included = true) {
    const featuresContainer = document.getElementById('packageFeatures');
    const featureId = Date.now().toString();
    
    const featureField = document.createElement('div');
    featureField.className = 'feature-field';
    featureField.innerHTML = `
        <input type="text" placeholder="Nama fitur" value="${feature}" class="form-control">
        <label>
            <input type="checkbox" ${included ? 'checked' : ''}> Termasuk
        </label>
        <button type="button" class="remove-feature" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    featuresContainer.appendChild(featureField);
}

function editPackage(packageId) {
    const pkg = orderSystem.getPackage(packageId);
    if (!pkg) return;
    
    document.getElementById('packageModalTitle').textContent = 'Edit Paket';
    document.getElementById('packageId').value = pkg.id;
    document.getElementById('packageName').value = pkg.name;
    document.getElementById('packagePrice').value = pkg.price;
    document.getElementById('packageDescription').value = pkg.description;
    document.getElementById('packagePopular').checked = pkg.popular;
    
    // Reset features
    const featuresContainer = document.getElementById('packageFeatures');
    featuresContainer.innerHTML = '';
    
    // Add feature fields from package
    pkg.features.forEach((feature, index) => {
        addFeatureField(feature, pkg.included[index]);
    });
    
    document.getElementById('packageModal').style.display = 'flex';
}

function savePackage() {
    const packageId = document.getElementById('packageId').value;
    const name = document.getElementById('packageName').value;
    const price = parseInt(document.getElementById('packagePrice').value);
    const description = document.getElementById('packageDescription').value;
    const popular = document.getElementById('packagePopular').checked;
    
    // Validate form
    if (!name || !price || !description) {
        showNotification('Harap lengkapi semua field yang wajib!', 'error');
        return;
    }
    
    // Get features
    const featureFields = document.querySelectorAll('.feature-field');
    const features = [];
    const included = [];
    
    featureFields.forEach(field => {
        const featureInput = field.querySelector('input[type="text"]');
        const includedCheckbox = field.querySelector('input[type="checkbox"]');
        
        if (featureInput.value.trim()) {
            features.push(featureInput.value.trim());
            included.push(includedCheckbox.checked);
        }
    });
    
    if (features.length === 0) {
        showNotification('Harap tambahkan minimal satu fitur!', 'error');
        return;
    }
    
    const packageData = {
        name,
        price,
        description,
        features,
        included,
        popular
    };
    
    let success = false;
    let message = '';
    
    if (packageId) {
        // Update existing package
        success = orderSystem.updatePackage(packageId, packageData);
        message = 'Paket berhasil diupdate!';
    } else {
        // Add new package
        orderSystem.addPackage(packageData);
        success = true;
        message = 'Paket berhasil ditambahkan!';
    }
    
    if (success) {
        showNotification(message, 'success');
        closePackageModal();
        loadPackages();
        
        // Reload pricing on main page if it's open
        if (typeof loadPricingPackages === 'function') {
            loadPricingPackages();
        }
    } else {
        showNotification('Gagal menyimpan paket!', 'error');
    }
}

function setPopularPackage(packageId) {
    if (orderSystem.setPopularPackage(packageId)) {
        showNotification('Paket berhasil dijadikan popular!', 'success');
        loadPackages();
        
        // Reload pricing on main page if it's open
        if (typeof loadPricingPackages === 'function') {
            loadPricingPackages();
        }
    } else {
        showNotification('Gagal mengatur paket popular!', 'error');
    }
}

function deletePackage(packageId) {
    if (confirm('Apakah Anda yakin ingin menghapus paket ini?')) {
        if (orderSystem.deletePackage(packageId)) {
            showNotification('Paket berhasil dihapus!', 'success');
            loadPackages();
            
            // Reload pricing on main page if it's open
            if (typeof loadPricingPackages === 'function') {
                loadPricingPackages();
            }
        } else {
            showNotification('Gagal menghapus paket!', 'error');
        }
    }
}

// Bank Account Management Functions
function showAddBankAccountModal() {
    document.getElementById('bankAccountModalTitle').textContent = 'Tambah Rekening Bank';
    document.getElementById('bankAccountId').value = '';
    document.getElementById('bankName').value = '';
    document.getElementById('accountNumber').value = '';
    document.getElementById('accountHolder').value = '';
    document.getElementById('bankLogo').value = '';
    document.getElementById('isActive').checked = true;
    
    document.getElementById('bankAccountModal').style.display = 'flex';
}

function editBankAccount(accountId) {
    const account = orderSystem.getBankAccount(accountId);
    if (!account) return;
    
    document.getElementById('bankAccountModalTitle').textContent = 'Edit Rekening Bank';
    document.getElementById('bankAccountId').value = account.id;
    document.getElementById('bankName').value = account.bankName;
    document.getElementById('accountNumber').value = account.accountNumber;
    document.getElementById('accountHolder').value = account.accountHolder;
    document.getElementById('bankLogo').value = account.bankLogo || '';
    document.getElementById('isActive').checked = account.isActive;
    
    document.getElementById('bankAccountModal').style.display = 'flex';
}

function saveBankAccount() {
    const accountId = document.getElementById('bankAccountId').value;
    const bankName = document.getElementById('bankName').value;
    const accountNumber = document.getElementById('accountNumber').value;
    const accountHolder = document.getElementById('accountHolder').value;
    const bankLogo = document.getElementById('bankLogo').value;
    const isActive = document.getElementById('isActive').checked;
    
    // Validate form
    if (!bankName || !accountNumber || !accountHolder) {
        showNotification('Harap lengkapi semua field yang wajib!', 'error');
        return;
    }
    
    const accountData = {
        bankName,
        accountNumber,
        accountHolder,
        bankLogo: bankLogo || null,
        isActive
    };
    
    let success = false;
    let message = '';
    
    if (accountId) {
        // Update existing account
        success = orderSystem.updateBankAccount(accountId, accountData);
        message = 'Rekening bank berhasil diupdate!';
    } else {
        // Add new account
        orderSystem.addBankAccount(accountData);
        success = true;
        message = 'Rekening bank berhasil ditambahkan!';
    }
    
    if (success) {
        showNotification(message, 'success');
        closeBankAccountModal();
        loadBankAccounts();
    } else {
        showNotification('Gagal menyimpan rekening bank!', 'error');
    }
}

function toggleBankAccountStatus(accountId) {
    if (orderSystem.toggleBankAccountStatus(accountId)) {
        showNotification('Status rekening bank berhasil diubah!', 'success');
        loadBankAccounts();
    } else {
        showNotification('Gagal mengubah status rekening bank!', 'error');
    }
}

function showDeleteBankAccountModal(accountId) {
    const account = orderSystem.getBankAccount(accountId);
    
    if (!account) return;
    
    document.getElementById('deleteBankAccountPreview').innerHTML = `
        <div class="bank-account-preview-item">
            <strong>Bank:</strong>
            <span>${account.bankName}</span>
        </div>
        <div class="bank-account-preview-item">
            <strong>No. Rekening:</strong>
            <span>${formatAccountNumber(account.accountNumber)}</span>
        </div>
        <div class="bank-account-preview-item">
            <strong>Atas Nama:</strong>
            <span>${account.accountHolder}</span>
        </div>
        <div class="bank-account-preview-item">
            <strong>Status:</strong>
            <div class="status-value">
                <span class="status-badge-modal ${account.isActive ? 'status-active-modal' : 'status-inactive-modal'}">
                    ${account.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
            </div>
        </div>
    `;
    
    // Store account ID for deletion
    document.getElementById('deleteBankAccountModal').setAttribute('data-account-id', accountId);
    document.getElementById('deleteBankAccountModal').style.display = 'flex';
}

function confirmDeleteBankAccount() {
    const accountId = document.getElementById('deleteBankAccountModal').getAttribute('data-account-id');
    
    if (orderSystem.deleteBankAccount(accountId)) {
        showNotification('Rekening bank berhasil dihapus!', 'success');
        closeDeleteBankAccountModal();
        loadBankAccounts();
    } else {
        showNotification('Gagal menghapus rekening bank!', 'error');
    }
}

// Close modals
function closeModal() {
    document.getElementById('orderModal').style.display = 'none';
}

function closePaymentProofModal() {
    document.getElementById('paymentProofModal').style.display = 'none';
}

function closePackageModal() {
    document.getElementById('packageModal').style.display = 'none';
}

function closeBankAccountModal() {
    document.getElementById('bankAccountModal').style.display = 'none';
}

function closeEditOrderModal() {
    document.getElementById('editOrderModal').style.display = 'none';
}

function closeDeleteOrderModal() {
    document.getElementById('deleteOrderModal').style.display = 'none';
    document.getElementById('deleteOrderModal').removeAttribute('data-order-id');
}

function closeDeleteBankAccountModal() {
    document.getElementById('deleteBankAccountModal').style.display = 'none';
    document.getElementById('deleteBankAccountModal').removeAttribute('data-account-id');
}

// Helper function to get status text
function getStatusText(status) {
    const statusMap = {
        'pending': 'Menunggu Pembayaran',
        'paid': 'Sudah Bayar',
        'completed': 'Selesai',
        'cancelled': 'Dibatalkan'
    };
    return statusMap[status] || status;
}

// Helper function to format account number
function formatAccountNumber(accountNumber) {
    // Format: XXXX XXXX XXXX
    return accountNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
}