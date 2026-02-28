import Constants from 'expo-constants';

const GEMINI_API_KEY = Constants.expoConfig?.extra?.geminiApiKey;

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not configured. Set GEMINI_API_KEY in .env file.');
}

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Get AI-powered task suggestion based on available time, deadlines, and energy level.
 */
export const getTaskSuggestion = async (tasks, gapDuration, currentHour) => {
  try {
    // Check if API key is configured
    if (!GEMINI_API_KEY) {
      console.warn('Gemini API key not configured. Using fallback suggestion.');
      return getTaskSuggestionFallback(tasks, gapDuration);
    }

    // Determine energy level based on time of day
    let energyLevel = 'medium';
    if (currentHour >= 6 && currentHour < 10) energyLevel = 'high';
    else if (currentHour >= 10 && currentHour < 14) energyLevel = 'medium';
    else if (currentHour >= 14 && currentHour < 17) energyLevel = 'low';
    else if (currentHour >= 17 && currentHour < 21) energyLevel = 'medium';

    const pendingTasks = tasks
      .filter((t) => t.status === 'pending')
      .map((t) => `- ${t.title} (${t.category}, ${t.estimated_minutes}min, deadline: ${t.deadline}, priority: ${t.priority})`)
      .join('\n');

    if (!pendingTasks) {
      return { suggestion: 'All tasks completed! Take a well-deserved break. 🎉', taskId: null };
    }

    const prompt = `You are a smart student productivity assistant. A student has ${gapDuration} minutes of free time right now. 
Their energy level is ${energyLevel}. Current time is ${currentHour}:00.

Pending tasks:
${pendingTasks}

Suggest the BEST single task to do right now considering:
1. Task that fits within ${gapDuration} minutes
2. Deadline urgency (closer deadline = higher priority)
3. Energy level match (heavy tasks for high energy, lighter for low)
4. Priority level

Respond in this exact JSON format:
{"task": "task name", "reason": "brief reason in 1 sentence", "tip": "a quick productivity tip"}`;

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        },
      }),
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Try to parse JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Find matching task
        const matchedTask = tasks.find(
          (t) => t.title.toLowerCase().includes(parsed.task.toLowerCase()) || parsed.task.toLowerCase().includes(t.title.toLowerCase())
        );
        return {
          suggestion: `${parsed.task}: ${parsed.reason}`,
          tip: parsed.tip,
          taskId: matchedTask?.id || null,
        };
      }
    } catch (e) {
      // Fallback
    }

    return { suggestion: text, taskId: null };
  } catch (error) {
    console.error('Gemini API error:', error);
    return getTaskSuggestionFallback(tasks, gapDuration);
  }
};

/**
 * Fallback task suggestion when Gemini API is unavailable
 */
const getTaskSuggestionFallback = (tasks, gapDuration) => {
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const deadlineTasks = pendingTasks.filter((t) => t.category === 'deadline');
  const fitTasks = pendingTasks.filter((t) => t.estimated_minutes <= gapDuration);

  if (deadlineTasks.length > 0) {
    const task = deadlineTasks[0];
    return {
      suggestion: `Work on "${task.title}" - deadline approaching!`,
      taskId: task.id,
    };
  }

  if (fitTasks.length > 0) {
    const task = fitTasks[0];
    return {
      suggestion: `Try "${task.title}" - it fits in your ${gapDuration} min gap!`,
      taskId: task.id,
    };
  }

  return { suggestion: 'All tasks completed! Take a well-deserved break. 🎉', taskId: null };
};

/**
 * Get AI appreciation message for daily summary.
 */
export const getDailyAppreciation = async (stats) => {
  try {
    const prompt = `You are a fun, encouraging student assistant like Duolingo's owl but friendlier.
A student just finished their day. Here are their stats:
- Tasks completed: ${stats.completed}/${stats.total}
- Classes attended: ${stats.classesAttended}/${stats.totalClasses}
- Ate breakfast: ${stats.breakfast ? 'Yes' : 'No'}
- Ate lunch: ${stats.lunch ? 'Yes' : 'No'}
- Ate dinner: ${stats.dinner ? 'Yes' : 'No'}
- Current streak: ${stats.streak} days

Give a 2-3 sentence encouraging message. Use emojis. If they did well, celebrate! If not, be gentle but motivating. Also suggest one thing to improve tomorrow.`;

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 150,
        },
      }),
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || getFallbackMessage(stats);
  } catch (error) {
    return getFallbackMessage(stats);
  }
};

/**
 * Get AI suggestions for what to do after 10 PM.
 */
export const getEveningProductivityTips = async (incompleteTasks) => {
  try {
    const taskList = incompleteTasks
      .map((t) => `${t.title} (deadline: ${t.deadline})`)
      .join(', ');

    const prompt = `A student has finished their scheduled day but has incomplete tasks: ${taskList || 'none'}.
It's 10 PM. Suggest 2-3 light, productive activities they can do before bed (15-30 min max each). 
Consider that it's late and they should wind down. Keep it brief and friendly with emojis.`;

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 200,
        },
      }),
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 
      '🌙 Review tomorrow\'s schedule, organize your notes, and get a good night\'s sleep!';
  } catch (error) {
    return '🌙 Review tomorrow\'s schedule, organize your notes, and get a good night\'s sleep!';
  }
};

function getFallbackMessage(stats) {
  const rate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  
  if (rate >= 90) {
    return `🎉 Outstanding! You completed ${stats.completed}/${stats.total} tasks today! You're on a ${stats.streak}-day streak! Keep this fire burning! 🔥`;
  } else if (rate >= 70) {
    return `💪 Great job! ${stats.completed}/${stats.total} tasks done. You're making solid progress. Try to tackle the remaining tasks early tomorrow!`;
  } else if (rate >= 50) {
    return `📊 Decent day with ${stats.completed}/${stats.total} tasks completed. Tomorrow, try starting with the hardest task first thing in the morning!`;
  } else {
    return `🌱 ${stats.completed}/${stats.total} tasks today. Every day is a fresh start! Try breaking tasks into smaller chunks tomorrow. You've got this! 💪`;
  }
}
