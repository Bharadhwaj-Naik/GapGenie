require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const timetableRoutes = require('./routes/timetable');
const progressRoutes = require('./routes/progress');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'GapGenie API is running' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'GapGenie API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/progress', progressRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`GapGenie Backend running on http://0.0.0.0:${PORT}`);
});