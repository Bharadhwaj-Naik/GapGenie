import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials in app.config.js');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Sign in with Google
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'gapgenie://auth/callback',
    },
  });

  if (error) return { data: null, error };

  if (data?.url) {
    await WebBrowser.openAuthSessionAsync(data.url, 'gapgenie://auth/callback');
  }

  return { data, error };
};

// Sign in with email
export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

// Sign up with email
export const signUpWithEmail = async (email, password, fullName) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });
  return { data, error };
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Get current session
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
};

// Get user profile
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

// Update user profile
export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
    .select()
    .single();
  return { data, error };
};

// ========================
// TIMETABLE OPERATIONS
// ========================

export const getTimetable = async (userId, day) => {
  let query = supabase
    .from('timetable')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: true });

  if (day) query = query.eq('day_of_week', day);
  const { data, error } = await query;
  return { data, error };
};

export const saveTimetable = async (userId, entries) => {
  const rows = entries.map((e) => ({
    user_id: userId,
    subject: e.subject,
    type: e.type || 'class',
    day_of_week: e.day_of_week,
    start_time: e.start_time,
    end_time: e.end_time,
    location: e.location || '',
    created_at: new Date().toISOString(),
  }));

  // ✅ Use upsert instead of delete+insert to avoid data loss
  const { data, error } = await supabase
    .from('timetable')
    .upsert(rows, { onConflict: 'user_id, day_of_week, start_time' })
    .select();
  return { data, error };
};

// ========================
// TASK OPERATIONS
// ========================

export const getTasks = async (userId, date) => {
  let query = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('deadline', { ascending: true });

  if (date) query = query.eq('date', date);
  const { data, error } = await query;
  return { data, error };
};

export const createTask = async (userId, task) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      title: task.title,
      description: task.description || '',
      category: task.category || 'extra',
      deadline: task.deadline,
      date: task.date,
      priority: task.priority || 'medium',
      estimated_minutes: task.estimated_minutes || 30,
      status: 'pending',
      skip_count: 0,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  return { data, error };
};

export const completeTask = async (taskId, userId) => {
  const { data, error } = await supabase
    .from('tasks')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', taskId)
    .eq('user_id', userId)
    .select()
    .single();
  return { data, error };
};

export const skipTask = async (taskId, userId) => {
  // ✅ Check task exists before updating
  const { data: task, error: fetchError } = await supabase
    .from('tasks')
    .select('skip_count')
    .eq('id', taskId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !task) return { error: fetchError || 'Task not found' };

  const newSkip = (task.skip_count || 0) + 1;
  const updates = { skip_count: newSkip };

  if (newSkip >= 3) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    updates.date = tomorrow.toISOString().split('T')[0];
    updates.skip_count = 0;
    updates.status = 'rescheduled';
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .eq('user_id', userId)
    .select()
    .single();

  return { data, error, rescheduled: newSkip >= 3 };
};

// ========================
// PROGRESS OPERATIONS
// ========================

export const logAttendance = async (userId, timetableId, attended, date) => {
  const { data, error } = await supabase
    .from('attendance')
    .upsert({
      user_id: userId,
      timetable_id: timetableId,
      attended,
      date: date || new Date().toISOString().split('T')[0],
    })
    .select()
    .single();
  return { data, error };
};

export const logMeals = async (userId, meals, date) => {
  const { data, error } = await supabase
    .from('meals')
    .upsert({
      user_id: userId,
      date: date || new Date().toISOString().split('T')[0],
      ...meals,
    })
    .select()
    .single();
  return { data, error };
};