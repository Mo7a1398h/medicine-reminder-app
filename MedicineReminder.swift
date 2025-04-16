import SwiftUI
import UserNotifications

// نموذج البيانات للدواء
struct Medicine: Identifiable, Codable {
    var id = UUID()
    var name: String
    var dosage: String
    var frequency: Int // عدد المرات في اليوم
    var times: [Date]
    var notes: String
    var isActive: Bool
}

// نموذج البيانات للتذكير
struct Reminder: Identifiable, Codable {
    var id = UUID()
    var medicineId: UUID
    var time: Date
    var taken: Bool
}

// الشاشة الرئيسية
struct ContentView: View {
    @State private var medicines: [Medicine] = []
    @State private var showingAddMedicine = false
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            // علامة تبويب الأدوية
            NavigationView {
                List {
                    ForEach(medicines) { medicine in
                        MedicineRow(medicine: medicine)
                    }
                    .onDelete(perform: deleteMedicine)
                }
                .navigationTitle("الأدوية")
                .navigationBarItems(trailing:
                    Button(action: { showingAddMedicine = true }) {
                        Image(systemName: "plus")
                    }
                )
            }
            .tabItem {
                Image(systemName: "pills")
                Text("الأدوية")
            }
            .tag(0)
            
            // علامة تبويب التقويم
            CalendarView()
                .tabItem {
                    Image(systemName: "calendar")
                    Text("التقويم")
                }
                .tag(1)
            
            // علامة تبويب الإحصائيات
            StatisticsView()
                .tabItem {
                    Image(systemName: "chart.bar")
                    Text("الإحصائيات")
                }
                .tag(2)
        }
        .sheet(isPresented: $showingAddMedicine) {
            AddMedicineView(medicines: $medicines)
        }
    }
    
    func deleteMedicine(at offsets: IndexSet) {
        medicines.remove(atOffsets: offsets)
    }
}

// صف الدواء في القائمة
struct MedicineRow: View {
    let medicine: Medicine
    
    var body: some View {
        VStack(alignment: .leading) {
            Text(medicine.name)
                .font(.headline)
            Text("\(medicine.dosage) - \(medicine.frequency)x يومياً")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
    }
}

// شاشة إضافة دواء جديد
struct AddMedicineView: View {
    @Environment(\\.presentationMode) var presentationMode
    @Binding var medicines: [Medicine]
    
    @State private var name = ""
    @State private var dosage = ""
    @State private var frequency = 1
    @State private var times: [Date] = [Date()]
    @State private var notes = ""
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("معلومات الدواء")) {
                    TextField("اسم الدواء", text: $name)
                    TextField("الجرعة", text: $dosage)
                    Stepper("عدد المرات في اليوم: \(frequency)", value: $frequency, in: 1...10)
                }
                
                Section(header: Text("أوقات التذكير")) {
                    ForEach(0..<frequency, id: \.self) { index in
                        DatePicker(
                            "الوقت \(index + 1)",
                            selection: binding(for: index),
                            displayedComponents: .hourAndMinute
                        )
                    }
                }
                
                Section(header: Text("ملاحظات")) {
                    TextEditor(text: $notes)
                        .frame(height: 100)
                }
            }
            .navigationTitle("إضافة دواء جديد")
            .navigationBarItems(
                leading: Button("إلغاء") {
                    presentationMode.wrappedValue.dismiss()
                },
                trailing: Button("حفظ") {
                    saveMedicine()
                }
            )
        }
    }
    
    private func binding(for index: Int) -> Binding<Date> {
        Binding(
            get: { self.times[index] },
            set: { newValue in
                while self.times.count <= index {
                    self.times.append(Date())
                }
                self.times[index] = newValue
            }
        )
    }
    
    private func saveMedicine() {
        let medicine = Medicine(
            name: name,
            dosage: dosage,
            frequency: frequency,
            times: times,
            notes: notes,
            isActive: true
        )
        medicines.append(medicine)
        scheduleNotifications(for: medicine)
        presentationMode.wrappedValue.dismiss()
    }
    
    private func scheduleNotifications(for medicine: Medicine) {
        let center = UNUserNotificationCenter.current()
        
        // طلب إذن الإشعارات
        center.requestAuthorization(options: [.alert, .sound]) { granted, error in
            if granted {
                // جدولة الإشعارات لكل وقت
                for time in medicine.times {
                    let content = UNMutableNotificationContent()
                    content.title = "تذكير بالدواء"
                    content.body = "حان وقت أخذ \(medicine.name) - \(medicine.dosage)"
                    content.sound = .default
                    
                    let calendar = Calendar.current
                    let components = calendar.dateComponents([.hour, .minute], from: time)
                    let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: true)
                    
                    let request = UNNotificationRequest(
                        identifier: "\(medicine.id)-\(time)",
                        content: content,
                        trigger: trigger
                    )
                    
                    center.add(request)
                }
            }
        }
    }
}

