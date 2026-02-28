export const COLORS = {
  primary: '#6C63FF',
  primaryDark: '#5A52D5',
  primaryLight: '#E8E6FF',
  secondary: '#FF6584',
  accent: '#00D9A6',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  white: '#FFFFFF',
  black: '#000000',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  streak: '#FFD700',
  classColor: '#6C63FF',
  labColor: '#FF6584',
  tutColor: '#00D9A6',
  deadlineColor: '#FF9800',
  extraColor: '#9C27B0',
  freeColor: '#4CAF50',
};

export const FONTS = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  h4: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  bodySmall: { fontSize: 14, color: COLORS.textSecondary },
  caption: { fontSize: 12, color: COLORS.textLight },
  button: { fontSize: 16, fontWeight: '600', color: COLORS.white },
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const CATEGORIES = {
  classes: { label: 'Classes', color: COLORS.classColor, icon: '📚' },
  labs: { label: 'Labs', color: COLORS.labColor, icon: '🔬' },
  tuts: { label: 'Tutorials', color: COLORS.tutColor, icon: '📝' },
  deadline: { label: 'Deadlines', color: COLORS.deadlineColor, icon: '⏰' },
  extra: { label: 'Extra Work', color: COLORS.extraColor, icon: '✨' },
};

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const MEAL_TIMES = {
  breakfast: { label: 'Breakfast', emoji: '🍳', reminderHour: 7 },
  lunch: { label: 'Lunch', emoji: '🍱', reminderHour: 12 },
  dinner: { label: 'Dinner', emoji: '🍽️', reminderHour: 19 },
};
