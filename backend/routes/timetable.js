const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const authMiddleware = require('../middleware/auth');

// Get timetable for a user (optionally by day)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { day } = req.query;
    let query = supabase
      .from('timetable')
      .select('*')
      .eq('user_id', req.user.id)
      .order('start_time', { ascending: true });

    if (day) {
      query = query.eq('day_of_week', day);
    }

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a timetable entry
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { subject, type, day_of_week, start_time, end_time, location } = req.body;

    const entry = {
      user_id: req.user.id,
      subject,
      type: type || 'class', // class, lab, tutorial
      day_of_week,
      start_time,
      end_time,
      location: location || '',
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('timetable')
      .insert(entry)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk upload timetable
router.post('/bulk', authMiddleware, async (req, res) => {
  try {
    const { entries } = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: 'Entries array is required' });
    }

    // Delete existing timetable
    await supabase
      .from('timetable')
      .delete()
      .eq('user_id', req.user.id);

    // Insert new entries
    const timetableEntries = entries.map(entry => ({
      user_id: req.user.id,
      subject: entry.subject,
      type: entry.type || 'class',
      day_of_week: entry.day_of_week,
      start_time: entry.start_time,
      end_time: entry.end_time,
      location: entry.location || '',
      created_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('timetable')
      .insert(timetableEntries)
      .select();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a timetable entry
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updated_at: new Date().toISOString() };

    const { data, error } = await supabase
      .from('timetable')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a timetable entry
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('timetable')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Timetable entry deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get free time gaps for today
router.get('/gaps', authMiddleware, async (req, res) => {
  try {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];

    const { data: timetable, error } = await supabase
      .from('timetable')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('day_of_week', today)
      .order('start_time', { ascending: true });

    if (error) return res.status(400).json({ error: error.message });

    // Calculate gaps
    const gaps = [];
    const dayStart = '08:00';
    const dayEnd = '21:00';

    if (timetable.length === 0) {
      gaps.push({ start: dayStart, end: dayEnd, duration_minutes: 780 });
    } else {
      // Gap before first class
      if (timetable[0].start_time > dayStart) {
        const duration = getMinutesDiff(dayStart, timetable[0].start_time);
        if (duration >= 20) {
          gaps.push({ start: dayStart, end: timetable[0].start_time, duration_minutes: duration });
        }
      }

      // Gaps between classes
      for (let i = 0; i < timetable.length - 1; i++) {
        const gapStart = timetable[i].end_time;
        const gapEnd = timetable[i + 1].start_time;
        const duration = getMinutesDiff(gapStart, gapEnd);

        if (duration >= 20) {
          gaps.push({ start: gapStart, end: gapEnd, duration_minutes: duration });
        }
      }

      // Gap after last class
      const lastEnd = timetable[timetable.length - 1].end_time;
      if (lastEnd < dayEnd) {
        const duration = getMinutesDiff(lastEnd, dayEnd);
        if (duration >= 20) {
          gaps.push({ start: lastEnd, end: dayEnd, duration_minutes: duration });
        }
      }
    }

    res.json({ today, timetable, gaps });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function getMinutesDiff(time1, time2) {
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);
  return (h2 * 60 + m2) - (h1 * 60 + m1);
}

module.exports = router;
