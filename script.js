// الحصول على العناصر
const addMedicineBtn = document.getElementById('addMedicineBtn');
const addMedicineModal = document.getElementById('addMedicineModal');
const addMedicineForm = document.getElementById('addMedicineForm');
const cancelAddBtn = document.getElementById('cancelAdd');
const medicinesList = document.getElementById('medicinesList');

// تهيئة الأصوات
const sounds = {
    beep: new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'),
    bell: new Audio('https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3'),
    chime: new Audio('https://assets.mixkit.co/active_storage/sfx/1862/1862-preview.mp3'),
    ding: new Audio('https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3'),
    notification: new Audio('https://assets.mixkit.co/active_storage/sfx/2867/2867-preview.mp3'),
    alert: new Audio('https://assets.mixkit.co/active_storage/sfx/2866/2866-preview.mp3'),
    soft: new Audio('https://assets.mixkit.co/active_storage/sfx/2868/2868-preview.mp3'),
    melody: new Audio('https://assets.mixkit.co/active_storage/sfx/956/956-preview.mp3'),
    crystal: new Audio('https://assets.mixkit.co/active_storage/sfx/954/954-preview.mp3'),
    digital: new Audio('https://assets.mixkit.co/active_storage/sfx/2865/2865-preview.mp3')
};

Object.values(sounds).forEach(sound => {
    sound.preload = 'auto';
});

// قائمة الأدوية
let medicines = JSON.parse(localStorage.getItem('medicines')) || [];

// عناصر نموذج إضافة الدواء
const medicineNameInput = document.getElementById('medicineName');
const dosageInput = document.getElementById('dosage');
const frequencySelect = document.getElementById('frequency');
const timesContainer = document.getElementById('timesContainer');
const notesInput = document.getElementById('notes');

// إظهار النموذج
const showAddMedicineModal = () => {
    addMedicineModal.style.display = 'block';
};

// إغلاق النموذج
const closeAddMedicineModal = () => {
    addMedicineModal.style.display = 'none';
    addMedicineForm.reset();
};

// إضافة حقل وقت جديد
const addTimeInput = () => {
    const timeGroup = document.createElement('div');
    timeGroup.className = 'time-group';
    
    const timeInput = document.createElement('input');
    timeInput.type = 'time';
    timeInput.className = 'time-input';
    timeInput.required = true;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-time';
    deleteBtn.innerHTML = '×';
    deleteBtn.onclick = () => {
        timeGroup.remove();
    };
    
    timeGroup.appendChild(timeInput);
    timeGroup.appendChild(deleteBtn);
    timesContainer.appendChild(timeGroup);
};

// حساب موعد الجرعة التالية
function calculateNextDose(times, frequency) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // تحويل الأوقات إلى تواريخ
    const doseTimes = times.map(time => {
        const [hours, minutes] = time.split(':');
        const date = new Date(today);
        date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return date;
    }).sort((a, b) => a - b);
    
    // البحث عن أقرب موعد
    for (const time of doseTimes) {
        if (time > now) {
            return time.toISOString();
        }
    }
    
    // إذا لم نجد موعداً اليوم، نضيف يوماً
    const nextDose = new Date(doseTimes[0]);
    nextDose.setDate(nextDose.getDate() + 1);
    return nextDose.toISOString();
}

// حفظ الأدوية
function saveMedicines() {
    localStorage.setItem('medicines', JSON.stringify(medicines));
}

// حساب الوقت المتبقي للجرعة التالية
function calculateRemainingTime(medicine) {
    if (medicine.frequency !== 'daily' || !medicine.times || medicine.times.length === 0) {
        return null;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    // تحويل جميع الأوقات إلى دقائق
    const timesInMinutes = medicine.times.map(time => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    });

    // البحث عن الوقت التالي
    let nextDoseTime = timesInMinutes.find(time => time > currentTime);
    
    // إذا لم يتم العثور على وقت تالي، فهذا يعني أن الجرعة التالية في اليوم التالي
    if (!nextDoseTime) {
        nextDoseTime = timesInMinutes[0] + 24 * 60; // إضافة 24 ساعة
    }

    const remainingMinutes = nextDoseTime - currentTime;
    const hours = Math.floor(remainingMinutes / 60);
    const minutes = remainingMinutes % 60;

    return { hours, minutes };
}

