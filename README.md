# Altibbe - Multi-Step Product Form Application

A comprehensive web application featuring a dynamic multi-step form with conditional logic, secure APIs, PDF report generation, and Firebase database integration.

## Features

- 🔐 **Authentication System**: Company-based registration and login
- 📋 **Dynamic Multi-Step Form**: Conditional logic based on user responses
- 🗄️ **Secure APIs**: RESTful APIs for product data management
- 📊 **PDF Report Generation**: Individual and summary reports
- 🔥 **Firebase Integration**: Real-time database with Firestore
- 🎨 **Modern UI**: React + TypeScript with Tailwind CSS
- ⚡ **Fast Development**: Vite for frontend, Express for backend

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Hook Form for form management
- React Query for API state management
- React Router for navigation

### Backend
- Node.js with Express
- Firebase Admin SDK
- JWT for authentication
- PDFKit for report generation
- Joi for validation
- bcryptjs for password hashing

### Database
- Firebase Firestore

## Project Structure

```
altibbe/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── server/                 # Express backend
│   ├── config/             # Configuration files
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   ├── services/           # Business logic services
│   ├── scripts/            # Utility scripts
│   └── package.json
└── package.json            # Root package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project with Firestore enabled

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd altibbe

# Install root dependencies
npm install

# Install all dependencies (root, server, client)
npm run install-all
```

### 2. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Create a service account:
   - Go to Project Settings > Service Accounts
   - Generate new private key
   - Download the JSON file

### 3. Environment Configuration

Create `.env` file in the `server` directory:

```env
PORT=5000
NODE_ENV=development

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-here

# CORS Origin
CORS_ORIGIN=http://localhost:3000
```

Create `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Seed Sample Data

```bash
cd server
node scripts/seedQuestions.js
```

### 5. Start the Application

```bash
# Development mode (runs both frontend and backend)
npm run dev

# Or run separately:
# Backend (from root directory)
npm run server

# Frontend (from root directory)  
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Company registration
- `POST /api/auth/login` - Company login
- `GET /api/auth/verify` - Verify JWT token

### Products
- `GET /api/products` - Get all products (with pagination)
- `GET /api/products/:id` - Get specific product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/:id/pdf` - Generate product PDF report
- `GET /api/products/reports/summary` - Generate summary PDF report

### Questions
- `GET /api/questions` - Get all question templates
- `GET /api/questions/category/:category` - Get questions by category
- `POST /api/questions` - Create question template
- `PUT /api/questions/:id` - Update question template
- `DELETE /api/questions/:id` - Delete question template
- `GET /api/questions/categories` - Get available categories

## Database Schema

### Collections

#### `companies`
```javascript
{
  companyName: string,
  email: string,
  password: string, // hashed
  industry: string,
  contactPerson: string,
  phone?: string,
  address?: object,
  createdAt: timestamp,
  updatedAt: timestamp,
  isActive: boolean
}
```

#### `products`
```javascript
{
  companyId: string,
  productName: string,
  category: string,
  description?: string,
  price?: number,
  specifications?: object,
  questions: array,
  submittedAt: timestamp,
  status: 'draft' | 'submitted' | 'approved' | 'rejected',
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `questionTemplates`
```javascript
{
  question: string,
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect' | 'date' | 'email' | 'phone' | 'textarea',
  required: boolean,
  options: array,
  categories: array,
  conditionalLogic?: object,
  validationRules: object,
  helpText: string,
  order: number,
  createdBy: string,
  createdAt: timestamp,
  updatedAt: timestamp,
  isActive: boolean
}
```

## Features in Detail

### Multi-Step Form with Conditional Logic
- Dynamic form generation based on product category
- Conditional question display based on previous answers
- Real-time validation with helpful error messages
- Progress tracking with visual step indicators

### Authentication System
- Company-based authentication (not individual users)
- JWT token-based session management
- Protected routes and API endpoints
- Password hashing with bcrypt

### PDF Report Generation
- Individual product reports with all details
- Summary reports with statistics and product lists
- Automatic cleanup of temporary files
- Professional formatting with company branding

### Security Features
- Rate limiting on authentication endpoints
- Input validation and sanitization
- CORS protection
- Helmet.js security headers
- JWT token expiration and verification

## Development

### Adding New Question Types
1. Update the `Question` type in `client/src/types/index.ts`
2. Add rendering logic in `MultiStepForm.tsx`
3. Update validation in `server/middleware/validation.js`

### Adding New API Endpoints
1. Create route handler in `server/routes/`
2. Add middleware for authentication/validation
3. Update API service in `client/src/services/api.ts`
4. Add TypeScript types if needed

### Customizing the UI
- Modify Tailwind configuration in `client/tailwind.config.js`
- Update component styles in `client/src/index.css`
- Create new UI components in `client/src/components/ui/`

## Deployment

### Backend Deployment
1. Set up production environment variables
2. Configure Firebase for production
3. Deploy to your preferred platform (Heroku, Railway, etc.)

### Frontend Deployment
1. Build the production version: `cd client && npm run build`
2. Deploy the `dist` folder to static hosting (Vercel, Netlify, etc.)
3. Update API URL in environment variables

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions, please open an issue in the GitHub repository.
