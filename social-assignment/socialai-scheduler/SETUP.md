# SocialAI Scheduler - Setup Guide

## Project Overview

AI-Powered Social Media Scheduler built for the Humanity Founders hackathon. This full-stack application combines React.js frontend with Node.js backend to provide intelligent social media management.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB (local or Atlas)
- Git

### 1. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### 2. Environment Configuration

**Backend:** Copy `config.env` to `.env` and update with your actual API keys:
```bash
cp config.env .env
```

Required API keys:
- MongoDB URI (Atlas or local)
- JWT Secret
- Google Gemini API key
- Social media API credentials (Twitter, LinkedIn, Instagram)

### 3. Start Development Servers

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🏗️ Project Structure

```
socialai-scheduler/
├── frontend/                 # React.js application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   └── App.jsx         # Main app component
│   ├── package.json
│   └── tailwind.config.js
├── backend/                 # Node.js + Express API
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── server.js          # Main server file
│   └── package.json
└── README.md
```

## ✨ Current Features

### ✅ Completed
- Project structure with frontend and backend
- React.js with TailwindCSS and modern UI
- Node.js backend with Express and MongoDB
- JWT authentication system
- User registration and login
- Protected routes and middleware
- Responsive design with gradient themes

### 🚧 In Development
- Google Gemini AI integration
- Social media OAuth (Twitter, LinkedIn, Instagram)
- Calendar interface with FullCalendar.js
- Automated posting system
- Analytics dashboard

## 🎨 UI Features

- Modern gradient design (purple to blue theme)
- Responsive layout for all devices
- Smooth animations with Framer Motion
- Toast notifications
- Loading states and error handling
- Clean typography with Inter and Poppins fonts

## 🔧 Tech Stack

**Frontend:**
- React.js 18 with Vite
- TailwindCSS for styling
- React Router for navigation
- Axios for API calls
- Framer Motion for animations
- React Hot Toast for notifications

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT authentication
- bcryptjs for password hashing
- Express validation
- CORS and Helmet for security

## 📝 Next Steps

1. **Install dependencies** (run npm install in both directories)
2. **Configure environment variables** with real API keys
3. **Set up MongoDB** (local or Atlas)
4. **Implement Google Gemini AI** for content generation
5. **Add OAuth integration** for social platforms
6. **Build calendar interface** with drag-and-drop
7. **Create posting automation** with node-cron
8. **Develop analytics dashboard** with charts

## 🚀 Deployment

- Frontend: Deploy to Vercel
- Backend: Deploy to Render
- Database: MongoDB Atlas

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Posts (Coming Soon)
- `GET /api/posts` - Get user posts
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### AI Integration (Coming Soon)
- `POST /api/ai/generate` - Generate AI content

### Social Media (Coming Soon)
- `GET /api/social/accounts` - Get connected accounts
- `POST /api/social/connect` - Connect social account

## 🎯 Hackathon Goals

This project demonstrates:
- Full-stack development skills
- AI integration capabilities
- Modern UI/UX design
- Social media API knowledge
- Real-time features with Socket.io
- Scalable architecture

Ready for the Humanity Founders hackathon! 🚀
