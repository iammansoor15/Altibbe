const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { admin } = require('../config/firebase');
const { validateCompanyRegistration, validateUserRegistration, validateLogin } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// In-memory store for mock users (for development when Firebase is not available)
const mockUsers = new Map();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 attempts per window (increased for testing)
  message: { error: 'Too many authentication attempts, please try again later' }
});

// User registration - Users join the main company
router.post('/register', authLimiter, validateUserRegistration, async (req, res) => {
  try {
    const { firstName, lastName, email, password, department, phone } = req.validatedData;

    const db = admin.firestore();
    if (!db) {
      return res.status(503).json({ error: 'Firebase not initialized' });
    }

    try {
      // Check if user already exists
      const existingUser = await db.collection('users').where('email', '==', email).get();
      if (!existingUser.empty) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user document
      const userData = {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        department: department || null,
        phone: phone || null,
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      };

      const userRef = await db.collection('users').add(userData);

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: userRef.id,
          email,
          firstName,
          lastName
        },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: userRef.id,
          firstName,
          lastName,
          email,
          department,
          role: 'user'
        }
      });

    } catch (firebaseError) {
      console.error('Firebase operation failed:', firebaseError);
      console.log('Using mock authentication for development...');
      
      // Check if user already exists in mock storage
      if (mockUsers.has(email)) {
        return res.status(409).json({ error: 'User with this email already exists (mock mode)' });
      }
      
      // Hash password for mock storage
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Mock registration for development
      const mockUserId = 'mock-user-' + Date.now();
      const userData = {
        id: mockUserId,
        firstName,
        lastName,
        email,
        password: hashedPassword,
        department: department || null,
        phone: phone || null,
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      };
      
      // Store user in mock storage
      mockUsers.set(email, userData);
      
      const token = jwt.sign(
        {
          userId: mockUserId,
          email,
          firstName,
          lastName
        },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'User registered successfully (mock mode)',
        token,
        user: {
          id: mockUserId,
          firstName,
          lastName,
          email,
          department,
          role: 'user'
        }
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// User login
router.post('/login', authLimiter, validateLogin, async (req, res) => {
  try {
    const { email, password } = req.validatedData;

    const db = admin.firestore();
    if (!db) {
      return res.status(503).json({ error: 'Firebase not initialized' });
    }

    try {
      // Find user by email
      const userQuery = await db.collection('users').where('email', '==', email).get();

      if (userQuery.empty) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const userDoc = userQuery.docs[0];
      const userData = userDoc.data();

      // Check if user is active
      if (!userData.isActive) {
        return res.status(401).json({ error: 'Account is deactivated' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, userData.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: userDoc.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName
        },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
        { expiresIn: '24h' }
      );

      // Update last login
      await userDoc.ref.update({
        lastLoginAt: new Date().toISOString()
      });

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: userDoc.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          department: userData.department,
          role: userData.role
        }
      });

    } catch (firebaseError) {
      console.error('Firebase operation failed:', firebaseError);
      console.log('Using mock authentication for development...');
      
      // Check if user exists in mock storage
      const mockUser = mockUsers.get(email);
      if (mockUser) {
        // Verify password
        const isValidPassword = await bcrypt.compare(password, mockUser.password);
        if (isValidPassword && mockUser.isActive) {
          const token = jwt.sign(
            {
              userId: mockUser.id,
              email: mockUser.email,
              firstName: mockUser.firstName,
              lastName: mockUser.lastName
            },
            process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
            { expiresIn: '24h' }
          );

          // Update last login
          mockUser.lastLoginAt = new Date().toISOString();

          return res.json({
            message: 'Login successful (mock mode)',
            token,
            user: {
              id: mockUser.id,
              firstName: mockUser.firstName,
              lastName: mockUser.lastName,
              email: mockUser.email,
              department: mockUser.department,
              role: mockUser.role
            }
          });
        }
      }
      
      // Fallback to hardcoded test user
      if (email === 'test@altibbe.com' && password === 'test12345') {
        const mockUserId = 'mock-user-test';
        const token = jwt.sign(
          {
            userId: mockUserId,
            email,
            firstName: 'Test',
            lastName: 'User'
          },
          process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
          { expiresIn: '24h' }
        );

        return res.json({
          message: 'Login successful (mock mode - default test user)',
          token,
          user: {
            id: mockUserId,
            firstName: 'Test',
            lastName: 'User',
            email,
            department: 'IT',
            role: 'user'
          }
        });
      }
      
      return res.status(401).json({ 
        error: 'Invalid credentials (mock mode)', 
        hint: 'Either register a new user or use test@altibbe.com / test12345'
      });
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');

    const db = admin.firestore();
    if (!db) {
      return res.status(503).json({ error: 'Firebase not initialized' });
    }

    // Verify user still exists and is active
    const userDoc = await db.collection('users').doc(decoded.userId).get();

    if (!userDoc.exists || !userDoc.data().isActive) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userData = userDoc.data();
    res.json({
      valid: true,
      user: {
        id: userDoc.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        department: userData.department,
        role: userData.role
      }
    });

  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token', details: error.message });
  }
});

module.exports = router;
