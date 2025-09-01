# 🚀 Altibbe Deployment Configuration

## Deployed Service URLs

### ✅ Live Services:
- **Client:** https://altibbe-sjtm.onrender.com
- **Server:** https://altibbe-server.onrender.com
- **AI Service:** https://altibbe-ai-service.onrender.com

## Environment Variables for Deployed Services

### Client (https://altibbe-sjtm.onrender.com)
Set the following environment variable in your Render client service:

```bash
VITE_API_URL=https://altibbe-server.onrender.com/api
```

### Server (https://altibbe-server.onrender.com)
Set the following environment variables in your Render server service:

```bash
# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_KEY=<your_firebase_service_account_json>

# JWT Configuration
JWT_SECRET=<your_jwt_secret_key>

# AI Service Configuration
AI_SERVICE_URL=https://altibbe-ai-service.onrender.com

# Gemini API
GEMINI_API_KEY=AIzaSyBglQtw94is5yZWl1iPcieLfcMVHGHKyCI

# Server Configuration
NODE_ENV=production
PORT=10000

# CORS (already configured to allow all origins)
CORS_ORIGIN=all
```

### AI Service (https://altibbe-ai-service.onrender.com)
Set the following environment variables in your Render AI service:

```bash
# Gemini API
GEMINI_API_KEY=AIzaSyBglQtw94is5yZWl1iPcieLfcMVHGHKyCI

# Server Configuration
NODE_ENV=production
PORT=10000

# Main Server URL
MAIN_SERVER_URL=https://altibbe-server.onrender.com

# CORS
CORS_ORIGIN=all
```

## Service Communication Flow

```
Client (https://altibbe-sjtm.onrender.com)
    ↓ (HTTPS)
Server (https://altibbe-server.onrender.com)
    ↓ (HTTPS)
AI Service (https://altibbe-ai-service.onrender.com)
```

## Current Configuration Status

✅ **Client configured** to connect to deployed server
✅ **Server configured** to connect to deployed AI service
✅ **AI Service configured** to communicate with deployed server
✅ **CORS configured** to allow all origins (including deployed client)
✅ **Environment variables** documented above

## Testing Deployment

### Test All Services:

**1. Server Health:**
```bash
curl https://altibbe-server.onrender.com/api/health
```

**2. AI Service Health:**
```bash
curl https://altibbe-ai-service.onrender.com/api/ai/health
```

**3. Server AI Proxy Health:**
```bash
curl https://altibbe-server.onrender.com/api/ai/health
```

**4. Test CORS from Client:**
```bash
curl -H "Origin: https://altibbe-sjtm.onrender.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS https://altibbe-server.onrender.com/api/auth/register
```

### PowerShell Testing:

```powershell
# Test Server Health
Invoke-WebRequest -Uri "https://altibbe-server.onrender.com/api/health" -Method GET

# Test AI Service Health
Invoke-WebRequest -Uri "https://altibbe-ai-service.onrender.com/api/ai/health" -Method GET

# Test Server AI Proxy
Invoke-WebRequest -Uri "https://altibbe-server.onrender.com/api/ai/health" -Method GET
```

## Notes

- All services are configured to allow cross-origin requests from any domain
- Client automatically connects to deployed server URL
- Server proxies AI requests to deployed AI service
- AI Service communicates with the deployed main server for data
- Firebase authentication is ready for production use
- All CORS restrictions have been removed for global access
- All services use HTTPS for secure communication
