import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RadioButton, Text, Switch, List } from 'react-native-paper';

interface NotificationSettingsProps {
  onSoundChange: (sound: 'bell' | 'chime' | 'crystal' | 'digital' | 'melody') => void;
  onVibrationChange: (vibrate: boolean) => void;
  onRepeatChange: (repeat: 'once' | 'daily') => void;
  selectedSound: 'bell' | 'chime' | 'crystal' | 'digital' | 'melody';
  vibrationEnabled: boolean;
  repeatType: 'once' | 'daily';
}

const NOTIFICATION_SOUNDS = [
  { id: 'bell', label: 'جرس' },
  { id: 'chime', label: 'رنين' },
  { id: 'crystal', label: 'كريستال' },
  { id: 'digital', label: 'رقمي' },
  { id: 'melody', label: 'لحن' },
];

const REPEAT_OPTIONS = [
  { value: 'once', label: 'مرة واحدة' },
  { value: 'daily', label: 'يومياً' },
];

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  onSoundChange,
  onVibrationChange,
  onRepeatChange,
  selectedSound,
  vibrationEnabled,
  repeatType,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>إعدادات التنبيه</Text>
      
      <View style={styles.soundSection}>
        <Text>اختر صوت التنبيه:</Text>
        <RadioButton.Group
          onValueChange={(value) => onSoundChange(value as 'bell' | 'chime' | 'crystal' | 'digital' | 'melody')}
          value={selectedSound}
        >
          {NOTIFICATION_SOUNDS.map((s) => (
            <View key={s.id} style={styles.radioItem}>
              <RadioButton.Item
                label={`${s.label} - ${s.description}`}
                value={s.id}
                style={styles.radioItem}
              />
            </View>
          ))}
        </RadioButton.Group>
      </View>

      <View style={styles.vibrationSection}>
        <List.Item
          title="الاهتزاز"
          right={() => (
            <Switch
              value={vibrationEnabled}
              onValueChange={onVibrationChange}
            />
          )}
        />
        <List.Section title="تكرار التنبيه">
          <RadioButton.Group 
          onValueChange={(value: string) => onRepeatChange(value as 'once' | 'daily')} 
          value={repeatType}
        >
            {REPEAT_OPTIONS.map((option) => (
              <RadioButton.Item
                key={option.value}
                label={option.label}
                value={option.value}
                style={styles.radioItem}
              />
            ))}
          </RadioButton.Group>
        </List.Section>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  soundSection: {
    marginBottom: 16,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vibrationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
});
