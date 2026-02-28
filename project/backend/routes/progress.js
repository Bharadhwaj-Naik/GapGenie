const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const authMiddleware = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Get daily progress
router.get('/daily', authMiddleware, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('date', targetDate);

    if (error) return res.status(400).json({ error: error.message });

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const skipped = tasks.filter(t => t.status === 'skipped' || t.skip_count > 0).length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const rescheduled = tasks.filter(t => t.status === 'rescheduled').length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Get attendance data
    const { data: attendance } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('date', targetDate);

    const classesAttended = attendance ? attendance.filter(a => a.attended).length : 0;
    const totalClasses = attendance ? attendance.length : 0;

    // Get meal tracking
    const { data: meals } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('date', targetDate)
      .single();

    res.json({
      date: targetDate,
      tasks: { total, completed, skipped, pending, rescheduled, completionRate },
      attendance: { classesAttended, totalClasses },
      meals: meals || { breakfast: false, lunch: false, dinner: false },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get weekly progress
router.get('/weekly', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', req.user.id)
      .gte('date', weekStart.toISOString().split('T')[0])
      .lte('date', today.toISOString().split('T')[0]);

    if (error) return res.status(400).json({ error: error.message });

    // Group by date
    const dailyData = {};
    for (let d = new Date(weekStart); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayTasks = tasks.filter(t => t.date === dateStr);
      const completed = dayTasks.filter(t => t.status === 'completed').length;
      dailyData[dateStr] = {
        total: dayTasks.length,
        completed,
        rate: dayTasks.length > 0 ? Math.round((completed / dayTasks.length) * 100) : 0,
      };
    }

    // Calculate streak
    const { data: streakData } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    res.json({
      dailyData,
      streak: streakData ? streakData.current_streak : 0,
      longestStreak: streakData ? streakData.longest_streak : 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Log attendance for a class
router.post('/attendance', authMiddleware, async (req, res) => {
  try {
    const { timetable_id, attended, date } = req.body;

    const entry = {
      user_id: req.user.id,
      timetable_id,
      attended,
      date: date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('attendance')
      .upsert(entry, { onConflict: 'user_id,timetable_id,date' })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Log meals
router.post('/meals', authMiddleware, async (req, res) => {
  try {
    const { breakfast, lunch, dinner, date } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const entry = {
      user_id: req.user.id,
      date: targetDate,
      breakfast: breakfast || false,
      lunch: lunch || false,
      dinner: dinner || false,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('meals')
      .upsert(entry, { onConflict: 'user_id,date' })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update streak
router.post('/streak', authMiddleware, async (req, res) => {
  try {
    const { data: existing } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    const today = new Date().toISOString().split('T')[0];

    if (!existing) {
      const { data, error } = await supabase
        .from('streaks')
        .insert({
          user_id: req.user.id,
          current_streak: 1,
          longest_streak: 1,
          last_active_date: today,
        })
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      return res.json(data);
    }

    const lastDate = new Date(existing.last_active_date);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

    let newStreak = existing.current_streak;
    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }

    const longestStreak = Math.max(newStreak, existing.longest_streak);

    const { data, error } = await supabase
      .from('streaks')
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_active_date: today,
      })
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get 10 PM summary with AI insights
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Fetch today's data
    const [tasksResult, attendanceResult, mealsResult] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', req.user.id).eq('date', today),
      supabase.from('attendance').select('*').eq('user_id', req.user.id).eq('date', today),
      supabase.from('meals').select('*').eq('user_id', req.user.id).eq('date', today).single(),
    ]);

    const tasks = tasksResult.data || [];
    const attendance = attendanceResult.data || [];
    const meals = mealsResult.data || {};

    const completed = tasks.filter(t => t.status === 'completed').length;
    const total = tasks.length;
    const classesAttended = attendance.filter(a => a.attended).length;

    // Generate AI appreciation/insight
    let aiMessage = '';
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `You are a friendly student assistant. Give a brief, encouraging 10 PM daily summary for a college student.
      Today's stats:
      - Tasks completed: ${completed}/${total}
      - Classes attended: ${classesAttended}/${attendance.length}
      - Breakfast: ${meals.breakfast ? 'Yes' : 'No'}
      - Lunch: ${meals.lunch ? 'Yes' : 'No'}
      - Dinner: ${meals.dinner ? 'Yes' : 'No'}
      
      Give a short (2-3 sentences) encouraging message and one improvement suggestion. Be like Duolingo - fun and motivating!`;

      const result = await model.generateContent(prompt);
      aiMessage = result.response.text();
    } catch (aiErr) {
      aiMessage = completed === total
        ? '🎉 Amazing! You completed all your tasks today! Keep this streak going!'
        : `📊 You completed ${completed}/${total} tasks. Tomorrow is a new chance to do even better!`;
    }

    res.json({
      date: today,
      tasksCompleted: completed,
      totalTasks: total,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      classesAttended,
      totalClasses: attendance.length,
      meals,
      aiMessage,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
