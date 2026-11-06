const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/config');
const { testConnection } = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roleRoutes = require('./routes/roleRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const path = require('path');
const fs = require('fs');

// Middleware imports
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Global Middleware
app.use(cors({
  origin: '*', // Allow frontend client
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'RBAC Portal Backend API',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Static frontend serving if built
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Error Handling for unmatched API routes
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
if (require.main === module) {
  const PORT = config.port;
  testConnection()
    .then(() => {
      console.log('✓ Successfully connected to MySQL database');
      app.listen(PORT, () => {
        console.log(`====================================================`);
        console.log(` RBAC Portal Backend running on http://localhost:${PORT}`);
        console.log(` Environment: ${config.nodeEnv}`);
        console.log(`====================================================`);
      });
    })
    .catch((err) => {
      console.error('Failed to connect to database on startup:', err.message);
      process.exit(1);
    });
}

module.exports = app;
