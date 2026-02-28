const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const authMiddleware = require('../middleware/auth');

// Get all tasks for a user (optionally filter by date)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { date } = req.query;
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', req.user.id)
      .order('deadline', { ascending: true });

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new task
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, category, deadline, date, priority, estimated_minutes } = req.body;

    const task = {
      user_id: req.user.id,
      title,
      description: description || '',
      category: category || 'extra', // classes, labs, tuts, deadline, extra
      deadline,
      date,
      priority: priority || 'medium',
      estimated_minutes: estimated_minutes || 30,
      status: 'pending',
      skip_count: 0,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a task
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body, updated_at: new Date().toISOString() };

    const { data, error } = await supabase
      .from('tasks')
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

// Skip a task (increment skip count, auto-reschedule if skipped 3 times)
router.post('/:id/skip', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Get current task
    const { data: task, error: fetchErr } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchErr) return res.status(400).json({ error: fetchErr.message });

    const newSkipCount = (task.skip_count || 0) + 1;
    const updates = { skip_count: newSkipCount, updated_at: new Date().toISOString() };

    // Auto-reschedule if skipped 3 times
    if (newSkipCount >= 3) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      updates.date = tomorrow.toISOString().split('T')[0];
      updates.skip_count = 0;
      updates.status = 'rescheduled';
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ ...data, rescheduled: newSkipCount >= 3 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Complete a task
router.post('/:id/complete', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
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

// Delete a task
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
