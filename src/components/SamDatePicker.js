import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import DatePicker from 'react-native-date-picker';

const DateTimeSelector = ({ onChangeDateTime }) => {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [openDate, setOpenDate] = useState(false);
  const [openTime, setOpenTime] = useState(false);

  const [pendingAction, setPendingAction] = useState(null); // 'both', 'date', 'time'

  const combineDateTime = (datePart, timePart) => {
    return new Date(
      datePart.getFullYear(),
      datePart.getMonth(),
      datePart.getDate(),
      timePart.getHours(),
      timePart.getMinutes(),
    );
  };

  const handleDateConfirm = selectedDate => {
    setOpenDate(false);
    setDate(selectedDate);

    if (pendingAction === 'both') {
      setOpenTime(true);
    } else {
      const combined = combineDateTime(selectedDate, time);
      onChangeDateTime && onChangeDateTime(combined);
    }
  };

  const handleTimeConfirm = selectedTime => {
    setOpenTime(false);
    setTime(selectedTime);

    const combined = combineDateTime(date, selectedTime);
    onChangeDateTime && onChangeDateTime(combined);
  };

  const formatDisplay = d =>
    `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Selected: {formatDisplay(combineDateTime(date, time))}
      </Text>

      <View style={styles.buttonRow}>
        <Text style={{ marginTop: 5 }}>Select </Text>
        <Button
          title="Date"
          onPress={() => {
            setPendingAction('date');
            setOpenDate(true);
          }}
        />
        <Button
          title="Time"
          onPress={() => {
            setPendingAction('time');
            setOpenTime(true);
          }}
        />
        <Button
          title="Date & Time"
          onPress={() => {
            setPendingAction('both');
            setOpenDate(true);
          }}
        />
      </View>

      <DatePicker
        modal
        mode="date"
        open={openDate}
        date={date}
        onConfirm={handleDateConfirm}
        onCancel={() => setOpenDate(false)}
      />

      <DatePicker
        modal
        mode="time"
        open={openTime}
        date={time}
        onConfirm={handleTimeConfirm}
        onCancel={() => setOpenTime(false)}
      />
    </View>
  );
};

export default DateTimeSelector;

const styles = StyleSheet.create({
  container: {
    padding: 2,
  },
  label: {
    marginBottom: 12,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
});
