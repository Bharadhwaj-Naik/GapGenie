import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import useStore from '../store/useStore';
import { COLORS, FONTS, CATEGORIES } from '../constants/theme';
import { getProfile, getTimetable, getTasks } from '../services/supabase';
import { scheduleAllDailyNotifications } from '../services/notifications';

export default function HomeScreen({ navigation }) {
  const user = useStore((s) => s.user);
  const timetable = useStore((s) => s.timetable);
  const tasks = useStore((s) => s.tasks);
  const gaps = useStore((s) => s.gaps);
  const setProfile = useStore((s) => s.setProfile);
  const setTimetable = useStore((s) => s.setTimetable);
  const setTasks = useStore((s) => s.setTasks);
  const setGaps = useStore((s) => s.setGaps);

  useEffect(() => {
    if (user) {
      getProfile(user.id).then(({ data }) => setProfile(data));
      getTimetable(user.id).then(({ data }) => setTimetable(data || []));
      getTasks(user.id).then(({ data }) => setTasks(data || []));
    }
  }, [user]);

  useEffect(() => {
    if (timetable.length && tasks.length && gaps.length) {
      scheduleAllDailyNotifications(timetable, tasks, gaps);
    }
  }, [timetable, tasks, gaps]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back!</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image source={require('../../assets/avatar.png')} style={styles.avatar} />
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>Today's Schedule</Text>
      {/* Timetable list */}
      <View style={styles.timetableList}>
        {timetable.length === 0 ? (
          <Text style={styles.empty}>No timetable uploaded. Go to Upload tab.</Text>
        ) : (
          timetable.map((item) => (
            <View key={item.id} style={[styles.timetableItem, { borderLeftColor: CATEGORIES[item.type]?.color || COLORS.primary }] }>
              <Text style={styles.timetableTime}>{item.start_time} - {item.end_time}</Text>
              <Text style={styles.timetableSubject}>{item.subject}</Text>
              <Text style={styles.timetableType}>{CATEGORIES[item.type]?.label || item.type}</Text>
            </View>
          ))
        )}
      </View>
      <Text style={styles.sectionTitle}>Today's Tasks</Text>
      {/* Tasks list */}
      <View style={styles.taskList}>
        {tasks.length === 0 ? (
          <Text style={styles.empty}>No tasks for today. Add some in Upload tab.</Text>
        ) : (
          tasks.map((task) => (
            <View key={task.id} style={[styles.taskItem, { borderLeftColor: CATEGORIES[task.category]?.color || COLORS.primary }] }>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskCategory}>{CATEGORIES[task.category]?.label || task.category}</Text>
              <Text style={styles.taskDeadline}>Due: {task.deadline}</Text>
            </View>
          ))
        )}
      </View>
      <Text style={styles.sectionTitle}>Free Time Gaps</Text>
      {/* Gaps list */}
      <View style={styles.gapList}>
        {gaps.length === 0 ? (
          <Text style={styles.empty}>No free gaps detected.</Text>
        ) : (
          gaps.map((gap, idx) => (
            <View key={idx} style={styles.gapItem}>
              <Text style={styles.gapTime}>{gap.start} - {gap.end}</Text>
              <Text style={styles.gapDuration}>{gap.duration_minutes} min</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  greeting: { ...FONTS.h2 },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: COLORS.primary },
  sectionTitle: { ...FONTS.h3, marginLeft: 20, marginTop: 16, marginBottom: 8 },
  timetableList: { marginHorizontal: 20, marginBottom: 12 },
  timetableItem: { backgroundColor: COLORS.surface, borderRadius: 8, padding: 12, marginBottom: 8, borderLeftWidth: 5 },
  timetableTime: { ...FONTS.body, color: COLORS.textSecondary },
  timetableSubject: { ...FONTS.h4 },
  timetableType: { ...FONTS.caption, color: COLORS.textLight },
  taskList: { marginHorizontal: 20, marginBottom: 12 },
  taskItem: { backgroundColor: COLORS.surface, borderRadius: 8, padding: 12, marginBottom: 8, borderLeftWidth: 5 },
  taskTitle: { ...FONTS.body },
  taskCategory: { ...FONTS.caption, color: COLORS.textLight },
  taskDeadline: { ...FONTS.caption, color: COLORS.error },
  gapList: { marginHorizontal: 20, marginBottom: 24 },
  gapItem: { backgroundColor: COLORS.freeColor, borderRadius: 8, padding: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between' },
  gapTime: { ...FONTS.body, color: COLORS.white },
  gapDuration: { ...FONTS.caption, color: COLORS.white },
  empty: { ...FONTS.caption, color: COLORS.textLight, textAlign: 'center', marginVertical: 8 },
});