// شاشة التقويم
struct CalendarView: View {
    var body: some View {
        NavigationView {
            Text("قريباً")
                .navigationTitle("التقويم")
        }
    }
}

// شاشة الإحصائيات
struct StatisticsView: View {
    @EnvironmentObject var medicineStore: MedicineStore
    
    // وظيفة لحفظ البيانات كـ JSON
    func saveToJSON() {
        let encoder = JSONEncoder()
        if let encoded = try? encoder.encode(medicineStore.medicines) {
            if let documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
                let fileURL = documentsDirectory.appendingPathComponent("medicines.json")
                try? encoded.write(to: fileURL)
            }
        }
    }
    
    // وظيفة لتحميل البيانات من JSON
    func loadFromJSON() {
        if let documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
            let fileURL = documentsDirectory.appendingPathComponent("medicines.json")
            if let data = try? Data(contentsOf: fileURL) {
                let decoder = JSONDecoder()
                if let medicines = try? decoder.decode([Medicine].self, from: data) {
                    medicineStore.medicines = medicines
                }
            }
        }
    }
    
    var completionRate: Double {
        guard !medicineStore.medicines.isEmpty else { return 0 }
        let takenCount = medicineStore.medicines.filter { $0.isTaken }.count
        return Double(takenCount) / Double(medicineStore.medicines.count) * 100
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // بطاقة نسبة الإنجاز
                    VStack {
                        Text("نسبة الالتزام بالأدوية")
                            .font(.headline)
                        Text(String(format: "%.1f%%", completionRate))
                            .font(.largeTitle)
                            .bold()
                            .foregroundColor(.blue)
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(10)
                    .shadow(radius: 2)
                    
                    // إحصائيات عامة
                    HStack {
                        StatCard(title: "إجمالي الأدوية",
                                value: String(medicineStore.medicines.count))
                        StatCard(title: "تم أخذها",
                                value: String(medicineStore.medicines.filter { $0.isTaken }.count))
                    }
                    
                    // رسم بياني للأيام السابقة
                    VStack(alignment: .leading) {
                        Text("آخر 7 أيام")
                            .font(.headline)
                            .padding(.leading)
                        
                        HStack(alignment: .bottom, spacing: 12) {
                            ForEach(0..<7) { day in
                                VStack {
                                    Rectangle()
                                        .fill(Color.blue)
                                        .frame(width: 30, height: 100 * CGFloat.random(in: 0.3...1.0))
                                    Text("يوم \(day + 1)")
                                        .font(.caption)
                                }
                            }
                        }
                        .padding()
                    }
                    .background(Color(.systemBackground))
                    .cornerRadius(10)
                    .shadow(radius: 2)
                }
                .padding()
            }
            .navigationTitle("الإحصائيات")
            .background(Color(.systemGroupedBackground))
        }
    }
}

// بطاقة إحصائيات
struct StatCard: View {
    let title: String
    let value: String
    
    var body: some View {
        VStack {
            Text(title)
                .font(.subheadline)
                .foregroundColor(.secondary)
            Text(value)
                .font(.title2)
                .bold()
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(10)
        .shadow(radius: 2)
}

// معاينة التطبيق
struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
