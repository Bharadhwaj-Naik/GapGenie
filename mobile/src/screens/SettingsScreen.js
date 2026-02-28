import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import useStore from '../store/useStore';
import { COLORS, FONTS } from '../constants/theme';

export default function SettingsScreen() {
  const notificationsEnabled = useStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useStore((s) => s.setNotificationsEnabled);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Enable Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{ false: COLORS.border, true: COLORS.primary }}
          thumbColor={notificationsEnabled ? COLORS.primary : COLORS.surface}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 24 },
  title: { ...FONTS.h2, marginBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  label: { ...FONTS.body },
});
