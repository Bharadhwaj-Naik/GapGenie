import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CATEGORIES, COLORS, FONTS } from '../constants/theme';

export default function TimetableItem({ item }) {
  return (
    <View style={[styles.container, { borderLeftColor: CATEGORIES[item.type]?.color || COLORS.primary }] }>
      <Text style={styles.time}>{item.start_time} - {item.end_time}</Text>
      <Text style={styles.subject}>{item.subject}</Text>
      <Text style={styles.type}>{CATEGORIES[item.type]?.label || item.type}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.surface, borderRadius: 8, padding: 12, marginBottom: 8, borderLeftWidth: 5 },
  time: { ...FONTS.body, color: COLORS.textSecondary },
  subject: { ...FONTS.h4 },
  type: { ...FONTS.caption, color: COLORS.textLight },
});
