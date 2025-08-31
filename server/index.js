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

// Initialize Firebase
const db = initializeFirebase();

// Check if Firebase initialized successfully
if (!db) {
  console.log('Firebase not initialized - some features may not work');
}

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Logging
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later' }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
  console.log(`CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
});
