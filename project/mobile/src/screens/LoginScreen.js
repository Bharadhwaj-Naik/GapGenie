import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { signInWithGoogle, supabase } from '../services/supabase';
import useStore from '../store/useStore';
import { COLORS, FONTS } from '../constants/theme';

export default function LoginScreen() {
  const setUser = useStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    setLoading(false);
    if (error) {
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/icon.png')} style={styles.logo} />
      <Text style={styles.title}>GapGenie</Text>
      <Text style={styles.subtitle}>Your proactive student assistant</Text>
      <TouchableOpacity
        style={[styles.googleBtn, loading && { opacity: 0.6 }]}
        onPress={handleGoogleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.text} style={{ marginRight: 8 }} />
        ) : (
          <Image source={require('../../assets/google.png')} style={styles.googleIcon} />
        )}
        <Text style={styles.googleText}>
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.privacy}>
        We use your email only for login and reminders. Your data is private.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  logo: { width: 100, height: 100, marginBottom: 24 },
  title: { ...FONTS.h1, marginBottom: 8 },
  subtitle: { ...FONTS.body, color: COLORS.textSecondary, marginBottom: 32 },
  googleBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 12, borderRadius: 8, elevation: 2, marginBottom: 16 },
  googleIcon: { width: 24, height: 24, marginRight: 8 },
  googleText: { ...FONTS.button, color: COLORS.text },
  privacy: { ...FONTS.caption, textAlign: 'center', marginTop: 24, color: COLORS.textLight },
});