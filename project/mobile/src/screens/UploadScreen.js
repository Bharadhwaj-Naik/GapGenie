import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import useStore from '../store/useStore';
import { COLORS, FONTS, DAYS, CATEGORIES } from '../constants/theme';
import { saveTimetable, createTask } from '../services/supabase';

export default function UploadScreen() {
  const user = useStore((s) => s.user);
  const setTimetable = useStore((s) => s.setTimetable);
  const setTasks = useStore((s) => s.setTasks);

  const [timetable, setLocalTimetable] = useState([]);
  const [tasks, setLocalTasks] = useState([]);

  // Timetable fields
  const [subject, setSubject] = useState('');
  const [type, setType] = useState('class');
  const [day, setDay] = useState(DAYS[0]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  // Task fields
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState('deadline');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskMinutes, setTaskMinutes] = useState('');

  // Loading states
  const [uploadingTimetable, setUploadingTimetable] = useState(false);
  const [uploadingTasks, setUploadingTasks] = useState(false);

  // ✅ Validate time format HH:MM
  const isValidTime = (time) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  // ✅ Validate date format YYYY-MM-DD
  const isValidDate = (date) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(date);
  };

  const addTimetableEntry = () => {
    if (!subject.trim()) {
      Alert.alert('Error', 'Please enter a subject');
      return;
    }
    if (!isValidTime(start) || !isValidTime(end)) {
      Alert.alert('Error', 'Time must be in HH:MM format (e.g. 09:00)');
      return;
    }
    if (start >= end) {
      Alert.alert('Error', 'End time must be after start time');
      return;
    }
    setLocalTimetable([
      ...timetable,
      {
        subject: subject.trim(),
        type,
        day_of_week: day,
        start_time: start,
        end_time: end,
      },
    ]);
    setSubject('');
    setStart('');
    setEnd('');
  };

  const uploadTimetable = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }
    if (timetable.length === 0) {
      Alert.alert('Error', 'Please add at least one timetable entry');
      return;
    }
    setUploadingTimetable(true);
    const { data, error } = await saveTimetable(user.id, timetable);
    setUploadingTimetable(false);
    if (error) {
      Alert.alert('Upload Failed', error.message);
      return;
    }
    setTimetable(data || []);
    setLocalTimetable([]);
    Alert.alert('Success', 'Timetable saved successfully!');
  };

  const addTask = () => {
    if (!taskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }
    if (!isValidDate(taskDeadline)) {
      Alert.alert('Error', 'Deadline must be in YYYY-MM-DD format (e.g. 2024-12-31)');
      return;
    }
    setLocalTasks([
      ...tasks,
      {
        title: taskTitle.trim(),
        category: taskCategory,
        deadline: taskDeadline,
        estimated_minutes: Number(taskMinutes) || 30,
      },
    ]);
    setTaskTitle('');
    setTaskDeadline('');
    setTaskMinutes('');
  };

  const uploadTasks = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }
    if (tasks.length === 0) {
      Alert.alert('Error', 'Please add at least one task');
      return;
    }
    setUploadingTasks(true);
    const created = [];
    for (const t of tasks) {
      const { data, error } = await createTask(user.id, t);
      if (error) {
        Alert.alert('Task Upload Failed', `Failed to save "${t.title}": ${error.message}`);
        setUploadingTasks(false);
        return;
      }
      if (data) created.push(data);
    }
    setUploadingTasks(false);
    setTasks(created);
    setLocalTasks([]);
    Alert.alert('Success', `${created.length} task(s) saved successfully!`);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">

      {/* ── Timetable Section ── */}
      <Text style={styles.title}>Upload Timetable</Text>

      <View style={styles.formRow}>
        <TextInput
          style={styles.input}
          placeholder="Subject"
          placeholderTextColor={COLORS.textSecondary}
          value={subject}
          onChangeText={setSubject}
        />
        <TextInput
          style={styles.input}
          placeholder="Type (class/lab/tut)"
          placeholderTextColor={COLORS.textSecondary}
          value={type}
          onChangeText={setType}
        />
      </View>

      <View style={styles.formRow}>
        <TextInput
          style={styles.input}
          placeholder="Day (e.g. Monday)"
          placeholderTextColor={COLORS.textSecondary}
          value={day}
          onChangeText={setDay}
        />
        <TextInput
          style={styles.input}
          placeholder="Start (HH:MM)"
          placeholderTextColor={COLORS.textSecondary}
          value={start}
          onChangeText={setStart}
          keyboardType="numbers-and-punctuation"
        />
        <TextInput
          style={styles.input}
          placeholder="End (HH:MM)"
          placeholderTextColor={COLORS.textSecondary}
          value={end}
          onChangeText={setEnd}
          keyboardType="numbers-and-punctuation"
        />
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={addTimetableEntry}>
        <Text style={styles.addBtnText}>+ Add Entry</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.uploadBtn, uploadingTimetable && { opacity: 0.6 }]}
        onPress={uploadTimetable}
        disabled={uploadingTimetable}
      >
        {uploadingTimetable ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.uploadBtnText}>Upload Timetable</Text>
        )}
      </TouchableOpacity>

      {/* ── Tasks Section ── */}
      <Text style={styles.title}>Upload Tasks</Text>

      <View style={styles.formRow}>
        <TextInput
          style={styles.input}
          placeholder="Task Title"
          placeholderTextColor={COLORS.textSecondary}
          value={taskTitle}
          onChangeText={setTaskTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Category (deadline/extra)"
          placeholderTextColor={COLORS.textSecondary}
          value={taskCategory}
          onChangeText={setTaskCategory}
        />
      </View>

      <View style={styles.formRow}>
        <TextInput
          style={styles.input}
          placeholder="Deadline (YYYY-MM-DD)"
          placeholderTextColor={COLORS.textSecondary}
          value={taskDeadline}
          onChangeText={setTaskDeadline}
        />
        <TextInput
          style={styles.input}
          placeholder="Minutes"
          placeholderTextColor={COLORS.textSecondary}
          value={taskMinutes}
          onChangeText={setTaskMinutes}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={addTask}>
        <Text style={styles.addBtnText}>+ Add Task</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.uploadBtn, uploadingTasks && { opacity: 0.6 }]}
        onPress={uploadTasks}
        disabled={uploadingTasks}
      >
        {uploadingTasks ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.uploadBtnText}>Upload Tasks</Text>
        )}
      </TouchableOpacity>

      {/* ── Preview Section ── */}
      {timetable.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>
            Timetable Entries ({timetable.length})
          </Text>
          {timetable.map((item, idx) => (
            <Text key={idx} style={styles.entry}>
              📚 {item.subject} ({item.type}) | {item.day_of_week} | {item.start_time} - {item.end_time}
            </Text>
          ))}
        </>
      )}

      {tasks.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>
            Tasks ({tasks.length})
          </Text>
          {tasks.map((t, idx) => (
            <Text key={idx} style={styles.entry}>
              ✅ {t.title} ({t.category}) | Due: {t.deadline} | {t.estimated_minutes}min
            </Text>
          ))}
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  title: {
    ...FONTS.h3,
    marginVertical: 12,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
    marginVertical: 4,
  },
  addBtnText: {
    ...FONTS.button,
    color: COLORS.white,
  },
  uploadBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
    marginVertical: 4,
    marginBottom: 20,
  },
  uploadBtnText: {
    ...FONTS.button,
    color: COLORS.white,
  },
  sectionTitle: {
    ...FONTS.h4,
    marginTop: 16,
    marginBottom: 8,
  },
  entry: {
    ...FONTS.bodySmall,
    marginVertical: 3,
    padding: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 4,
  },
});