const admin = require('firebase-admin');
const path = require('path');

const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length > 0) {
      console.log('Firebase Admin already initialized');
      return admin.firestore();
    }

    // Load service account credentials from file
    const serviceAccount = require('./firebase-credentials.json');

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('Firebase Admin initialized with service account credentials');
    console.log('Firebase Admin initialized successfully');
    return admin.firestore();
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    // Don't exit, just log the error and continue with limited functionality
    console.log('Continuing with limited Firebase functionality...');
    return null;
  }
};

module.exports = { initializeFirebase, admin };
