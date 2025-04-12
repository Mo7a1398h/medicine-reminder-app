// الحصول على العناصر
const addMedicineBtn = document.getElementById('addMedicineBtn');
const addMedicineModal = document.getElementById('addMedicineModal');
const addMedicineForm = document.getElementById('addMedicineForm');
const cancelAddBtn = document.getElementById('cancelAdd');
const medicinesList = document.getElementById('medicinesList');

// إعداد التنبيهات
let notificationSound = new Audio('notification.mp3');
let notificationPermission = false;

// طلب إذن التنبيهات
async function requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();
        notificationPermission = permission === 'granted';
        return notificationPermission;
    } catch (error) {
        console.error('خطأ في طلب إذن التنبيهات:', error);
        return false;
    }
}

// إنشاء تنبيه
function createNotification(medicine) {
    if (!notificationPermission) return;
    
    const notification = new Notification('تذكير بموعد الدواء', {
        body: `حان موعد أخذ ${medicine.name}\nالجرعة: ${medicine.dosage}`,
        icon: 'icons/icon.svg',
        badge: 'icons/icon.svg',
        dir: 'rtl',
        lang: 'ar',
        vibrate: [200, 100, 200]
    });

    // تشغيل الصوت
    notificationSound.play();
    
    notification.onclick = () => {
        window.focus();
        notification.close();
    };
}

// فحص التنبيهات
function checkNotifications() {
    const now = new Date();
    medicines.forEach(medicine => {
        const nextDose = new Date(medicine.nextDose);
        const timeDiff = nextDose - now;
        
        // إذا كان الوقت المتبقي أقل من دقيقة
        if (timeDiff >= 0 && timeDiff <= 60000) {
            createNotification(medicine);
        }
    });
}

// طلب إذن التنبيهات عند تحميل الصفحة
window.addEventListener('load', async () => {
    await requestNotificationPermission();
});

// فحص التنبيهات كل 30 ثانية
setInterval(checkNotifications, 30000);

// قائمة الأدوية
let medicines = JSON.parse(localStorage.getItem('medicines')) || [];

// إظهار النموذج
addMedicineBtn.addEventListener('click', () => {
    addMedicineModal.style.display = 'block';
});

// إخفاء النموذج
cancelAddBtn.addEventListener('click', () => {
    addMedicineModal.style.display = 'none';
    addMedicineForm.reset();
});

// إضافة وقت جديد
document.querySelector('.add-time').addEventListener('click', () => {
    const container = document.getElementById('timesContainer');
    const timeInput = document.createElement('input');
    timeInput.type = 'time';
    timeInput.className = 'time-input';
    timeInput.required = true;
    container.insertBefore(timeInput, container.lastElementChild);
});

// حفظ الدواء الجديد
addMedicineForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // جمع البيانات
    const medicineName = document.getElementById('medicineName').value;
    const dosage = document.getElementById('dosage').value;
    const frequency = document.getElementById('frequency').value;
    const notes = document.getElementById('notes').value;
    
    // جمع الأوقات
    const times = [];
    document.querySelectorAll('.time-input').forEach(input => {
        if (input.value) times.push(input.value);
    });
    
    // إنشاء كائن الدواء
    const medicine = {
        id: Date.now(),
        name: medicineName,
        dosage: dosage,
        frequency: frequency,
        times: times.sort(),  // ترتيب الأوقات تصاعدياً
        notes: notes,
        createdAt: new Date().toISOString(),
        nextDose: calculateNextDose(times, frequency)
    };
    
    // إضافة الدواء للقائمة
    medicines.push(medicine);
    saveMedicines();
    renderMedicines();
    
    // إغلاق النموذج
    addMedicineModal.style.display = 'none';
    addMedicineForm.reset();
});

