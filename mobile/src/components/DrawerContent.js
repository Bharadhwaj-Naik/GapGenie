import React from 'react';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import useStore from '../store/useStore';
import { COLORS, FONTS } from '../constants/theme';

import { signOut } from '../services/supabase';

export default function DrawerContent(props) {
  const user = useStore((s) => s.user);
  const profile = useStore((s) => s.profile);
  const logout = useStore((s) => s.logout);

  const handleLogout = async () => {
    // Sign out from Supabase first
    await signOut();
    // Then clear local state
    logout();
  };

  let avatarSource;
  try {
    avatarSource = require('../../assets/avatar.png');
  } catch (e) {
    // fallback to a default icon if avatar.png is missing
    avatarSource = { uri: 'https://ui-avatars.com/api/?name=Student&background=6C63FF&color=fff&size=128' };
  }

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image source={avatarSource} style={styles.avatar} />
        <Text style={styles.name}>{profile?.full_name || user?.email || 'Student'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <TouchableOpacity style={styles.profileBtn} onPress={() => props.navigation.navigate('Profile')}>
          <Text style={styles.profileBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
      <DrawerItemList {...props} />
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 0, backgroundColor: COLORS.background },
  header: { alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: COLORS.border, marginBottom: 8 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 8, borderWidth: 2, borderColor: COLORS.primary },
  name: { ...FONTS.h4, marginBottom: 2 },
  email: { ...FONTS.caption, color: COLORS.textLight, marginBottom: 6 },
  profileBtn: { backgroundColor: COLORS.primary, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 8 },
  profileBtnText: { ...FONTS.button, fontSize: 14 },
  logoutBtn: { backgroundColor: COLORS.error, borderRadius: 6, padding: 10, alignItems: 'center', margin: 16 },
  logoutBtnText: { ...FONTS.button },
});
