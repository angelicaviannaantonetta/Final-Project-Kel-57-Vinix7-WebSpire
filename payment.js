document.addEventListener('DOMContentLoaded', function() {
    const orderSummary = document.getElementById('orderSummary');
    const paymentForm = document.getElementById('paymentForm');
    const fileUpload = document.getElementById('fileUpload');
    const paymentProof = document.getElementById('paymentProof');
    const fileName = document.getElementById('fileName');
    
    // Get current order data
    const currentOrder = JSON.parse(localStorage.getItem('currentOrder'));
    
    if (!currentOrder) {
        showNotification('Data pemesanan tidak ditemukan!', 'error');
        setTimeout(() => {
            window.location.href = 'order.html';
        }, 2000);
        return;
    }
    
    // Display order summary
    const packageDetails = orderSystem.getPackageDetails(currentOrder.package);
    const price = packageDetails.price;
    
    orderSummary.innerHTML = `
        <h3>Detail Pemesanan</h3>
        <div class="summary-item">
            <span>Nama:</span>
            <span>${currentOrder.name}</span>
        </div>
        <div class="summary-item">
            <span>Email:</span>
            <span>${currentOrder.email}</span>
        </div>
        <div class="summary-item">
            <span>No. WhatsApp:</span>
            <span>${currentOrder.phone}</span>
        </div>
        <div class="summary-item">
            <span>Paket:</span>
            <span>${packageDetails.name}</span>
        </div>
        <div class="summary-item">
            <span>Jadwal Meeting:</span>
            <span>${new Date(currentOrder.meetingDate).toLocaleString('id-ID')}</span>
        </div>
        <div class="summary-item">
            <span>Total Pembayaran:</span>
            <span>${formatCurrency(price)}</span>
        </div>
    `;
    
    // File upload handling
    fileUpload.addEventListener('click', function() {
        paymentProof.click();
    });
    
    paymentProof.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            fileName.textContent = file.name;
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showNotification('Ukuran file terlalu besar! Maksimal 5MB.', 'error');
                paymentProof.value = '';
                fileName.textContent = 'Belum ada file yang dipilih';
                return;
            }
            
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                showNotification('Format file tidak didukung! Gunakan JPG, PNG, atau PDF.', 'error');
                paymentProof.value = '';
                fileName.textContent = 'Belum ada file yang dipilih';
                return;
            }
        }
    });
    
    // Form submission
    paymentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const file = paymentProof.files[0];
        const notes = document.getElementById('notes').value;
        
        if (!file) {
            showNotification('Harap upload bukti pembayaran!', 'error');
            return;
        }
        
        // Read file as data URL
        const reader = new FileReader();
        reader.onload = function(e) {
            const fileData = {
                name: file.name,
                type: file.type,
                data: e.target.result,
                uploadedAt: new Date().toISOString(),
                size: file.size
            };
            
            // Create order in system
            const orderData = {
                ...currentOrder,
                packagePrice: price,
                notes: notes,
                meetingDate: currentOrder.meetingDate
            };
            
            const order = orderSystem.createOrder(orderData);
            orderSystem.addPaymentProof(order.id, fileData);
            
            // Clear temporary data
            localStorage.removeItem('currentOrder');
            
            showNotification('Pembayaran berhasil dikonfirmasi! Tim kami akan menghubungi Anda dalam 1x24 jam.');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
        };
        
        reader.onerror = function() {
            showNotification('Gagal membaca file! Silakan coba lagi.', 'error');
        };
        
        reader.readAsDataURL(file);
    });
});