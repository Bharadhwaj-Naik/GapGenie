import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CATEGORIES, COLORS, FONTS } from '../constants/theme';

export default function TaskItem({ task }) {
  return (
    <View style={[styles.container, { borderLeftColor: CATEGORIES[task.category]?.color || COLORS.primary }] }>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.category}>{CATEGORIES[task.category]?.label || task.category}</Text>
      <Text style={styles.deadline}>Due: {task.deadline}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.surface, borderRadius: 8, padding: 12, marginBottom: 8, borderLeftWidth: 5 },
  title: { ...FONTS.body },
  category: { ...FONTS.caption, color: COLORS.textLight },
  deadline: { ...FONTS.caption, color: COLORS.error },
});
