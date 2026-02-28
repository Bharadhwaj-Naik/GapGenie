const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const authMiddleware = require('../middleware/auth');

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      // Create profile if it doesn't exist
      const newProfile = {
        id: req.user.id,
        email: req.user.email,
        full_name: req.user.user_metadata?.full_name || '',
        avatar_url: req.user.user_metadata?.avatar_url || '',
        created_at: new Date().toISOString(),
      };

      const { data: created, error: createErr } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

      if (createErr) return res.status(400).json({ error: createErr.message });
      return res.json(created);
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { full_name, phone, college, year, branch } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name, phone, college, year, branch, updated_at: new Date().toISOString() })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
