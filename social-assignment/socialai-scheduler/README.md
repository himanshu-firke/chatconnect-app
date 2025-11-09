# 🚀 SocialAI Scheduler - AI-Powered Social Media Management

> **Built for Humanity Founders Hackathon** - A comprehensive AI-powered social media scheduling platform that revolutionizes content creation and management.

![SocialAI Scheduler](https://img.shields.io/badge/Status-Complete-brightgreen) ![React](https://img.shields.io/badge/React-18-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![MongoDB](https://img.shields.io/badge/Database-MongoDB-green) ![AI](https://img.shields.io/badge/AI-Google%20Gemini-orange)

## ✨ Key Features

### 🤖 AI-Powered Content Creation
- **Google Gemini Integration**: Generate engaging content with advanced AI
- **Tone Control**: Choose from professional, friendly, casual, funny, or formal tones
- **Platform Optimization**: Content automatically adapted for Twitter, LinkedIn, Instagram
- **Smart Hashtags & Emojis**: AI-generated hashtags and emoji suggestions
- **Content Analysis**: Performance prediction and optimization tips

### 📅 Intelligent Scheduling
- **Drag-and-Drop Calendar**: FullCalendar.js integration with intuitive interface
- **Automated Publishing**: Node-cron powered scheduling system
- **Best Time Suggestions**: AI-driven optimal posting time recommendations
- **Bulk Scheduling**: Schedule multiple posts across platforms
- **Time Zone Support**: Global scheduling with timezone awareness

### 🔗 Multi-Platform Integration
- **OAuth Authentication**: Secure social media account connections
- **Twitter API v2**: Full tweet scheduling and publishing
- **LinkedIn API**: Professional post management
- **Instagram Graph API**: Visual content scheduling
- **Real-time Status**: Live connection monitoring and management

### 📊 Advanced Analytics
- **Performance Metrics**: Views, engagements, reach, and growth tracking
- **Platform Comparison**: Cross-platform performance analysis
- **AI Insights**: Smart recommendations for content optimization
- **Best Times Analysis**: Data-driven posting schedule optimization
- **Engagement Breakdown**: Detailed interaction analytics

### 🎨 Modern User Experience
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Dark/Light Mode**: Adaptive theming (planned)
- **Real-time Updates**: Live notifications and status updates
- **Intuitive Navigation**: Clean, professional interface
- **Accessibility**: WCAG compliant design patterns

## 🏗️ Technical Architecture

### Frontend Stack
```
React.js 18 + Vite
├── TailwindCSS - Styling & Design System
├── Framer Motion - Animations & Transitions  
├── FullCalendar.js - Calendar Interface
├── Axios - API Communication
├── React Router DOM - Navigation
├── React Hot Toast - Notifications

### 🎨 **Modern UI/UX Design**
- **Responsive Design** optimized for all devices
- **Dark/Light Mode** support
- **Smooth Animations** with Framer Motion
- **Intuitive Navigation** with breadcrumbs
- **Accessibility Features** for inclusive design
- **Progressive Web App** capabilities

## 🛠 **Technical Architecture**

### **Frontend Stack**
```
React 18 + TypeScript
├── Vite (Build Tool)
├── TailwindCSS (Styling)
├── Framer Motion (Animations)
├── FullCalendar.js (Scheduling)
├── Axios (API Client)
├── React Router (Navigation)
├── React Hot Toast (Notifications)
└── Heroicons (Icons)
```

### **Backend Stack**
```
Node.js + Express
├── MongoDB + Mongoose (Database)
├── JWT + Passport.js (Authentication)
├── Google Gemini AI (Content Generation)
├── OpenAI API (Backup AI Service)
├── Node-cron (Task Scheduling)
├── Express Rate Limit (Security)
├── Helmet (Security Headers)
└── CORS (Cross-Origin Support)
```

### **AI & External Services**
```
AI Integration
├── Google Gemini API (Primary AI)
├── OpenAI GPT-3.5 (Fallback AI)
├── Twitter API v2 (Social Platform)
├── LinkedIn API (Professional Network)
├── Instagram Graph API (Visual Content)
└── MongoDB Atlas (Cloud Database)
```

## 📁 **Project Structure**

```
socialai-scheduler/
├── 📂 backend/
│   ├── 📂 models/           # Database schemas
│   │   ├── User.js          # User authentication & profiles
│   │   ├── Post.js          # Social media posts
│   │   ├── Template.js      # Content templates
│   │   └── Analytics.js     # Performance metrics
│   ├── 📂 routes/           # API endpoints
│   │   ├── auth.js          # Authentication routes
│   │   ├── ai.js            # AI content generation
│   │   ├── posts.js         # Post management
│   │   ├── analytics.js     # Analytics data
│   │   ├── oauth.js         # Social media OAuth
│   │   ├── templates.js     # Template management
│   │   └── scheduler.js     # Scheduling system
│   ├── 📂 services/         # Business logic
│   │   ├── aiService.js     # AI integration
│   │   ├── postingService.js # Social media posting
│   │   ├── schedulerService.js # Cron job management
│   │   ├── oauthService.js  # OAuth handling
│   │   └── mockAiService.js # Demo AI responses
│   ├── 📂 middleware/       # Express middleware
│   │   ├── auth.js          # JWT authentication
│   │   ├── validation.js    # Input validation
│   │   └── errorHandler.js  # Error management
│   └── server.js            # Express server setup
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── 📂 components/   # Reusable UI components
│   │   │   ├── Layout/      # Navigation & layout
│   │   │   └── Auth/        # Authentication components
│   │   ├── 📂 pages/        # Main application pages
│   │   │   ├── Dashboard.jsx    # Overview & stats
│   │   │   ├── Calendar.jsx     # Scheduling interface
│   │   │   ├── AIChat.jsx       # Content generation
│   │   │   ├── Analytics.jsx    # Performance metrics
│   │   │   ├── Templates.jsx    # Template management
│   │   │   ├── Settings.jsx     # User preferences
│   │   │   ├── Login.jsx        # Authentication
│   │   │   └── Register.jsx     # User registration
│   │   ├── 📂 contexts/     # React context providers
│   │   │   └── AuthContext.jsx  # Authentication state
│   │   ├── 📂 hooks/        # Custom React hooks
│   │   ├── 📂 utils/        # Utility functions
│   │   └── App.jsx          # Main application component
│   ├── package.json         # Frontend dependencies
│   └── vite.config.js       # Vite configuration
├── 📄 README.md             # Project documentation
└── 📄 package.json          # Root package configuration
```

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Google Gemini API key
- OpenAI API key (optional)
- Social media API keys (optional for full functionality)

### **Quick Setup**

1. **Clone the Repository**
```bash
git clone <repository-url>
cd socialai-scheduler
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys
npm start
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
npm run dev
```

4. **Environment Configuration**
```env
# Backend .env file
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/socialai-scheduler
JWT_SECRET=your-super-secret-jwt-key
# AI Integration
GOOGLE_GEMINI_API_KEY=your-gemini-api-key

# Social Media APIs
TWITTER_CONSUMER_KEY=your-twitter-key
TWITTER_CONSUMER_SECRET=your-twitter-secret
LINKEDIN_CLIENT_ID=your-linkedin-id
LINKEDIN_CLIENT_SECRET=your-linkedin-secret
INSTAGRAM_CLIENT_ID=your-instagram-id
INSTAGRAM_CLIENT_SECRET=your-instagram-secret
```

## 📁 Project Structure

```
socialai-scheduler/
├── 📁 backend/
│   ├── 📁 models/          # MongoDB schemas
│   │   ├── User.js         # User model with social connections
│   │   └── Post.js         # Post model with scheduling
│   ├── 📁 routes/          # API endpoints
│   │   ├── auth.js         # Authentication routes
│   │   ├── ai.js           # AI content generation
│   │   ├── oauth.js        # Social media OAuth
│   │   ├── posts.js        # Post management
│   │   ├── scheduler.js    # Scheduling control
│   │   └── analytics.js    # Analytics data
│   ├── 📁 services/        # Business logic
│   │   ├── aiService.js    # Google Gemini integration
│   │   ├── oauthService.js # OAuth management
│   │   ├── postingService.js # Social media posting
│   │   └── schedulerService.js # Cron job management
│   ├── 📁 middleware/      # Express middleware
│   │   └── auth.js         # JWT authentication
│   └── server.js           # Express server setup
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/  # Reusable components
│   │   │   ├── Navbar.jsx  # Navigation component
│   │   │   └── ProtectedRoute.jsx # Route protection
│   │   ├── 📁 pages/       # Main application pages
│   │   │   ├── Dashboard.jsx # Main dashboard
│   │   │   ├── AIChat.jsx    # AI content creator
│   │   │   ├── Calendar.jsx  # Scheduling calendar
│   │   │   ├── Analytics.jsx # Performance analytics
│   │   │   ├── Settings.jsx  # Account & OAuth settings
│   │   │   ├── Login.jsx     # Authentication
│   │   │   └── Register.jsx  # User registration
│   │   ├── 📁 context/     # React Context
│   │   │   └── AuthContext.jsx # Authentication state
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # React entry point
│   ├── index.html          # HTML template
│   ├── package.json        # Dependencies
│   └── tailwind.config.js  # Styling configuration
├── README.md               # Project documentation
└── SETUP.md               # Detailed setup guide
```

## 🎯 Core Features Breakdown

### 1. AI Content Generation
- **Multi-tone Support**: Professional, friendly, casual, funny, formal
- **Platform Adaptation**: Character limits and format optimization
- **Smart Suggestions**: Hashtags, emojis, and engagement tips
- **Content Analysis**: Performance prediction and improvement suggestions

### 2. Scheduling System
- **Visual Calendar**: Drag-and-drop interface with FullCalendar.js
- **Automated Publishing**: Cron-based scheduling with retry logic
- **Multi-platform Support**: Simultaneous posting across platforms
- **Smart Timing**: AI-recommended optimal posting times

### 3. Social Media Integration
- **OAuth 2.0 Flow**: Secure platform authentication
- **Real-time Status**: Connection monitoring and management
- **API Rate Limiting**: Intelligent request management
- **Error Handling**: Robust failure recovery and user notifications

### 4. Analytics Dashboard
- **Performance Metrics**: Comprehensive engagement tracking
- **Visual Charts**: Interactive data visualization
- **AI Insights**: Smart recommendations and trend analysis
- **Export Capabilities**: Data export for external analysis

## 🔒 Security Features

- **JWT Authentication**: Secure user sessions
- **OAuth 2.0**: Safe social media connections
- **Rate Limiting**: API abuse prevention
- **Input Validation**: XSS and injection protection
- **CORS Configuration**: Cross-origin security
- **Helmet.js**: HTTP header security

## 📈 Performance Optimizations

- **Database Indexing**: Optimized MongoDB queries
- **API Caching**: Reduced external API calls
- **Lazy Loading**: Component-based code splitting
- **Image Optimization**: Compressed media handling
- **CDN Integration**: Fast asset delivery

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🏆 Hackathon Submission

**Built for**: Humanity Founders Hackathon  
**Category**: AI-Powered Social Media Tools  
**Team**: Solo Development  
**Timeline**: 48 hours  

### Key Differentiators
- ✅ **AI-First Approach**: Google Gemini integration for intelligent content
- ✅ **Multi-Platform Sync**: Unified management across social networks
- ✅ **Smart Scheduling**: AI-driven optimal timing recommendations
- ✅ **Real-time Analytics**: Live performance tracking and insights
- ✅ **Modern UX**: Intuitive, responsive design with smooth animations

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful content generation
- **FullCalendar.js** for the excellent calendar component
- **TailwindCSS** for the beautiful design system
- **MongoDB Atlas** for reliable database hosting
- **Humanity Founders** for organizing this amazing hackathon

---

**Made with ❤️ for the Humanity Founders Hackathon**
