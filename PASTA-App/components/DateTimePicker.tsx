import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker';

type DateTimePickerProps = {
  value: Date;
  onChange: (event: DateTimePickerEvent, date?: Date) => void;
  onClose: () => void;
};

const DateTimePicker: React.FC<DateTimePickerProps> = ({ value, onChange, onClose }) => {
  // For web, we use the native date picker
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <input
          type="date"
          value={value.toISOString().split('T')[0]}
          onChange={(e) => {
            const newDate = new Date(e.target.value);
            onChange({ type: 'set', nativeEvent: { timestamp: newDate.getTime() } }, newDate);
          }}
          style={{
            padding: 10,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#e2e8f0',
            fontSize: 16,
            width: '100%',
          }}
        />
      </View>
    );
  }

  // For Android, we use the DateTimePickerAndroid API
  if (Platform.OS === 'android') {
    DateTimePickerAndroid.open({
      value,
      onChange,
      mode: 'date',
      is24Hour: true,
    });
    return null;
  }

  // For iOS, we would use the modal version, but for simplicity we'll return null
  return null;
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
});

export default DateTimePicker;