// حساب موعد الجرعة التالية
function calculateNextDose(times, frequency) {
    const now = new Date();
    let nextDose = null;
    
    // تحويل جميع الأوقات إلى تواريخ كاملة
    const doseTimes = times.map(time => {
        const [hours, minutes] = time.split(':');
        const doseTime = new Date();
        doseTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        // إذا كان الوقت قد مر اليوم
        if (doseTime < now) {
            switch(frequency) {
                case 'daily':
                    doseTime.setDate(doseTime.getDate() + 1);
                    break;
                case 'weekly':
                    doseTime.setDate(doseTime.getDate() + 7);
                    break;
                case 'monthly':
                    doseTime.setMonth(doseTime.getMonth() + 1);
                    break;
            }
        }
        return doseTime;
    });
    
    // البحث عن أقرب موعد
    nextDose = doseTimes.reduce((closest, current) => {
        if (!closest) return current;
        return current < closest ? current : closest;
    });
    
    return nextDose.toISOString();
}

// حفظ الأدوية في التخزين المحلي
function saveMedicines() {
    localStorage.setItem('medicines', JSON.stringify(medicines));
}

// عرض الأدوية
function renderMedicines() {
    medicinesList.innerHTML = '';
    
    medicines.forEach(medicine => {
        const card = document.createElement('div');
        card.className = 'medicine-card';
        
        // تحديث موعد الجرعة التالية
        const now = new Date();
        const nextDose = new Date(medicine.nextDose);
        if (nextDose < now) {
            medicine.nextDose = calculateNextDose(medicine.times, medicine.frequency);
            saveMedicines();
        }
        
        const timeUntilNext = getTimeUntilNext(new Date(medicine.nextDose));
        
        // تنسيق أوقات الجرعات
        const formattedTimes = medicine.times.map(time => {
            const [hours, minutes] = time.split(':');
            const date = new Date();
            date.setHours(hours, minutes, 0);
            return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
        });
        
        card.innerHTML = `
            <h3>${medicine.name}</h3>
            <div class="medicine-info">
                <p><i class="fas fa-prescription-bottle"></i> ${medicine.dosage}</p>
                <p><i class="fas fa-clock"></i> المواعيد:</p>
                <div class="dose-times">
                    ${formattedTimes.map(time => `<span class="time-badge">${time}</span>`).join('')}
                </div>
                <p><i class="fas fa-calendar"></i> ${getFrequencyText(medicine.frequency)}</p>
                ${medicine.notes ? `<p><i class="fas fa-sticky-note"></i> ${medicine.notes}</p>` : ''}
                <p class="next-dose ${timeUntilNext.includes('متأخر') ? 'late' : ''}"><i class="fas fa-hourglass-half"></i> الجرعة التالية: ${timeUntilNext}</p>
            </div>
            <div class="card-actions">
                <button class="btn-primary take-dose" onclick="takeDose(${medicine.id})">
                    <i class="fas fa-check"></i> تم أخذ الجرعة
                </button>
                <button class="btn-danger" onclick="deleteMedicine(${medicine.id})">
                    <i class="fas fa-trash"></i> حذف
                </button>
            </div>
        `;
        
        medicinesList.appendChild(card);
    });
}

// حساب الوقت المتبقي للجرعة التالية
function getTimeUntilNext(nextDose) {
    const now = new Date();
    const diff = nextDose - now;
    
    if (diff < 0) return 'متأخر';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `بعد ${days} يوم`;
    }
    
    return `بعد ${hours} ساعة و ${minutes} دقيقة`;
}

// تحويل التكرار إلى نص
function getFrequencyText(frequency) {
    const frequencies = {
        daily: 'يومياً',
        weekly: 'أسبوعياً',
        monthly: 'شهرياً'
    };
    return frequencies[frequency];
}

// حذف دواء
function deleteMedicine(id) {
    if (confirm('هل أنت متأكد من حذف هذا الدواء؟')) {
        medicines = medicines.filter(m => m.id !== id);
        saveMedicines();
        renderMedicines();
    }
}

// تحديث عرض الأدوية كل دقيقة
setInterval(renderMedicines, 60000);

// عرض الأدوية عند تحميل الصفحة
renderMedicines();

// تسجيل Service Worker للتنبيهات في الخلفية
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('service-worker.js');
            console.log('Service Worker مسجل:', registration);
        } catch (error) {
            console.error('خطأ في تسجيل Service Worker:', error);
        }
    });
}
