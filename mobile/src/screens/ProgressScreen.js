import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import useStore from '../store/useStore';
import { COLORS, FONTS } from '../constants/theme';
import { getProfile } from '../services/supabase';
import { getDailyAppreciation } from '../services/gemini';

export default function ProgressScreen() {
  const user = useStore((s) => s.user);
  const [summary, setSummary] = useState(null);
  const [aiMessage, setAiMessage] = useState('');

  useEffect(() => {
    if (user) {
      // Simulate fetching daily stats
      getProfile(user.id).then(({ data }) => {
        const stats = {
          completed: data?.tasks_completed || 0,
          total: data?.tasks_total || 0,
          classesAttended: data?.classes_attended || 0,
          totalClasses: data?.classes_total || 0,
          breakfast: data?.breakfast,
          lunch: data?.lunch,
          dinner: data?.dinner,
          streak: data?.streak || 0,
        };
        setSummary(stats);
        getDailyAppreciation(stats).then(setAiMessage);
      });
    }
  }, [user]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Daily Progress</Text>
      {summary ? (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>Tasks: {summary.completed}/{summary.total}</Text>
          <Text style={styles.summaryText}>Classes Attended: {summary.classesAttended}/{summary.totalClasses}</Text>
          <Text style={styles.summaryText}>Breakfast: {summary.breakfast ? 'Yes' : 'No'}</Text>
          <Text style={styles.summaryText}>Lunch: {summary.lunch ? 'Yes' : 'No'}</Text>
          <Text style={styles.summaryText}>Dinner: {summary.dinner ? 'Yes' : 'No'}</Text>
          <Text style={styles.summaryText}>Streak: {summary.streak} days</Text>
        </View>
      ) : (
        <Text style={styles.loading}>Loading summary...</Text>
      )}
      <Text style={styles.aiMessage}>{aiMessage}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  title: { ...FONTS.h2, marginBottom: 16 },
  summaryBox: { backgroundColor: COLORS.surface, borderRadius: 8, padding: 16, marginBottom: 16 },
  summaryText: { ...FONTS.body, marginBottom: 4 },
  loading: { ...FONTS.body, color: COLORS.textLight },
  aiMessage: { ...FONTS.body, color: COLORS.primary, marginTop: 16 },
});
