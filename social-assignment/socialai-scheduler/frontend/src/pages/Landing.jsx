import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  SparklesIcon, 
  CalendarDaysIcon, 
  ChartBarIcon, 
  ChatBubbleLeftRightIcon,
  ClockIcon,
  HashtagIcon
} from '@heroicons/react/24/outline'

const Landing = () => {
  const features = [
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'AI Content Creation',
      description: 'Generate engaging posts with our AI chatbot that adapts to your brand tone and style.'
    },
    {
      icon: CalendarDaysIcon,
      title: 'Smart Scheduling',
      description: 'Drag-and-drop calendar with AI-powered optimal timing suggestions for maximum engagement.'
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics Dashboard',
      description: 'Real-time insights and performance analytics to optimize your social media strategy.'
    },
    {
      icon: HashtagIcon,
      title: 'Hashtag Generator',
      description: 'AI-powered hashtag suggestions and emoji recommendations for better reach.'
    },
    {
      icon: ClockIcon,
      title: 'Automated Publishing',
      description: 'Schedule posts across Twitter, LinkedIn, and Instagram with automated publishing.'
    },
    {
      icon: SparklesIcon,
      title: 'Team Collaboration',
      description: 'Work together with your team with role-based permissions and approval workflows.'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-6xl font-display font-bold text-gray-900 mb-6"
            >
              AI-Powered Social Media
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {' '}Scheduling
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              Create, schedule, and analyze your social media content with the power of AI. 
              Get intelligent suggestions, optimal timing, and comprehensive analytics all in one platform.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/register" className="btn-primary text-lg px-8 py-3">
                Start Creating Content
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-3">
                Sign In
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-20 h-20 bg-purple-200 rounded-full opacity-20 animate-bounce-subtle"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-blue-200 rounded-full opacity-20 animate-bounce-subtle" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-teal-200 rounded-full opacity-20 animate-bounce-subtle" style={{ animationDelay: '2s' }}></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform combines intelligent automation with intuitive design 
              to streamline your social media management.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="card hover:scale-105 transition-transform duration-200"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-display font-bold text-white mb-4">
            Ready to Transform Your Social Media?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of creators and businesses who trust SocialAI Scheduler 
            to manage their social media presence.
          </p>
          <Link to="/register" className="bg-white text-purple-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200">
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Landing
