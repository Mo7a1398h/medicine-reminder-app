import React, { useState } from 'react';
import { View, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from 'react-native-paper';

interface TimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
}

export const TimePickerComponent = ({ value, onChange, label = 'اختر الوقت' }: TimePickerProps) => {
  const [show, setShow] = useState(false);

  const onTimeChange = (_: any, selectedDate?: Date) => {
    setShow(false);
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View>
      <Button mode="outlined" onPress={() => setShow(true)}>
        {label}: {value.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
      </Button>
      {show && (
        <DateTimePicker
          value={value}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
          locale="ar-SA"
        />
      )}
    </View>
  );
};
