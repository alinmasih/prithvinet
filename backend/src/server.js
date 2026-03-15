require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');
const { updateAllEnvironmentalData } = require('./services/dataFetcher');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
app.use('/uploads', express.static('uploads'));

// Basic Route
app.get('/', (req, res) => {
  res.send('CECB PrithviNet API is running...');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/industries', require('./routes/industryRoutes'));
app.use('/api/stations', require('./routes/stationRoutes'));
app.use('/api/pollution', require('./routes/pollutionRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/water-sources', require('./routes/waterSourceRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));
app.use('/api/campaigns', require('./routes/campaignRoutes'));
app.use('/api/inspections', require('./routes/inspectionRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/entities', require('./routes/entityRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/regional', require('./routes/regionalRoutes'));
app.use('/api/monitoring', require('./routes/monitoringRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));
app.use('/api/map', require('./routes/mapRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/iot', require('./routes/iotRoutes'));
app.use('/api/forecasting', require('./routes/forecastingRoutes'));

// Serve Static Files from Frontend
const distPath = path.resolve(__dirname, '..', '..', 'frontend', 'dist');
console.log('Serving frontend from:', distPath);
app.use(express.static(distPath));

// SPA Fallback: Serve index.html for all non-API routes
// SPA Fallback: Serve index.html for all non-API routes
app.use((req, res, next) => {
  // If request is for an API route or a static file that wasn't found, let it pass through
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  // Otherwise, serve the frontend index.html for SPA routing
  res.sendFile(path.join(distPath, 'index.html'));
});


// Global Error Handler for Express
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Initialize environmental data and set up periodic refresh
  updateAllEnvironmentalData();
  setInterval(updateAllEnvironmentalData, 10 * 60 * 1000); // 10 minutes
});

server.on('error', (err) => {
  console.error('SERVER STARTUP ERROR:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please kill the existing process or use a different port.`);
  }
});

// Process Level Handlers to prevent crashes
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥');
  console.error('Name:', err.name, 'Message:', err.message);
  console.error('Stack:', err.stack);
  // In development, we might want to keep the server running
  console.log('Server will continue running. Please fix the rejection issue.');
});


process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error('Name:', err.name, 'Message:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
});


