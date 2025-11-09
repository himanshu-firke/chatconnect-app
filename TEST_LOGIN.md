# Login Debug Guide 🔍

## Quick Fixes Applied:
1. ✅ Socket connection is now non-blocking
2. ✅ Added timeout handling (5 seconds)
3. ✅ Added polling transport as fallback
4. ✅ Login will complete even if socket fails

---

## Step-by-Step Testing:

### 1. **Start Backend Server**
```bash
cd c:\Users\Himanshu\OneDrive\Documents\newai\server
npm run dev
```

**Expected Output:**
```
✅ MongoDB Connected: ...
🚀 ChatConnect Server Started Successfully!
📡 Server running on port 3000
```

### 2. **Test Backend API (in browser)**
Open browser and go to:
```
http://localhost:3000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "ChatConnect server is running"
}
```

### 3. **Test Login API (Optional)**
Open browser console (F12) and paste:
```javascript
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'alice@chatconnect.demo',
    password: 'password123'
  })
})
.then(r => r.json())
.then(data => console.log('Login Response:', data))
.catch(err => console.error('Login Error:', err));
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

---

### 4. **Start Mobile App**
```bash
cd c:\Users\Himanshu\OneDrive\Documents\newai\mobile
npm start -- --clear
```

Press **`w`** for web browser

---

### 5. **Test Login in App**

#### Option 1: Use Demo Credentials Button
- Click "Fill Demo Credentials"
- Click "Sign In"

#### Option 2: Manual Entry
- Email: `alice@chatconnect.demo`
- Password: `password123`
- Click "Sign In"

---

## What Should Happen:

1. ✅ Click "Sign In"
2. ✅ See console logs:
   - `🔐 Attempting login for: alice@chatconnect.demo`
   - `✅ Login response received: true`
   - `💾 Storing tokens and user data...`
   - `✅ Tokens stored successfully`
3. ✅ **App should redirect to UserList screen**
4. ⚠️ Socket might show warning (this is OK now):
   - `⚠️ Socket connection timeout, but continuing...`

---

## Troubleshooting:

### Problem: Still stuck on login screen

**Check Browser Console (F12):**

1. **Network Tab:**
   - Look for `POST http://localhost:3000/api/auth/login`
   - Status should be `200 OK`
   - If failed, check:
     - Is server running?
     - Is port 3000 available?

2. **Console Tab:**
   - Look for errors in red
   - Check API configuration logs
   - Common issues:
     - `Network Error` = Server not running
     - `CORS Error` = Server needs restart
     - `401 Unauthorized` = Wrong credentials

### Problem: CORS Error

**Restart the server:**
```bash
# Kill server (Ctrl+C)
# Restart
cd server
npm run dev
```

### Problem: Port 3000 in use

**Find and kill the process:**
```bash
# Windows Command Prompt
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

---

## Debug Commands:

### Check if server is responding:
```bash
curl http://localhost:3000/health
```

### Check MongoDB connection:
Look at server console for:
```
✅ MongoDB Connected: ac-7m1uvki-shard-00-00.gjqrhqb.mongodb.net
```

### Clear app cache:
```bash
cd mobile
npm start -- --clear
```

---

## Expected Console Output (Success):

### Server Console:
```
✅ MongoDB Connected
🚀 ChatConnect Server Started Successfully!
📡 Server running on port 3000
```

### Mobile App Console:
```
API Configuration: {
  API_BASE_URL: 'http://localhost:3000/api',
  SOCKET_URL: 'http://localhost:3000'
}
🔐 Attempting login for: alice@chatconnect.demo
✅ Login response received: true
💾 Storing tokens and user data...
✅ Tokens stored successfully
⚠️ Socket connection timeout, but continuing...
```

### Result:
**✅ App navigates to UserList screen showing all 30 users!**

---

## Still Not Working?

Share these details:
1. Server console output
2. Browser console errors (F12)
3. Network tab status codes
4. Any error messages

The socket timeout is expected and won't block login anymore!
