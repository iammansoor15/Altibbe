const admin = require('firebase-admin');
const path = require('path');

const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length > 0) {
      console.log('Firebase Admin already initialized');
      return admin.firestore();
    }

    // Try to load service account credentials from file
    let serviceAccount;
    try {
      serviceAccount = require('../firebase.json');
      console.log('Firebase credentials file found');
    } catch (fileError) {
      console.log('Firebase credentials file not found, checking environment variables...');
      
      // Try to use environment variables
      if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        serviceAccount = {
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL
        };
        console.log('Using Firebase credentials from environment variables');
      } else {
        console.log('No Firebase credentials found in file or environment variables');
        console.log('Running in development mode without Firebase...');
        return null;
      }
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id || serviceAccount.projectId
    });
    
    console.log('Firebase Admin initialized successfully');
    return admin.firestore();
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    console.log('Continuing with limited Firebase functionality...');
    return null;
  }
};

module.exports = { initializeFirebase, admin };
