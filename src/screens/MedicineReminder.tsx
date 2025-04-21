import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { NotificationService } from '../utils/NotificationService';
import { Card, Title, TextInput, Button, List, IconButton } from 'react-native-paper';
import { TimePickerComponent } from '../components/TimePickerComponent';
import { NotificationSettings } from '../components/NotificationSettings';

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  remainingCount: number;
  time: Date;
  sound: 'bell' | 'chime' | 'crystal' | 'digital' | 'melody';
  vibration: boolean;
  repeatType: 'once' | 'daily';
  notificationId?: string;
}

export const MedicineReminder = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [newMedicine, setNewMedicine] = useState<Medicine>({
    id: Date.now().toString(),
    name: '',
    dosage: '',
    remainingCount: 0,
    time: new Date(),
    sound: 'bell',
    vibration: true,
    repeatType: 'daily',
  });
  const [selectedSound, setSelectedSound] = useState('bell');
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [repeatType, setRepeatType] = useState<'once' | 'daily'>('daily');

  const addMedicine = async () => {
    try {
      const notificationId = await NotificationService.scheduleNotification(
        `وقت الدواء: ${newMedicine.name}`,
        `حان موعد أخذ ${newMedicine.dosage} من ${newMedicine.name}`,
        newMedicine.time,
        selectedSound,
        vibrationEnabled,
        repeatType
      );

      const medicineWithNotification = {
        ...newMedicine,
        notificationId,
      };

      setMedicines([...medicines, medicineWithNotification]);
      setNewMedicine({
        id: Date.now().toString(),
        name: '',
        dosage: '',
        remainingCount: 0,
        time: new Date(),
        sound: 'bell',
        vibration: true,
        repeatType: 'daily',
      });

      Alert.alert('نجاح', 'تم إضافة التذكير بنجاح');
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء إضافة التذكير');
      console.error(error);
    }
    setMedicines([...medicines, newMedicine]);
    setNewMedicine({
      id: Date.now().toString(),
      name: '',
      dosage: '',
      remainingCount: 0,
      time: new Date(),
      sound: 'bell',
      vibration: true,
      repeatType: 'daily',
    });
  };

  const editMedicine = (medicine: Medicine) => {
    setNewMedicine(medicine);
    setMedicines(medicines.filter(m => m.id !== medicine.id));
  };

  const deleteMedicine = async (id: string) => {
    try {
      const medicine = medicines.find(m => m.id === id);
      if (medicine?.notificationId) {
        await NotificationService.cancelNotification(medicine.notificationId);
      }
      setMedicines(medicines.filter(m => m.id !== id));
      Alert.alert('نجاح', 'تم حذف التذكير بنجاح');
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء حذف التذكير');
      console.error(error);
    }
    setMedicines(medicines.filter(m => m.id !== id));
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>إضافة دواء جديد</Title>
          <TextInput
            label="اسم الدواء"
            value={newMedicine.name}
            onChangeText={(text) => setNewMedicine({ ...newMedicine, name: text })}
            style={styles.input}
          />
          <TextInput
            label="الجرعة"
            value={newMedicine.dosage}
            onChangeText={(text) => setNewMedicine({ ...newMedicine, dosage: text })}
            style={styles.input}
          />
          <TextInput
            label="العدد المتبقي"
            value={String(newMedicine.remainingCount)}
            onChangeText={(text) => setNewMedicine({ ...newMedicine, remainingCount: parseInt(text) || 0 })}
            keyboardType="numeric"
            style={styles.input}
          />
          <View style={styles.input}>
            <TimePickerComponent
              value={newMedicine.time}
              onChange={(date) => setNewMedicine({ ...newMedicine, time: date })}
              label="وقت التذكير"
            />
          </View>

          <NotificationSettings
            onSoundChange={setSelectedSound}
            onVibrationChange={setVibrationEnabled}
            onRepeatChange={setRepeatType}
            selectedSound={selectedSound}
            vibrationEnabled={vibrationEnabled}
            repeatType={repeatType}
          />
          <Button mode="contained" onPress={addMedicine} style={styles.button}>
            إضافة دواء
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.medicineList}>
        {medicines.map((medicine, index) => (
          <List.Item
            key={medicine.id}
            title={medicine.name}
            description={`الوقت: ${medicine.time.toLocaleTimeString('ar-SA')} | ${medicine.repeatType === 'once' ? 'مرة واحدة' : 'يومياً'}`}
            left={(props) => <List.Icon {...props} icon="pill" />}
            right={(props) => (
              <View style={{ flexDirection: 'row' }}>
                <IconButton {...props} icon="pencil" onPress={() => editMedicine(medicine)} />
                <IconButton {...props} icon="delete" onPress={() => deleteMedicine(medicine.id)} />
              </View>
            )}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
  },
  medicineList: {
    marginTop: 16,
  },
});
