# Altibbe - Product Transparency Platform

A comprehensive platform for evaluating and managing product transparency through AI-powered assessments and detailed reporting.

## Project Structure

```
D:\Altibbe\
├── client\           # React frontend application
├── server\           # Express.js backend API
├── ai-service\       # AI service for Gemini integration
└── README.md         # This file
```

## Services

### Client (React + TypeScript)
- **Port**: 3000
- **Framework**: React 18 with TypeScript
- **UI**: Tailwind CSS with custom components
- **State Management**: React Query + Context API
- **Features**: Product assessment, AI questions, reports dashboard

### Server (Express.js)
- **Port**: 5000
- **Framework**: Express.js with Node.js
- **Database**: Firebase Firestore
- **Authentication**: JWT tokens
- **Features**: API endpoints, PDF generation, Firebase integration

### AI Service (Express.js)
- **Port**: 5001
- **AI**: Google Gemini API integration
- **Features**: AI-powered question generation, transparency scoring

## Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore enabled
- Google Gemini API key

## Environment Setup

### 1. Client Environment
```bash
cd client
cp env.example .env
# Edit .env with your configuration
```

### 2. Server Environment
```bash
cd server
cp env.example .env
# Edit .env with your Firebase credentials and JWT secret
```

### 3. AI Service Environment
```bash
cd ai-service
# Create .env file with your Gemini API key
echo "GEMINI_API_KEY=your_api_key_here" > .env
```

## Installation & Running

### Option 1: Run All Services Together
```bash
# Install dependencies for all services
cd client && npm install
cd ../server && npm install
cd ../ai-service && npm install

# Start all services (in separate terminals)
# Terminal 1 - Client
cd client && npm run dev

# Terminal 2 - Server
cd server && npm start

# Terminal 3 - AI Service
cd ai-service && npm start
```

### Option 2: Run Individual Services
```bash
# Client
cd client && npm install && npm run dev

# Server
cd server && npm install && npm start

# AI Service
cd ai-service && npm install && npm start
```

## Available Scripts

### Client
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Server
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### AI Service
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Token verification

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/:id/pdf` - Download product PDF

### AI Features
- `POST /api/ai/generate-questions` - Generate AI questions
- `POST /api/ai/transparency-score` - Calculate transparency score

### Reports
- `GET /api/reports` - Get all reports
- `POST /api/reports/generate` - Generate new report
- `GET /api/reports/:id/download` - Download report as PDF

### Questions
- `GET /api/questions/categories` - Get question categories
- `GET /api/questions` - Get questions
- `POST /api/questions` - Create new question

## Features

### ✅ Product Assessment
- Multi-step form for product information
- Category-based question generation
- AI-powered transparency scoring
- Real-time validation and feedback

### ✅ AI Integration
- Google Gemini API for question generation
- Intelligent transparency scoring
- Context-aware assessments

### ✅ Reporting & Analytics
- PDF report generation
- Dashboard with analytics
- Export capabilities
- Historical tracking

### ✅ User Management
- Secure authentication
- Role-based access
- User profile management
- Session management

### ✅ Modern UI/UX
- Responsive design
- Dark/light theme support
- Loading states and animations
- Toast notifications

## Development

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Comprehensive error handling

### Database
- Firebase Firestore for data storage
- Real-time synchronization
- Secure data access patterns
- Backup and recovery

### Security
- JWT token authentication
- Input validation and sanitization
- CORS protection
- Rate limiting
- Helmet for security headers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure no errors
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
