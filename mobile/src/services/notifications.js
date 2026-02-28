import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request permissions and set up notifications
export const setupNotifications = async () => {
  if (!Device.isDevice) {
    console.log('Notifications only work on physical devices');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permission not granted');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'GapGenie Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6C63FF',
    });

    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Task Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6584',
    });

    await Notifications.setNotificationChannelAsync('meals', {
      name: 'Meal Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#00D9A6',
    });
  }

  return true;
};

// Schedule 6 AM morning reminder
export const scheduleMorningReminder = async () => {
  await cancelNotificationsByTag('morning-reminder');

  const trigger = new Date();
  trigger.setHours(6, 0, 0, 0);
  if (trigger <= new Date()) {
    trigger.setDate(trigger.getDate() + 1);
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌅 Good Morning!',
      body: 'Time to upload your timetable and to-do list for today! Let\'s make it productive! 💪',
      data: { type: 'morning-reminder', screen: 'Upload' },
      categoryIdentifier: 'reminders',
    },
    trigger: {
      hour: 6,
      minute: 0,
      repeats: true,
    },
  });
};

// Schedule repeating reminders every 15 minutes until tasks are uploaded
export const scheduleUploadNag = async () => {
  await cancelNotificationsByTag('upload-nag');

  // Schedule reminders at 6:15, 6:30, 6:45, 7:00, etc.
  const intervals = [15, 30, 45, 60, 75, 90, 105, 120];
  
  for (const minutes of intervals) {
    const trigger = new Date();
    trigger.setHours(6, 0, 0, 0);
    trigger.setMinutes(minutes);

    if (trigger > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📋 Don\'t forget!',
          body: 'Your timetable and tasks are still not uploaded. Upload now to stay on track!',
          data: { type: 'upload-nag', screen: 'Upload' },
        },
        trigger: { date: trigger },
      });
    }
  }
};

// Cancel upload nag notifications
export const cancelUploadNag = async () => {
  await cancelNotificationsByTag('upload-nag');
};

// Schedule pre-class reminder (10 minutes before)
export const scheduleClassReminder = async (classInfo, minutesBefore = 10) => {
  const [hours, minutes] = classInfo.start_time.split(':').map(Number);
  
  const trigger = new Date();
  trigger.setHours(hours, minutes - minutesBefore, 0, 0);

  if (trigger <= new Date()) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `📚 ${classInfo.subject} in ${minutesBefore} min`,
      body: `${classInfo.type === 'lab' ? '🔬 Lab' : classInfo.type === 'tutorial' ? '📝 Tutorial' : '📖 Class'} at ${classInfo.location || 'your classroom'}. Are you going?`,
      data: {
        type: 'class-reminder',
        classId: classInfo.id,
        actions: ['yes', 'no', 'skip'],
      },
      categoryIdentifier: 'reminders',
    },
    trigger: { date: trigger },
  });
};

// Schedule meal reminder (breakfast before first class)
export const scheduleMealReminder = async (mealType, firstClassTime) => {
  let triggerHour, triggerMinute;

  if (mealType === 'breakfast' && firstClassTime) {
    const [h, m] = firstClassTime.split(':').map(Number);
    triggerHour = h - 1;
    triggerMinute = m;
  } else if (mealType === 'lunch') {
    triggerHour = 12;
    triggerMinute = 0;
  } else if (mealType === 'dinner') {
    triggerHour = 19;
    triggerMinute = 0;
  }

  const trigger = new Date();
  trigger.setHours(triggerHour, triggerMinute, 0, 0);

  if (trigger <= new Date()) return;

  const emojis = { breakfast: '🍳', lunch: '🍱', dinner: '🍽️' };
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${emojis[mealType]} Time for ${mealType}!`,
      body: mealType === 'breakfast'
        ? 'Go eat tiffin! Your first class is in 1 hour. Will you eat?'
        : `Don't skip ${mealType}! Taking care of yourself is important.`,
      data: { type: 'meal-reminder', meal: mealType },
    },
    trigger: { date: trigger },
  });
};

