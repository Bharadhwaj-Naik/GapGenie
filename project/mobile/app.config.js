import 'dotenv/config';

export default {
  expo: {
    name: 'GapGenie',
    slug: 'gapgenie',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
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
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#6C63FF',
      },
      package: 'com.voidcoders.gapgenie',
      permissions: ['NOTIFICATIONS', 'SCHEDULE_EXACT_ALARM'],
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'gapgenie',
              host: 'auth',
              pathPrefix: '/callback',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
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
    scheme: 'gapgenie',
    extra: {
      eas: {
        projectId: 'your-real-eas-project-id', // run: eas init
      },
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      geminiApiKey: process.env.GEMINI_API_KEY,
    },
  },
};