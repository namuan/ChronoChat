import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DaySeparatorProps {
  date: Date;
}

export default function DaySeparator({ date }: DaySeparatorProps) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  let label = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  if (date.toDateString() === today.toDateString()) label = 'Today';
  else if (date.toDateString() === yesterday.toDateString()) label = 'Yesterday';

  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ced4da',
  },
  label: {
    marginHorizontal: 12,
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '600',
  },
});