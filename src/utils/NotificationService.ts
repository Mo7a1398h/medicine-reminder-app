import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

type NotificationSound = 'bell' | 'chime' | 'crystal' | 'digital' | 'melody';

// تكوين إعدادات التنبيهات العامة
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Platform.OS === 'android' ? Notifications.AndroidNotificationPriority.HIGH : undefined,
  }),
});

// تعيين إعدادات الصوت والاهتزاز
const setupNotifications = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
      enableVibrate: true,
    });
  }

  // إعدادات التنبيهات للأيفون
  if (Platform.OS === 'ios') {
    await Notifications.getPermissionsAsync();
  }
};

// تنفيذ الإعداد
setupNotifications();

export class NotificationService {
  static async requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  static async cancelNotification(notificationId: string) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  static async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  private static getSoundName(soundType: NotificationSound): string {
    if (Platform.OS === 'ios') {
      // على iOS، نستخدم أسماء الملفات مع الامتداد
      const soundMap = {
        bell: 'notification.wav',
        chime: 'chime.wav',
        crystal: 'crystal.wav',
        digital: 'digital.wav',
        melody: 'melody.wav'
      };
      return soundMap[soundType] || 'default';
    } else {
      // على Android، نستخدم أسماء الملفات مع الامتداد
      const soundMap = {
        bell: 'notification.wav',
        chime: 'chime.wav',
        crystal: 'crystal.wav',
        digital: 'digital.wav',
        melody: 'melody.wav'
      };
      return soundMap[soundType] || 'default';
    }
  }

  static async scheduleNotification(
    title: string,
    body: string,
    date: Date,
    sound: NotificationSound,
    vibrate: boolean,
    repeatType: 'once' | 'daily'
  ) {
    const hasPermission = await this.requestPermissions();
    
    if (!hasPermission) {
      throw new Error('لم يتم منح إذن التنبيهات');
    }

    const triggerDate = new Date(date);
    
    const notificationContent: Notifications.NotificationContentInput = {
      title,
      body,
      sound: true, // تفعيل الصوت بشكل عام
      priority: 'high',
      vibrate: Platform.OS === 'android' ? (vibrate ? [0, 250, 250, 250] : undefined) : undefined,
      ...(Platform.OS === 'ios' ? {
        // إضافة خيارات iOS
        ios: {
          sound: sound ? this.getSoundName(sound) : true,
          _displayInForeground: true
        }
      } : {
        // إضافة خيارات Android
        android: {
          sound: sound ? this.getSoundName(sound) : true,
          priority: 'high',
          channelId: 'default'
        }
      }),
    };

    let triggerInput: Notifications.NotificationTriggerInput;

    if (Platform.OS === 'ios') {
      // إعدادات iOS
      const date = new Date(triggerDate);
      date.setSeconds(0); // تصفير الثواني
      
      triggerInput = {
        type: 'calendar',
        hour: date.getHours(),
        minute: date.getMinutes(),
        repeats: repeatType === 'daily',
      } as Notifications.CalendarTriggerInput;
    } else {
      // إعدادات Android
      if (repeatType === 'daily') {
        const date = new Date(triggerDate);
        date.setSeconds(0); // تصفير الثواني

        triggerInput = {
          type: 'daily',
          hour: date.getHours(),
          minute: date.getMinutes(),
          repeats: true,
        } as Notifications.DailyTriggerInput;
      } else {
        // للتنبيهات المفردة
        const date = new Date(triggerDate);
        date.setSeconds(0); // تصفير الثواني

        triggerInput = {
          type: 'calendar',
          hour: date.getHours(),
          minute: date.getMinutes(),
          repeats: false,
        } as Notifications.CalendarTriggerInput;
      }
    }

    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: triggerInput,
      });

      // التحقق من نجاح جدولة التنبيه
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const isScheduled = scheduledNotifications.some(n => n.identifier === identifier);
      
      if (!isScheduled) {
        throw new Error('فشل في جدولة التنبيه');
      }

      return identifier;
    } catch (error) {
      console.error('خطأ في جدولة التنبيه:', error);
      throw new Error('فشل في جدولة التنبيه');
    }
  }
}
