# 🚀 Deploy ChatConnect to Vercel

This guide will help you deploy the web version of ChatConnect to Vercel.

---

## 📋 Prerequisites

1. ✅ GitHub repository (already done!)
2. ✅ Vercel account - Sign up at https://vercel.com
3. ✅ Backend running (your Render backend is ready)

---

## 🌐 Method 1: Deploy via Vercel Dashboard (Easiest)

### **Step 1: Go to Vercel**
Visit: https://vercel.com/new

### **Step 2: Import Your GitHub Repository**
1. Click **"Add New Project"**
2. Select **"Import Git Repository"**
3. Choose: `himanshu-firke/chatconnect-app`
4. Click **"Import"**

### **Step 3: Configure Project**
```
Framework Preset: Other
Root Directory: mobile
Build Command: npm run build:web
Output Directory: web-build
Install Command: npm install
```

### **Step 4: Add Environment Variables**
Click **"Environment Variables"** and add:

```
EXPO_PUBLIC_API_URL=https://chatconnect-app-j8zm.onrender.com/api
EXPO_PUBLIC_SOCKET_URL=https://chatconnect-app-j8zm.onrender.com
```

### **Step 5: Deploy!**
Click **"Deploy"** and wait 2-3 minutes.

Your app will be live at: `https://chatconnect-app-[random].vercel.app`

---

## 💻 Method 2: Deploy via Vercel CLI

### **Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

### **Step 2: Login to Vercel**
```bash
vercel login
```

### **Step 3: Deploy from Mobile Directory**
```bash
cd c:\Users\Himanshu\OneDrive\Documents\newai\mobile

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name? chatconnect-app
# - Directory? ./
# - Override settings? Yes
#   - Build Command: npm run build:web
#   - Output Directory: web-build
#   - Development Command: npm start
```

### **Step 4: Set Environment Variables**
```bash
vercel env add EXPO_PUBLIC_API_URL
# Enter: https://chatconnect-app-j8zm.onrender.com/api

vercel env add EXPO_PUBLIC_SOCKET_URL
# Enter: https://chatconnect-app-j8zm.onrender.com
```

### **Step 5: Deploy to Production**
```bash
vercel --prod
```

---

## 🔧 Troubleshooting

### **Issue: Build Fails**

**Solution 1: Clear Cache**
```bash
cd mobile
rm -rf node_modules
rm -rf .expo
npm install
npm run build:web
```

**Solution 2: Update API Configuration**
Make sure `mobile/src/config/api.js` uses environment variables:

```javascript
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000';
```

### **Issue: App Shows Blank Page**

Check browser console (F12) for errors. Common fixes:
- Verify environment variables in Vercel dashboard
- Check backend CORS settings allow your Vercel domain
- Redeploy after fixing

### **Issue: Socket Connection Fails**

Add your Vercel domain to backend CORS:
```javascript
// server/.env
ALLOWED_ORIGINS=https://your-app.vercel.app
```

Then restart your backend on Render.

---

## ✅ Post-Deployment Checklist

- [ ] App loads successfully
- [ ] Can see login screen
- [ ] Can login with demo credentials
- [ ] Can see user list
- [ ] Can send messages in real-time
- [ ] Socket connection works
- [ ] No console errors

---

## 🎯 Custom Domain (Optional)

### **Add Your Own Domain:**

1. Go to Vercel Dashboard → Your Project
2. Click **"Settings"** → **"Domains"**
3. Click **"Add Domain"**
4. Enter your domain (e.g., `chat.yourdomain.com`)
5. Follow DNS configuration instructions
6. Wait for DNS propagation (5-10 minutes)

---

## 📝 Update README with Vercel Link

After deployment, update your README.md:

```markdown
## 🔗 Live Demo
**Web App:** https://chatconnect-app-[your-id].vercel.app
**Backend API:** https://chatconnect-app-j8zm.onrender.com/api

### Demo Login Details
- **Email:** alice@chatconnect.demo
- **Password:** password123
```

---

## 🚀 Automatic Deployments

Vercel automatically redeploys when you push to GitHub!

Every `git push origin main` triggers a new deployment. ✨

---

## 📊 Vercel Dashboard Features

- **Analytics** - See visitor stats
- **Logs** - Debug build issues
- **Speed Insights** - Performance metrics
- **Preview Deployments** - Test before production

---

## 💡 Pro Tips

1. **Preview URLs:** Every PR gets a unique preview URL
2. **Rollbacks:** Revert to previous deployments in one click
3. **Edge Network:** Global CDN for fast loading
4. **HTTPS:** Automatic SSL certificates

---

## 🎉 You're Done!

Your ChatConnect app is now live on Vercel! 🚀

Share your link:
```
https://chatconnect-app-[your-id].vercel.app
```

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Expo Web: https://docs.expo.dev/workflow/web/
- ChatConnect Issues: https://github.com/himanshu-firke/chatconnect-app/issues
