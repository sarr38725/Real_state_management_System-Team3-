const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const db = require('./config/database');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    message: 'Real Estate Management API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      properties: '/api/properties',
      schedules: '/api/schedules'
    }
  });
});

app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({
      status: 'OK',
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      database: 'Disconnected',
      error: error.message
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/schedules', scheduleRoutes);

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    stack: err.stack
  });
});

db.getConnection()
  .then(() => {
    console.log('✅ Database connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Database: real_estate_db`);
      console.log(`🔐 Environment: development`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    console.error('Please check database configuration and ensure MySQL is running');
    process.exit(1);
  });
