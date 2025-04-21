import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { Button } from 'react-native-paper';
import { BottomTabs } from './src/navigation/BottomTabs';
import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { NotificationService } from './src/utils/NotificationService';
import { Alert, View } from 'react-native';

export default function App() {
  const testNotifications = async () => {
    try {
      // اختبار تنبيه فوري (بعد دقيقة)
      const immediateDate = new Date();
      immediateDate.setMinutes(immediateDate.getMinutes() + 1);
      await NotificationService.scheduleNotification(
        'تنبيه تجريبي',
        'هذا تنبيه فوري للاختبار',
        immediateDate,
        'bell',
        true,
        'once'
      );

      // اختبار تنبيه يومي
      const dailyDate = new Date();
      dailyDate.setMinutes(dailyDate.getMinutes() + 2);
      await NotificationService.scheduleNotification(
        'تنبيه يومي',
        'هذا تنبيه يومي للاختبار',
        dailyDate,
        'crystal',
        true,
        'daily'
      );

      Alert.alert('نجاح', 'تم جدولة التنبيهات بنجاح');
    } catch (error) {
      Alert.alert('خطأ', error instanceof Error ? error.message : 'حدث خطأ غير معروف');
    }
  };

  useEffect(() => {
    // طلب إذن التنبيهات عند بدء التطبيق
    Notifications.requestPermissionsAsync();

    // تكوين معالج التنبيهات
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }, []);
  return (
    <PaperProvider>
      <NavigationContainer>
        <View style={{ position: 'absolute', top: 50, right: 10, zIndex: 1000 }}>
          <Button
            mode="contained"
            onPress={testNotifications}
          >
            اختبار التنبيهات
          </Button>
        </View>
        <BottomTabs />
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
