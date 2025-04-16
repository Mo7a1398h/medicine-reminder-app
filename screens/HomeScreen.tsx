import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: number;
  times: string[];
  notes: string;
}

export default function HomeScreen() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newMedicine, setNewMedicine] = useState<Medicine>({
    id: '',
    name: '',
    dosage: '',
    frequency: 1,
    times: [''],
    notes: '',
  });

  useEffect(() => {
    loadMedicines();
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('نحتاج إلى إذن الإشعارات لتذكيرك بمواعيد الدواء!');
      return;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  };

  const loadMedicines = async () => {
    try {
      const storedMedicines = await AsyncStorage.getItem('medicines');
      if (storedMedicines) {
        setMedicines(JSON.parse(storedMedicines));
      }
    } catch (error) {
      console.error('Error loading medicines:', error);
    }
  };

  const saveMedicine = async () => {
    if (!newMedicine.name || !newMedicine.dosage) {
      alert('الرجاء إدخال اسم الدواء والجرعة');
      return;
    }

    const medicineToSave = {
      ...newMedicine,
      id: Date.now().toString(),
    };

    const updatedMedicines = [...medicines, medicineToSave];
    try {
      await AsyncStorage.setItem('medicines', JSON.stringify(updatedMedicines));
      setMedicines(updatedMedicines);
      scheduleMedicineNotifications(medicineToSave);
      setModalVisible(false);
      setNewMedicine({
        id: '',
        name: '',
        dosage: '',
        frequency: 1,
        times: [''],
        notes: '',
      });
    } catch (error) {
      console.error('Error saving medicine:', error);
    }
  };

  const scheduleMedicineNotifications = async (medicine: Medicine) => {
    for (const time of medicine.times) {
      const [hours, minutes] = time.split(':');
      const trigger = new Date();
      trigger.setHours(parseInt(hours, 10));
      trigger.setMinutes(parseInt(minutes, 10));
      trigger.setSeconds(0);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'تذكير بالدواء',
          body: `حان وقت أخذ ${medicine.name} - ${medicine.dosage}`,
          sound: true,
        },
        trigger: {
          hour: parseInt(hours, 10),
          minute: parseInt(minutes, 10),
          repeats: true,
        },
      });
    }
  };

  const renderMedicineItem = ({ item }: { item: Medicine }) => (
    <View style={styles.medicineItem}>
      <Text style={styles.medicineName}>{item.name}</Text>
      <Text style={styles.medicineDosage}>{item.dosage}</Text>
      <Text style={styles.medicineTime}>
        {item.times.map(time => `${time}`).join(', ')}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={medicines}
        renderItem={renderMedicineItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ إضافة دواء</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>إضافة دواء جديد</Text>
          
          <TextInput
            style={styles.input}
            placeholder="اسم الدواء"
            value={newMedicine.name}
            onChangeText={text => setNewMedicine({ ...newMedicine, name: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="الجرعة"
            value={newMedicine.dosage}
            onChangeText={text => setNewMedicine({ ...newMedicine, dosage: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="ملاحظات"
            value={newMedicine.notes}
            onChangeText={text => setNewMedicine({ ...newMedicine, notes: text })}
            multiline
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSave]}
              onPress={saveMedicine}
            >
              <Text style={styles.buttonText}>حفظ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonCancel]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    flex: 1,
  },
  medicineItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  medicineDosage: {
    fontSize: 16,
    color: '#666',
  },
  medicineTime: {
    fontSize: 14,
    color: '#999',
  },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    margin: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalView: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonSave: {
    backgroundColor: '#2196F3',
  },
  buttonCancel: {
    backgroundColor: '#ff6b6b',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