// عرض الأدوية
function renderMedicines() {
    medicinesList.innerHTML = '';
    
    if (medicines.length === 0) {
        medicinesList.innerHTML = `
            <div class="empty-state">
                <p>لم تقم بإضافة أي دواء بعد</p>
            </div>
        `;
        return;
    }
    
    medicines.forEach(medicine => {
        const card = document.createElement('div');
        card.className = 'medicine-card';
        
        const remainingTime = calculateRemainingTime(medicine);
        const remainingTimeText = remainingTime ? 
            `<div class="next-dose">
                <i class="fas fa-clock"></i>
                الوقت المتبقي للجرعة التالية: ${remainingTime.hours} ساعة و ${remainingTime.minutes} دقيقة
            </div>` : '';
        
        card.innerHTML = `
            <div class="medicine-header">
                <h3>${medicine.name}</h3>
                <button onclick="deleteMedicine(${medicine.id})" class="btn-icon delete-btn">×</button>
            </div>
            <div class="medicine-info">
                <p>الجرعة: ${medicine.dosage}</p>
                <p>المواعيد:</p>
                <div class="dose-times">
                    ${medicine.times.map(time => `<span class="time-badge">${time}</span>`).join('')}
                </div>
                ${remainingTimeText}
                <p>التكرار: ${medicine.frequency === 'daily' ? 'يومياً' : 'حسب الحاجة'}</p>
                ${medicine.notes ? `<p>ملاحظات: ${medicine.notes}</p>` : ''}
                <p>التنبيه الصوتي: ${medicine.soundEnabled ? 'مفعل' : 'غير مفعل'}</p>
            </div>
        `;
        
        medicinesList.appendChild(card);
    });
}

// حذف دواء
function deleteMedicine(id) {
    if (confirm('هل أنت متأكد من حذف هذا الدواء؟')) {
        medicines = medicines.filter(m => m.id !== id);
        saveMedicines();
        renderMedicines();
    }
}

// إضافة مستمع لزر الإضافة
addMedicineBtn.addEventListener('click', () => {
    // إضافة حقل وقت واحد على الأقل
    timesContainer.innerHTML = '';
    addTimeInput();
    showAddMedicineModal();
});

// إضافة مستمع لزر الإلغاء
cancelAddBtn.addEventListener('click', closeAddMedicineModal);

// إضافة مستمع لنموذج إضافة الدواء
addMedicineForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const times = Array.from(timesContainer.querySelectorAll('input[type="time"]'))
        .map(input => input.value);
    
    if (times.length === 0) {
        alert('يجب إضافة وقت واحد على الأقل');
        return;
    }
    
    const medicine = {
        id: Date.now(),
        name: medicineNameInput.value,
        dosage: dosageInput.value,
        frequency: frequencySelect.value,
        times: times,
        notes: notesInput.value,
        soundEnabled: document.getElementById('soundEnabled').checked,
        soundType: document.getElementById('soundType').value,
        nextDose: calculateNextDose(times, frequencySelect.value)
    };
    
    medicines.push(medicine);
    saveMedicines();
    renderMedicines();
    
    closeAddMedicineModal();
    showNotification(`تم إضافة ${medicine.name} بنجاح`);
});

// إضافة مستمع لزر إضافة وقت جديد
const addTimeBtn = document.querySelector('.add-time');
if (addTimeBtn) {
    addTimeBtn.addEventListener('click', addTimeInput);
}

// إظهار/إخفاء خيارات الصوت
document.getElementById('soundEnabled').addEventListener('change', function() {
    const soundOptions = document.getElementById('soundOptions');
    soundOptions.style.display = this.checked ? 'block' : 'none';
});

// تجربة الصوت
function testSound() {
    const soundType = document.getElementById('soundType').value;
    if (sounds[soundType]) {
        sounds[soundType].currentTime = 0;
        sounds[soundType].play();
    }
}
addTimeInput();

// إدارة شريط التنقل
let currentView = 'medicines';
const views = ['medicinesView', 'calendarView', 'reportsView', 'settingsView', 'quantityView'];
const bottomNavItems = document.querySelectorAll('.bottom-nav-item');

