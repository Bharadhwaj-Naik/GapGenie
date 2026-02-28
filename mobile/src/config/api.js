import Constants from 'expo-constants';

// Use environment variable if available from app.config.js
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001';

if (typeof API_URL === 'undefined') {
  console.warn('API_URL not configured. Using localhost:3001. Set BACKEND_API_URL in .env for production.');
}

export default API_URL;
