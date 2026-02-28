import 'dotenv/config';

export default {
  expo: {
    name: 'GapGenie',
    slug: 'gapgenie',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    scheme: 'gapgenie',   // ✅ Required

    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#6C63FF',
    },

    assetBundlePatterns: ['**/*'],

    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.voidcoders.gapgenie',
    },

    android: {
      package: 'com.voidcoders.gapgenie',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#6C63FF',
      },
      permissions: ['NOTIFICATIONS', 'SCHEDULE_EXACT_ALARM'],
      intentFilters: [
        {
          action: 'VIEW',
          category: ['BROWSABLE', 'DEFAULT'],
          data: [
            {
              scheme: 'gapgenie',
              host: 'auth',
              pathPrefix: '/callback',
            },
          ],
        },
      ],
    },

    plugins: [
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#6C63FF',
        },
      ],
    ],

    extra: {
      eas: {
        projectId: 'jbduvjkbmfwkubrpfyzb', // ✅ your real project ID
      },
      apiUrl: process.env.BACKEND_API_URL || 'http://localhost:3001',
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      geminiApiKey: process.env.GEMINI_API_KEY,
    },
  },
};