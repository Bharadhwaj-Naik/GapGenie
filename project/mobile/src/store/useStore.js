import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useStore = create((set, get) => ({
  // Auth
  user: null,
  session: null,
  profile: null,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  logout: () => set({ user: null, session: null, profile: null, timetable: [], tasks: [], gaps: [] }),

  // Timetable
  timetable: [],
  setTimetable: (timetable) => set({ timetable }),

  // Tasks
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),

  // Gaps (free time slots)
  gaps: [],
  setGaps: (gaps) => set({ gaps }),

  // Progress
  dailyProgress: null,
  weeklyProgress: null,
  streak: 0,
  longestStreak: 0,
  setDailyProgress: (dailyProgress) => set({ dailyProgress }),
  setWeeklyProgress: (weeklyProgress) => set({ weeklyProgress }),
  setStreak: (streak, longestStreak) => set({ streak, longestStreak }),

  // Meals
  meals: { breakfast: false, lunch: false, dinner: false },
  setMeals: (meals) => set({ meals }),
  toggleMeal: (meal) =>
    set((state) => ({
      meals: { ...state.meals, [meal]: !state.meals[meal] },
    })),

  // UI State
  activeTab: 'schedule', // 'schedule' | 'freetime'
  setActiveTab: (activeTab) => set({ activeTab }),
  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),

  // Timetable uploaded status
  hasUploadedToday: false,
  setHasUploadedToday: (val) => set({ hasUploadedToday: val }),

  // Notification preferences
  notificationsEnabled: true,
  setNotificationsEnabled: (val) => set({ notificationsEnabled: val }),

  // Save to AsyncStorage
  persistState: async () => {
    try {
      const state = get();
      await AsyncStorage.setItem(
        'gapgenie_state',
        JSON.stringify({
          timetable: state.timetable,
          tasks: state.tasks,
          meals: state.meals,
          hasUploadedToday: state.hasUploadedToday,
          notificationsEnabled: state.notificationsEnabled,
        })
      );
    } catch (e) {
      console.error('Error saving state:', e);
    }
  },

  // Load from AsyncStorage
  loadPersistedState: async () => {
    try {
      const saved = await AsyncStorage.getItem('gapgenie_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        set({
          timetable: parsed.timetable || [],
          tasks: parsed.tasks || [],
          meals: parsed.meals || { breakfast: false, lunch: false, dinner: false },
          hasUploadedToday: parsed.hasUploadedToday || false,
          notificationsEnabled: parsed.notificationsEnabled !== false,
        });
      }
    } catch (e) {
      console.error('Error loading state:', e);
    }
  },
}));

export default useStore;
