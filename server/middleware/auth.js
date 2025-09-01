const jwt = require('jsonwebtoken');
const { admin } = require('../config/firebase');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;

    const { userId } = req.user;

    // Verify user exists in Firebase (skip if Firebase not available or mock user)
    if (admin.apps.length > 0 && !userId.startsWith('mock-user-')) {
      try {
        const db = admin.firestore();
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
          return res.status(404).json({ error: 'User not found' });
        }

        req.userData = userDoc.data();
      } catch (firebaseError) {
        console.log('Firebase user lookup failed, using token data for mock/dev mode');
        // Fallback to token data if Firebase operation fails
        req.userData = {
          firstName: decoded.firstName,
          lastName: decoded.lastName,
          email: decoded.email,
          role: 'user'
        };
      }
    } else {
      // If Firebase not available or mock user, just use token data
      req.userData = {
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        email: decoded.email,
        role: 'user'
      };
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { authenticateToken, authenticateUser };
