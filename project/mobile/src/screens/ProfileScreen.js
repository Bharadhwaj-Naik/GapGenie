import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import useStore from '../store/useStore';
import { getProfile, updateProfile } from '../services/supabase';
import { COLORS, FONTS } from '../constants/theme';

export default function ProfileScreen() {
  const user = useStore((s) => s.user);
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState('');
  const [college, setCollege] = useState('');
  const [year, setYear] = useState('');
  const [branch, setBranch] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (user) {
      getProfile(user.id).then(({ data }) => {
        setProfile(data);
        setFullName(data?.full_name || '');
        setCollege(data?.college || '');
        setYear(data?.year || '');
        setBranch(data?.branch || '');
        setPhone(data?.phone || '');
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const { data } = await updateProfile(user.id, { full_name: fullName, college, year, branch, phone });
    setProfile(data);
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/avatar.png')} style={styles.avatar} />
      <Text style={styles.title}>My Profile</Text>
      <TextInput style={styles.input} placeholder="Full Name" value={fullName} onChangeText={setFullName} />
      <TextInput style={styles.input} placeholder="College" value={college} onChangeText={setCollege} />
      <TextInput style={styles.input} placeholder="Year" value={year} onChangeText={setYear} />
      <TextInput style={styles.input} placeholder="Branch" value={branch} onChangeText={setBranch} />
      <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Text style={styles.saveBtnText}>Save</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: COLORS.background, padding: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 16, borderWidth: 2, borderColor: COLORS.primary },
  title: { ...FONTS.h2, marginBottom: 16 },
  input: { width: '100%', backgroundColor: COLORS.surface, borderRadius: 6, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 6, padding: 12, alignItems: 'center', marginTop: 8 },
  saveBtnText: { ...FONTS.button },
});
