require('dotenv').config();

// Set default JWT_SECRET if not provided
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';
}
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const { initializeFirebase, admin } = require('./config/firebase');
const pdfService = require('./services/pdfService');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const questionRoutes = require('./routes/questions');
const reportRoutes = require('./routes/reports');
const aiProxyRoutes = require('./routes/ai-proxy');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure logs directory/file
const logFilePath = path.join(__dirname, 'server.log');
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

// Initialize Firebase
const db = initializeFirebase();

// Check if Firebase initialized successfully
if (!db) {
  console.log('Firebase not initialized - some features may not work');
}

// Security middleware
app.use(helmet());

// CORS configuration - Allow ALL origins (no localhost restrictions)
app.use(cors({
  origin: true, // Allow ALL origins without any restrictions
  credentials: true, // allow cookies / auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-Custom-Header'],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));


// Body parsing middleware (must come before logging that uses req.body)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined'));
app.use(morgan('combined', { stream: logStream }));

// Simple request logging to file (method, url, body)
app.use((req, res, next) => {
  try {
    const line = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} body=${JSON.stringify(req.body || {})}\n`;
    logStream.write(line);
  } catch (_) {/* ignore */}
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later' }
});
app.use(limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug endpoint
app.get('/api/debug', (req, res) => {
  res.json({
    firebase_available: admin.apps.length > 0,
    jwt_secret_set: !!process.env.JWT_SECRET,
    jwt_secret_length: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiProxyRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  try {
    const line = `[${new Date().toISOString()}] ERROR ${req.method} ${req.originalUrl} msg="${err.message}" stack=${err.stack}\n`;
    logStream.write(line);
  } catch (_) {/* ignore */}
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation error', details: err.message });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized access' });
  }
  
  // Default error response
  res.status(500).json({ 
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Cleanup temp PDF files periodically
setInterval(() => {
  pdfService.cleanupTempFiles();
}, 60 * 60 * 1000); // Every hour

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS origin: ALL ORIGINS ALLOWED (no localhost restrictions)`);
  try {
    logStream.write(`[${new Date().toISOString()}] SERVER START port=${PORT}\n`);
  } catch (_) {/* ignore */}
});
