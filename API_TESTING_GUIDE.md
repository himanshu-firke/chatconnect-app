# 🧪 ChatConnect API Testing Guide

## 🌐 Your Live Backend URL
Replace `YOUR_BACKEND_URL` with your actual Render backend URL (e.g., `https://chatconnect-backend.onrender.com`)

## 📋 API Endpoints to Test

### 1. **Health Check** ✅
```bash
GET YOUR_BACKEND_URL/health
```
**Expected Response:**
```json
{
  "success": true,
  "message": "ChatConnect server is running",
  "timestamp": "2025-08-25T11:26:00.000Z",
  "environment": "production"
}
```

### 2. **User Registration** 👤
```bash
POST YOUR_BACKEND_URL/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```
**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "username": "testuser",
      "email": "test@example.com"
    },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### 3. **User Login** 🔐
```bash
POST YOUR_BACKEND_URL/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### 4. **Demo User Login** 🎯
```bash
POST YOUR_BACKEND_URL/api/auth/login
Content-Type: application/json

{
  "email": "alice@chatconnect.demo",
  "password": "password123"
}
```

### 5. **Get All Users** 👥
```bash
GET YOUR_BACKEND_URL/api/users
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 6. **Get Current User** 👤
```bash
GET YOUR_BACKEND_URL/api/auth/me
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## 🛠️ Testing Methods

### **Option 1: Browser (Simple)**
1. Open browser and go to: `YOUR_BACKEND_URL/health`
2. Should see the health check response

### **Option 2: Postman/Insomnia (Recommended)**
1. Import the endpoints above
2. Test registration → login → get users flow
3. Copy access token for authenticated requests

### **Option 3: curl Commands**
```bash
# Health check
curl YOUR_BACKEND_URL/health

# Register user
curl -X POST YOUR_BACKEND_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST YOUR_BACKEND_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get users (replace TOKEN with actual token)
curl YOUR_BACKEND_URL/api/users \
  -H "Authorization: Bearer TOKEN"
```

### **Option 4: Online API Tester**
1. Go to [reqbin.com](https://reqbin.com) or [hoppscotch.io](https://hoppscotch.io)
2. Test endpoints directly in browser

## 🎯 Demo Flow Test

### Step 1: Test Demo Login
```json
POST YOUR_BACKEND_URL/api/auth/login
{
  "email": "alice@chatconnect.demo",
  "password": "password123"
}
```

### Step 2: Get Users List
```bash
GET YOUR_BACKEND_URL/api/users
Authorization: Bearer [token from step 1]
```

### Step 3: Test Real-time Features
- Use Socket.IO client to test messaging
- Or test via your mobile app

## ✅ Success Indicators

**Backend is working if:**
- ✅ Health check returns success
- ✅ Demo login works and returns token
- ✅ Users endpoint returns user list
- ✅ No CORS errors in browser console

## 🚨 Common Issues

**"API endpoint not found":**
- Check URL has `/api/` prefix for auth/users routes
- Verify backend URL is correct

**CORS errors:**
- Backend should allow all origins (`*`) in production
- Check browser console for specific errors

**Database errors:**
- Check if MongoDB Atlas is connected
- Verify environment variables are set

## 📱 Test with Mobile App

1. Update `mobile/src/config/api.js`:
```javascript
export const API_BASE_URL = 'YOUR_BACKEND_URL/api';
export const SOCKET_URL = 'YOUR_BACKEND_URL';
```

2. Test login with demo credentials:
   - Email: `alice@chatconnect.demo`
   - Password: `password123`

## 🎉 Next Steps

Once API testing is successful:
1. Update README with live backend URL
2. Test mobile app with live backend
3. Take screenshots for GitHub
4. Record demo video

Your backend is now live and ready for testing! 🚀