// تبديل العرض
function switchView(view) {
    if (!views.includes(view)) return;
    
    // إخفاء جميع العروض
    views.forEach(v => {
        const element = document.getElementById(v);
        if (element) {
            element.style.display = 'none';
        }
    });
    
    // إظهار العرض المحدد
    const selectedView = document.getElementById(view);
    if (selectedView) {
        selectedView.style.display = 'block';
    }
    
    // تحديث القائمة النشطة
    bottomNavItems.forEach(item => {
        const targetView = item.getAttribute('data-view');
        if (targetView === view) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // تحديث العرض المحدد
    if (view === 'calendarView') {
        updateCalendar();
    } else if (view === 'reportsView') {
        updateReports();
    } else if (view === 'settingsView') {
        updateMedicineSettings();
    } else if (view === 'quantityView') {
        updateMedicineQuantities();
    }

    currentView = view;
}

// إضافة مستمعات للقائمة
bottomNavItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-view');
        switchView(view);
    });
});

// إدارة التقويم
let currentDate = new Date();
const calendarGrid = document.getElementById('calendarGrid');
const currentMonthElement = document.getElementById('currentMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');

// تشغيل التنبيه الصوتي
function playNotificationSound(medicine) {
    if (medicine.soundEnabled && medicine.soundType && sounds[medicine.soundType]) {
        sounds[medicine.soundType].play().catch(error => {
            console.error('خطأ في تشغيل الصوت:', error);
        });
    }
}

// تجربة الصوت
function testSound() {
    const soundType = document.getElementById('soundType').value;
    if (sounds[soundType]) {
        sounds[soundType].play().catch(error => {
            console.error('خطأ في تشغيل الصوت:', error);
        });
    }
}

// إظهار/إخفاء خيارات الصوت
document.getElementById('soundEnabled').addEventListener('change', function() {
    const soundOptions = document.getElementById('soundOptions');
    if (this.checked) {
        soundOptions.style.display = 'block';
        soundOptions.classList.add('visible');
    } else {
        soundOptions.style.display = 'none';
        soundOptions.classList.remove('visible');
    }
});

// تحديث التقويم
function updateCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    const today = new Date();

    // تحديث عنوان الشهر
    currentMonthElement.textContent = currentDate.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' });

    // إنشاء شبكة التقويم
    calendarGrid.innerHTML = '';
    
    // إضافة أيام الأسبوع
    const daysHeader = document.createElement('div');
    daysHeader.className = 'calendar-days-header';
    const weekDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    weekDays.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-weekday';
        dayElement.textContent = day;
        daysHeader.appendChild(dayElement);
    });
    calendarGrid.appendChild(daysHeader);

    // إضافة الأيام السابقة من الشهر السابق
    const prevLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.innerHTML = `<span class="day-number">${prevLastDay - i}</span>`;
        
        const dayContent = document.createElement('div');
        dayContent.className = 'day-content';
        
        day.appendChild(dayHeader);
        day.appendChild(dayContent);
        calendarGrid.appendChild(day);
    }

    // إضافة أيام الشهر الحالي
    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day';
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.innerHTML = `<span class="day-number">${i}</span>`;
        
        const dayContent = document.createElement('div');
        dayContent.className = 'day-content';

        // التحقق من اليوم الحالي
        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            day.classList.add('today');
        }

        // التحقق من وجود أدوية في هذا اليوم
        const currentDay = new Date(year, month, i);
        const dayMedicines = medicines.filter(medicine => {
            if (medicine.frequency === 'daily') return true;
            
            const nextDose = new Date(medicine.nextDose);
            return nextDose.getDate() === currentDay.getDate() &&
                   nextDose.getMonth() === currentDay.getMonth() &&
                   nextDose.getFullYear() === currentDay.getFullYear();
        });

        if (dayMedicines.length > 0) {
            day.classList.add('has-medicine');
            
            // إضافة الأدوية لليوم
            dayMedicines.forEach(medicine => {
                const medicineItem = document.createElement('div');
                medicineItem.className = 'medicine-item';
                medicineItem.innerHTML = `
                    <span class="medicine-time">${medicine.times[0]}</span>
                    ${medicine.name}
                `;
                dayContent.appendChild(medicineItem);
            });

            day.addEventListener('click', () => showDayMedicines(dayMedicines, currentDay));
        }

        day.appendChild(dayHeader);
        day.appendChild(dayContent);
        calendarGrid.appendChild(day);
    }

    // إضافة الأيام الأولى من الشهر التالي
    const daysNeeded = 42 - (startingDay + daysInMonth);
    for (let i = 1; i <= daysNeeded; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.innerHTML = `<span class="day-number">${i}</span>`;
        
        const dayContent = document.createElement('div');
        dayContent.className = 'day-content';
        
        day.appendChild(dayHeader);
        day.appendChild(dayContent);
        calendarGrid.appendChild(day);
    }
}