// Schedule repeated meal reminder every 5 minutes
export const scheduleRepeatedMealReminder = async (mealType, startTime, endTime) => {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  for (let t = startMinutes; t < endMinutes; t += 5) {
    const trigger = new Date();
    trigger.setHours(Math.floor(t / 60), t % 60, 0, 0);

    if (trigger <= new Date()) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🍳 Have you eaten ${mealType}?`,
        body: 'Click Yes / No / I will not eat',
        data: { type: 'meal-nag', meal: mealType },
      },
      trigger: { date: trigger },
    });
  }
};

// Schedule free time gap notification (10 minutes before gap)
export const scheduleGapNotification = async (gap, suggestedTask) => {
  const [hours, minutes] = gap.start.split(':').map(Number);

  const trigger = new Date();
  trigger.setHours(hours, minutes - 10, 0, 0);

  if (trigger <= new Date()) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Free time in 10 minutes!',
      body: suggestedTask
        ? `Suggested: ${suggestedTask.title} (${gap.duration_minutes} min available)`
        : `You have ${gap.duration_minutes} minutes free. Time to be productive!`,
      data: {
        type: 'gap-reminder',
        gap,
        taskId: suggestedTask?.id,
      },
    },
    trigger: { date: trigger },
  });
};

// Schedule deadline reminder every 2 minutes during free time
export const scheduleDeadlineNag = async (deadlineTasks, freeStart, freeEnd) => {
  const [startH, startM] = freeStart.split(':').map(Number);
  const [endH, endM] = freeEnd.split(':').map(Number);
  
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  let taskIndex = 0;

  for (let t = startMinutes; t < endMinutes; t += 2) {
    if (taskIndex >= deadlineTasks.length) taskIndex = 0;
    const task = deadlineTasks[taskIndex];

    const trigger = new Date();
    trigger.setHours(Math.floor(t / 60), t % 60, 0, 0);

    if (trigger <= new Date()) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `⚡ Deadline: ${task.title}`,
        body: `Due: ${task.deadline}. Are you working on it? Yes / No / Skip`,
        data: { type: 'deadline-nag', taskId: task.id },
      },
      trigger: { date: trigger },
    });

    taskIndex++;
  }
};

// Schedule 10 PM daily summary
export const scheduleDailySummary = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📊 Daily Summary',
      body: 'Time to review your day! Check your progress and see how you did.',
      data: { type: 'daily-summary', screen: 'Progress' },
    },
    trigger: {
      hour: 22,
      minute: 0,
      repeats: true,
    },
  });
};

// Cancel all notifications with a specific tag
const cancelNotificationsByTag = async (tag) => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notification of scheduled) {
    if (notification.content.data?.type === tag) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
};

// Cancel all notifications
export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

// Schedule all daily notifications based on timetable and tasks
export const scheduleAllDailyNotifications = async (timetable, tasks, gaps) => {
  // Cancel existing
  await cancelAllNotifications();

  // 1. Morning reminder
  await scheduleMorningReminder();

  // 2. Daily summary at 10 PM
  await scheduleDailySummary();

  // 3. Class reminders (10 min before each)
  for (const cls of timetable) {
    await scheduleClassReminder(cls);
  }

  // 4. Meal reminders
  if (timetable.length > 0) {
    await scheduleMealReminder('breakfast', timetable[0].start_time);
  }
  await scheduleMealReminder('lunch');
  await scheduleMealReminder('dinner');

  // 5. Free time gap notifications
  const deadlineTasks = tasks.filter((t) => t.category === 'deadline' && t.status === 'pending');
  
  for (const gap of gaps) {
    const matchingTask = tasks.find(
      (t) => t.status === 'pending' && t.estimated_minutes <= gap.duration_minutes
    );
    await scheduleGapNotification(gap, matchingTask);

    // Deadline nag during free time
    if (deadlineTasks.length > 0) {
      await scheduleDeadlineNag(deadlineTasks, gap.start, gap.end);
    }
  }
};

// Add notification response listener
export const addNotificationResponseListener = (handler) => {
  return Notifications.addNotificationResponseReceivedListener(handler);
};

// Add notification received listener
export const addNotificationReceivedListener = (handler) => {
  return Notifications.addNotificationReceivedListener(handler);
};
