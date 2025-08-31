# Altibbe Setup Guide

## Quick Start

### 1. Dependencies Installation
All dependencies have been installed. If you need to reinstall:

```bash
# Root dependencies
npm install

# Server dependencies  
cd server
npm install

# Client dependencies
cd ../client
npm install
cd ..
```

### 2. Environment Configuration

#### Server Environment (.env in server directory)
Create `server/.env` file with your Firebase credentials:

```env
PORT=5000
NODE_ENV=development

# Firebase Configuration (Get from Firebase Console > Project Settings > Service Accounts)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com

# JWT Secret (Generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# CORS Origin
CORS_ORIGIN=http://localhost:3000
```

#### Client Environment (.env in client directory)
Create `client/.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Firebase Setup Steps

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project"
   - Follow the setup wizard

2. **Enable Firestore Database**
   - In your Firebase project, go to "Firestore Database"
   - Click "Create database"
   - Choose "Start in test mode" for development
   - Select a location for your database

3. **Generate Service Account Key**
   - Go to Project Settings (gear icon) > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
   - Copy the values to your server/.env file:
     - `project_id` → `FIREBASE_PROJECT_ID`
     - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and \n characters)
     - `client_email` → `FIREBASE_CLIENT_EMAIL`

### 4. Seed Sample Data

```bash
cd server
node scripts/seedQuestions.js
```

This will populate your Firestore database with sample question templates for different product categories.

### 5. Start the Application

**Option 1: Run both frontend and backend together**
```bash
npm run dev
```

**Option 2: Run separately**
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
npm run client
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### 6. Test the Application

1. **Register a Company**
   - Go to http://localhost:3000
   - Click "Create company account"
   - Fill in the registration form

2. **Login**
   - Use the credentials you just created

3. **Add a Product**
   - Click "Add Product" from the dashboard
   - Fill out the multi-step form
   - Notice how questions change based on the category selected

4. **Generate Reports**
   - Go to the Reports page
   - Generate PDF reports for your products

## Troubleshooting

### Common Issues

**Firebase Connection Issues**
- Verify your Firebase project ID is correct
- Check that Firestore is enabled in your Firebase console
- Ensure your service account key is properly formatted in the .env file

**CORS Errors**
- Make sure CORS_ORIGIN in server/.env matches your frontend URL
- Check that both servers are running on the correct ports

**Build Errors**
- Try deleting node_modules and reinstalling: `rm -rf node_modules && npm install`
- Check that all environment variables are properly set

**PDF Generation Issues**
- Ensure the server/temp directory exists (it will be created automatically)
- Check file permissions for writing temporary files

### Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload during development
2. **API Testing**: Use the health check endpoint: `GET http://localhost:5000/api/health`
3. **Database Inspection**: Use Firebase Console to view your Firestore data
4. **Logs**: Check the terminal output for detailed error messages

## Next Steps

- Customize question templates in the database
- Add more product categories
- Implement additional validation rules
- Add email notifications
- Set up production deployment

## Support

If you encounter any issues:
1. Check the console logs in your browser and terminal
2. Verify all environment variables are set correctly  
3. Ensure Firebase is properly configured
4. Review the README.md for additional documentation
