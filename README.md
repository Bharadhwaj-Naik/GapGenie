# GapGenie

A proactive student assistant app that helps college students manage their time, tasks, and deadlines with intelligent reminders and AI-powered suggestions.

---

## Features
- Google Login Authentication (Gmail based)
- Profile icon to switch Gmail accounts
- Side menu (3-line navigation) to upload timetable & daily to-do list
- Two dashboard views: Class Schedule View & Free Time Task View
- Mandatory 6 AM alert if timetable or tasks are missing
- 10-minute prior popup alert before each free gap
- Weekly progress graphs and streak tracking
- 10 PM daily summary (tasks completed, time wasted, appreciation message)
- AI-based suggestions for additional productivity after 10 PM
- Auto re-scheduling if a task is skipped 3 times
- Instant modification if user skips class/lab
- Settings & Help section

---

## Tech Stack
- **Frontend:** React Native (Expo)
- **Navigation:** React Navigation
- **State Management:** Zustand
- **Backend:** Node.js + Express
- **Database & Auth:** Supabase (Postgres + Google OAuth)
- **AI Engine:** Gemini API
- **Notifications:** Expo Local Notifications
- **Charts:** React Native Gifted Charts
- **App Build:** Expo APK Generation

---

## Project Structure
```
GapGeine/
  backend/         # Node.js + Express API
  mobile/          # React Native (Expo) app
```

---

## Setup Instructions

### 1. Supabase Setup
- Create a new project at [supabase.com](https://supabase.com/)
- Enable Google OAuth in Authentication settings
- Create tables: `profiles`, `tasks`, `timetable`, `attendance`, `meals`, `streaks`
- Get your Supabase URL and Anon Key

### 2. Gemini API
- Get your Gemini API key from Google AI Studio

### 3. Backend Setup
```bash
cd backend
cp .env.example .env  # Fill in your Supabase and Gemini keys
npm install
npm run dev           # Starts backend on http://localhost:3001
```

### 4. Mobile App Setup
```bash
cd mobile
npm install -g expo-cli eas-cli
npm install
expo start            # Run in development mode
# or to build APK:
eas build -p android --profile preview
```
- Update `app.json` with your Supabase and Gemini keys in the `extra` field

### 5. Running the App
- Start backend (`npm run dev` in backend)
- Start Expo (`expo start` in mobile)
- Scan QR code with Expo Go app or run on emulator

---

## Contribution
- PRs and issues welcome!

## License
MIT