// عرض أدوية اليوم
function showDayMedicines(medicines, date) {
    // إزالة القائمة السابقة إن وجدت
    const oldContainer = document.querySelector('.calendar-medicines');
    if (oldContainer) {
        oldContainer.remove();
    }

    const medicinesContainer = document.createElement('div');
    medicinesContainer.className = 'calendar-medicines';

    const title = document.createElement('h3');
    title.textContent = `أدوية ${date.getDate()} ${date.toLocaleDateString('ar-SA', { month: 'long' })}`;
    medicinesContainer.appendChild(title);

    medicines.forEach(medicine => {
        const item = document.createElement('div');
        item.className = 'calendar-medicine-item';

        const info = document.createElement('div');
        info.className = 'calendar-medicine-info';

        const name = document.createElement('div');
        name.className = 'calendar-medicine-name';
        name.textContent = medicine.name;

        const time = document.createElement('div');
        time.className = 'calendar-medicine-time';
        time.textContent = medicine.times.join(' - ');

        info.appendChild(name);
        info.appendChild(time);
        item.appendChild(info);
        medicinesContainer.appendChild(item);
    });

    document.getElementById('calendarView').appendChild(medicinesContainer);
}


// إضافة مستمعات للتقويم
prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
});

// إدارة التقارير
function updateReports() {
    const reportsContainer = document.getElementById('reportsContainer');
    if (!reportsContainer) return;

    // حساب إحصائيات الأدوية
    const totalMedicines = medicines.length;
    const totalDoses = medicines.reduce((total, medicine) => {
        return total + medicine.times.length;
    }, 0);

    // تجميع الأدوية حسب التكرار
    const frequencyStats = medicines.reduce((stats, medicine) => {
        stats[medicine.frequency] = (stats[medicine.frequency] || 0) + 1;
        return stats;
    }, {});

    // إنشاء التقرير
    reportsContainer.innerHTML = `
        <div class="report-card">
            <h3>إحصائيات عامة</h3>
            <p>عدد الأدوية: ${totalMedicines}</p>
            <p>مجموع الجرعات اليومية: ${totalDoses}</p>
        </div>
        <div class="report-card">
            <h3>التكرار</h3>
            ${Object.entries(frequencyStats).map(([frequency, count]) => `
                <p>${frequency === 'daily' ? 'يومياً' : 'حسب الحاجة'}: ${count}</p>
            `).join('')}
        </div>
    `;
}



