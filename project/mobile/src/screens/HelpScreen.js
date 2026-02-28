import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

export default function HelpScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Help & Feedback</Text>
      <Text style={styles.body}>For support, suggestions, or to report bugs, email us at:</Text>
      <TouchableOpacity onPress={() => Linking.openURL('mailto:gapgenie@voidcoders.com')}>
        <Text style={styles.email}>gapgenie@voidcoders.com</Text>
      </TouchableOpacity>
      <Text style={styles.body}>We value your feedback to improve GapGenie!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 24 },
  title: { ...FONTS.h2, marginBottom: 16 },
  body: { ...FONTS.body, marginBottom: 8 },
  email: { ...FONTS.body, color: COLORS.primary, textDecorationLine: 'underline', marginBottom: 16 },
});
