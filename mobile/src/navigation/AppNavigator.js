import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import useStore from '../store/useStore';
import { COLORS } from '../constants/theme';
import { supabase } from '../services/supabase';

// Screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import UploadScreen from '../screens/UploadScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HelpScreen from '../screens/HelpScreen';
import ProgressScreen from '../screens/ProgressScreen';

// Components
import DrawerContent from '../components/DrawerContent';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: 'bold' },
        drawerStyle: { backgroundColor: COLORS.background, width: 280 },
        drawerActiveBackgroundColor: COLORS.primaryLight,
        drawerActiveTintColor: COLORS.primary,
        drawerInactiveTintColor: COLORS.textSecondary,
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'GapGenie - Dashboard' }}
      />
      <Drawer.Screen
        name="Upload"
        component={UploadScreen}
        options={{ title: 'Upload Timetable & Tasks' }}
      />
      <Drawer.Screen
        name="Progress"
        component={ProgressScreen}
        options={{ title: 'My Progress' }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Drawer.Screen
        name="Help"
        component={HelpScreen}
        options={{ title: 'Help & Feedback' }}
      />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  const { user, setUser } = useStore();

  useEffect(() => {
    // ✅ Check existing session on app start
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      }
    });

    // ✅ Listen for auth changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth event:', _event);
      if (session?.user) {
        setUser(session.user);  // ← this triggers navigation to Home
      } else {
        setUser(null);          // ← this triggers navigation to Login
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={DrawerNavigator} />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                headerShown: true,
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.white,
                title: 'My Profile',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}