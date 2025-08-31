const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { admin } = require('../config/firebase');
const { validateCompanyRegistration, validateUserRegistration, validateLogin } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: 'Too many authentication attempts, please try again later' }
});

// User registration - Users join the main company
router.post('/register', authLimiter, validateUserRegistration, async (req, res) => {
  try {
    const { firstName, lastName, email, password, department, phone } = req.validatedData;
    const db = admin.firestore();

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
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
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

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login
router.post('/login', authLimiter, validateLogin, async (req, res) => {
  try {
    const { email, password } = req.validatedData;
    const db = admin.firestore();

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
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp()
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

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
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
    res.status(403).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