// تحديث قائمة الأدوية في الإعدادات
function updateMedicineSettings() {
    const medicineSettings = document.getElementById('medicineSettings');
    if (!medicineSettings) return;

    medicineSettings.innerHTML = '';

    if (medicines.length === 0) {
        medicineSettings.innerHTML = `
            <div class="empty-state">
                <p>لم تقم بإضافة أي دواء بعد</p>
            </div>
        `;
        return;
    }

    medicines.forEach(medicine => {
        const item = document.createElement('div');
        item.className = 'medicine-settings-item';
        
        item.innerHTML = `
            <div class="medicine-settings-info">
                <h4>${medicine.name}</h4>
                <p>الجرعة: ${medicine.dosage}</p>
            </div>
            <div class="medicine-settings-actions">
                <button class="btn-edit" onclick="editMedicine(${medicine.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;
        
        medicineSettings.appendChild(item);
    });
}

// تعديل الدواء
function editMedicine(id) {
    const medicine = medicines.find(m => m.id === id);
    if (!medicine) return;

    // ملء النموذج ببيانات الدواء
    medicineNameInput.value = medicine.name;
    dosageInput.value = medicine.dosage;
    frequencySelect.value = medicine.frequency;
    notesInput.value = medicine.notes || '';
    document.getElementById('soundEnabled').checked = medicine.soundEnabled;
    document.getElementById('soundType').value = medicine.soundType || 'notification';
    document.getElementById('soundOptions').classList.toggle('visible', medicine.soundEnabled);

    // إزالة جميع حقول الوقت
    timesContainer.innerHTML = '';

    // إضافة حقول الوقت الحالية
    medicine.times.forEach(time => {
        const timeGroup = document.createElement('div');
        timeGroup.className = 'time-group';
        
        const timeInput = document.createElement('input');
        timeInput.type = 'time';
        timeInput.className = 'time-input';
        timeInput.required = true;
        timeInput.value = time;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'delete-time';
        deleteBtn.innerHTML = '×';
        deleteBtn.onclick = () => {
            timeGroup.remove();
        };
        
        timeGroup.appendChild(timeInput);
        timeGroup.appendChild(deleteBtn);
        timesContainer.appendChild(timeGroup);
    });

    // تغيير سلوك النموذج لتحديث الدواء بدلاً من إضافة دواء جديد
    addMedicineForm.onsubmit = (e) => {
        e.preventDefault();
        
        // تحديث بيانات الدواء
        medicine.name = medicineNameInput.value;
        medicine.dosage = dosageInput.value;
        medicine.frequency = frequencySelect.value;
        medicine.times = Array.from(document.querySelectorAll('.time-input')).map(input => input.value);
        medicine.notes = notesInput.value;
        medicine.soundEnabled = document.getElementById('soundEnabled').checked;
        medicine.soundType = document.getElementById('soundType').value;
        medicine.nextDose = calculateNextDose(medicine.times, medicine.frequency);
        
        saveMedicines();
        closeAddMedicineModal();
        renderMedicines();
        updateMedicineSettings();
    };

    // فتح النموذج
    showAddMedicineModal();
}

// وظيفة تحديث كميات الأدوية
function updateMedicineQuantities() {
    const medicineQuantityList = document.getElementById('medicineQuantityList');
    medicineQuantityList.innerHTML = '';

    if (medicines.length === 0) {
        medicineQuantityList.innerHTML = `
            <div class="empty-state">
                <p>لم تقم بإضافة أي دواء بعد</p>
            </div>
        `;
        return;
    }

    medicines.forEach(medicine => {
        const item = document.createElement('div');
        item.className = 'medicine-quantity-item';

        const quantityClass = medicine.remainingQuantity <= medicine.threshold ? 'low' : '';

        item.innerHTML = `
            <div class="medicine-quantity-header">
                <div class="medicine-quantity-name">${medicine.name}</div>
            </div>
            <div class="medicine-quantity-info">
                <div class="medicine-quantity-input">
                    <input type="number" 
                           value="${medicine.remainingQuantity || 0}" 
                           min="0" 
                           onchange="updateQuantity(${medicine.id}, this.value)">
                    <span class="medicine-quantity-unit">${medicine.unit || 'حبة'}</span>
                </div>
                <div class="medicine-quantity-threshold ${quantityClass}">
                    التنبيه عند: ${medicine.threshold || 5}
                </div>
            </div>
        `;

        medicineQuantityList.appendChild(item);
    });
}

// وظيفة تحديث الكمية
function updateQuantity(id, newQuantity) {
    const medicine = medicines.find(m => m.id === id);
    if (!medicine) return;

    const quantity = parseInt(newQuantity);
    if (!isNaN(quantity) && quantity >= 0) {
        medicine.remainingQuantity = quantity;
        saveMedicines();

        if (quantity <= medicine.threshold) {
            showNotification(`تنبيه: الكمية المتبقية من ${medicine.name} منخفضة (${quantity} ${medicine.unit || 'حبة'})`);
        }
    }
}


// إعداد أزرار الألوان
document.querySelectorAll('.theme-color').forEach(button => {
    const gradient = button.dataset.gradient;
    button.style.setProperty('--gradient', gradient);
    
    button.addEventListener('click', () => {
        // إزالة التنشيط من جميع الأزرار
        document.querySelectorAll('.theme-color').forEach(btn => btn.classList.remove('active'));
        
        // تنشيط الزر المختار
        button.classList.add('active');
        
        // تطبيق التدرج اللوني على الخلفية
        document.documentElement.style.setProperty('--gradient-background', gradient);
        
        // إعادة تطبيق الخلفية للتأكد من التغيير
        document.body.style.background = gradient;
        
        // حفظ التفضيل في localStorage
        localStorage.setItem('theme-gradient', gradient);
    });
});

// استعادة التفضيل المحفوظ
const savedGradient = localStorage.getItem('theme-gradient');
if (savedGradient) {
    document.documentElement.style.setProperty('--gradient-background', savedGradient);
    document.body.style.background = savedGradient;
    const activeButton = document.querySelector(`[data-gradient="${savedGradient}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

// تحديث الوقت المتبقي كل دقيقة
setInterval(renderMedicines, 60000);

// عرض الأدوية عند تحميل الصفحة
renderMedicines();
switchView('medicinesView');
