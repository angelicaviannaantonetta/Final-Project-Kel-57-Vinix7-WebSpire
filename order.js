document.addEventListener('DOMContentLoaded', function() {
    const orderForm = document.getElementById('orderForm');
    const packageSelect = document.getElementById('package');
    
    // Load packages into select
    const packages = orderSystem.getPackages();
    packageSelect.innerHTML = '<option value="">Pilih Paket</option>' + 
        packages.map(pkg => `
            <option value="${pkg.id}">${pkg.name} - ${formatCurrency(pkg.price)}</option>
        `).join('');
    
    // Set minimum date for meeting (tomorrow)
    const meetingDate = document.getElementById('meetingDate');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    meetingDate.min = tomorrow.toISOString().slice(0, 16);
    
    // Pre-select package from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const packageParam = urlParams.get('package');
    if (packageParam) {
        packageSelect.value = packageParam;
    }
    
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            package: document.getElementById('package').value,
            description: document.getElementById('description').value,
            meetingDate: document.getElementById('meetingDate').value
        };
        
        // Validate form
        if (!formData.name || !formData.email || !formData.phone || !formData.package || !formData.description || !formData.meetingDate) {
            showNotification('Harap lengkapi semua field yang wajib diisi!', 'error');
            return;
        }
        
        // Save order data to localStorage temporarily
        localStorage.setItem('currentOrder', JSON.stringify(formData));
        
        // Redirect to payment page
        window.location.href = 'payment.html';
    });
});