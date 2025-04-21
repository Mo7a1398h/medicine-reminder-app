import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, TextInput, Button, Switch, Text, IconButton, List } from 'react-native-paper';
import { TimePickerComponent } from '../components/TimePickerComponent';
import { NotificationSettings } from '../components/NotificationSettings';
import * as Notifications from 'expo-notifications';

interface Schedule {
  id: string;
  type: 'sleep' | 'exercise';
  startTime: Date;
  endTime?: Date;
  sound: string;
  vibration: boolean;
  repeatType: 'once' | 'daily';
  notificationIds?: string[];
}

export const SleepExercise = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSound, setSelectedSound] = useState<'bell' | 'chime' | 'crystal' | 'digital' | 'melody'>('bell');
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [repeatType, setRepeatType] = useState<'once' | 'daily'>('daily');
  const [scheduleType, setScheduleType] = useState<'sleep' | 'exercise'>('sleep');
  const [selectedStartTime, setSelectedStartTime] = useState(new Date());
  const [selectedEndTime, setSelectedEndTime] = useState(new Date(new Date().setHours(new Date().getHours() + 8)));

  const saveSchedule = async () => {
    try {
      const notificationIds: string[] = [];
      
      // جدولة تنبيه وقت النوم
      const sleepNotificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: scheduleType === 'sleep' ? 'تذكير وقت النوم' : 'تذكير التمرين',
          body: scheduleType === 'sleep' ? 'حان وقت النوم!' : 'حان وقت التمرين!',
          sound: selectedSound,
          vibrate: vibrationEnabled ? [0, 250, 250, 250] : undefined
        },
        trigger: repeatType === 'daily' ? {
          hour: selectedStartTime.getHours(),
          minute: selectedStartTime.getMinutes(),
          repeats: true,
          type: 'daily'
        } : {
          seconds: Math.floor((selectedStartTime.getTime() - Date.now()) / 1000),
          repeats: false,
          type: 'timeInterval'
        }
      });
      
      if (sleepNotificationId) {
        notificationIds.push(sleepNotificationId);
      }

      // جدولة تنبيه وقت الاستيقاظ للنوم فقط
      if (scheduleType === 'sleep' && selectedEndTime) {
        const wakeNotificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'تذكير الاستيقاظ',
            body: 'صباح الخير! حان وقت الاستيقاظ',
            sound: true,
            vibrate: vibrationEnabled ? [0, 250, 250, 250] : undefined,
          },
          trigger: repeatType === 'daily' ? {
            hour: selectedEndTime.getHours(),
            minute: selectedEndTime.getMinutes(),
            repeats: true,
            type: 'daily'
          } : {
            seconds: Math.floor((selectedEndTime.getTime() - Date.now()) / 1000),
            repeats: false,
            type: 'timeInterval'
          },
        });
        
        if (wakeNotificationId) {
          notificationIds.push(wakeNotificationId);
        }
      }

      const newSchedule: Schedule = {
        id: Date.now().toString(),
        type: scheduleType,
        startTime: selectedStartTime,
        endTime: scheduleType === 'sleep' ? selectedEndTime : undefined,
        sound: selectedSound,
        vibration: vibrationEnabled,
        repeatType: repeatType,
        notificationIds,
      };
      
      setSchedules([...schedules, newSchedule]);
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const editSchedule = (schedule: Schedule) => {
    setScheduleType(schedule.type);
    setSelectedStartTime(schedule.startTime);
    setSelectedEndTime(schedule.endTime || new Date());
    setSelectedSound(schedule.sound as 'bell' | 'chime' | 'crystal' | 'digital' | 'melody');
    setVibrationEnabled(schedule.vibration);
    setRepeatType(schedule.repeatType);
    setSchedules(schedules.filter(s => s.id !== schedule.id));
  };

  const deleteSchedule = async (id: string) => {
    const schedule = schedules.find(s => s.id === id);
    if (schedule?.notificationIds) {
      for (const notificationId of schedule.notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }
    }
    setSchedules(schedules.filter(s => s.id !== id));
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>نوع الجدول</Title>
          <View style={styles.input}>
            <Switch
              value={scheduleType === 'sleep'}
              onValueChange={() => setScheduleType(scheduleType === 'sleep' ? 'exercise' : 'sleep')}
            />
            <Text>{scheduleType === 'sleep' ? 'نوم' : 'تمارين'}</Text>
          </View>
          {scheduleType === 'sleep' ? (
            <View>
              <View style={styles.input}>
                <TimePickerComponent
                  value={selectedStartTime}
                  onChange={(date) => setSelectedStartTime(date)}
                  label="وقت النوم"
                />
              </View>
              <View style={styles.input}>
                <TimePickerComponent
                  value={selectedEndTime}
                  onChange={(date) => setSelectedEndTime(date)}
                  label="وقت الاستيقاظ"
                />
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.input}>
                <TimePickerComponent
                  value={selectedStartTime}
                  onChange={(date) => setSelectedStartTime(date)}
                  label="وقت التمرين"
                />
              </View>
              <TextInput
                label="مدة التمرين (بالدقائق)"
                value="30"
                onChangeText={(text) => console.log(text)}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
          )}
        </Card.Content>
      </Card>

      <NotificationSettings
        onSoundChange={setSelectedSound}
        onVibrationChange={setVibrationEnabled}
        onRepeatChange={setRepeatType}
        selectedSound={selectedSound}
        vibrationEnabled={vibrationEnabled}
        repeatType={repeatType}
      />

      {schedules.map((schedule) => (
        <Card key={schedule.id} style={styles.scheduleCard}>
          <Card.Content>
            <View style={styles.scheduleHeader}>
              <Title>الجدول اليومي</Title>
              <View style={styles.actionButtons}>
                <IconButton icon="pencil" onPress={() => editSchedule(schedule)} />
                <IconButton icon="delete" onPress={() => deleteSchedule(schedule.id)} />
              </View>
            </View>
            <List.Item
              title={schedule.type === 'sleep' ? 'جدول النوم' : 'جدول التمارين'}
              description={`${schedule.type === 'sleep' ? 'من ' : ''}الوقت: ${schedule.startTime.toLocaleTimeString('ar-SA')}${schedule.endTime ? ` إلى ${schedule.endTime.toLocaleTimeString('ar-SA')}` : ''} | ${schedule.repeatType === 'once' ? 'مرة واحدة' : 'يومياً'}`}
              left={(props: any) => <List.Icon {...props} icon={schedule.type === 'sleep' ? 'bed' : 'run'} />}
            />
          </Card.Content>
        </Card>
      ))}

      <Button mode="contained" onPress={saveSchedule} style={styles.button}>
        حفظ الجدول
      </Button>
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
  scheduleCard: {
    marginVertical: 8,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  button: {
    marginBottom: 16,
  },
});
