import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { 
  PlusIcon,
  DocumentTextIcon,
  SparklesIcon,
  HeartIcon,
  ShareIcon,
  EyeIcon,
  TrashIcon,
  PencilIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline'

const Templates = () => {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    category: 'general',
    platforms: ['twitter'],
    tone: 'friendly'
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      // Simulate API call - in real app, this would fetch from backend
      setTimeout(() => {
        setTemplates([
          {
            id: 1,
            name: 'Product Launch',
            content: '🚀 Excited to announce our latest product! {product_name} is here to revolutionize {industry}. What do you think? #ProductLaunch #Innovation',
            category: 'marketing',
            platforms: ['twitter', 'linkedin'],
            tone: 'professional',
            usage: 15,
            engagement: 4.2,
            createdAt: '2024-01-15'
          },
          {
            id: 2,
            name: 'Weekly Motivation',
            content: '💪 Monday motivation: {motivational_quote} Remember, every expert was once a beginner. What\'s your goal this week? #MondayMotivation #Goals',
            category: 'motivation',
            platforms: ['twitter', 'instagram'],
            tone: 'friendly',
            usage: 23,
            engagement: 5.8,
            createdAt: '2024-01-10'
          },
          {
            id: 3,
            name: 'Tech Tips',
            content: '💡 Tech Tip Tuesday: {tech_tip} This simple trick can save you hours of work! Have you tried this before? #TechTips #Productivity',
            category: 'education',
            platforms: ['twitter', 'linkedin'],
            tone: 'casual',
            usage: 31,
            engagement: 6.1,
            createdAt: '2024-01-08'
          },
          {
            id: 4,
            name: 'Behind the Scenes',
            content: '🎬 Behind the scenes at {company_name}! Here\'s how we {process_description}. Love sharing our journey with you! #BehindTheScenes #TeamWork',
            category: 'company',
            platforms: ['instagram', 'linkedin'],
            tone: 'friendly',
            usage: 12,
            engagement: 4.7,
            createdAt: '2024-01-05'
          },
          {
            id: 5,
            name: 'Industry News',
            content: '📰 Industry Update: {news_headline} This could impact {affected_area}. What are your thoughts on this development? #IndustryNews #Analysis',
            category: 'news',
            platforms: ['linkedin', 'twitter'],
            tone: 'professional',
            usage: 8,
            engagement: 3.9,
            createdAt: '2024-01-03'
          }
        ])
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching templates:', error)
      setLoading(false)
    }
  }

  const categories = [
    { id: 'all', name: 'All Templates', count: templates.length },
    { id: 'marketing', name: 'Marketing', count: templates.filter(t => t.category === 'marketing').length },
    { id: 'motivation', name: 'Motivation', count: templates.filter(t => t.category === 'motivation').length },
    { id: 'education', name: 'Education', count: templates.filter(t => t.category === 'education').length },
    { id: 'company', name: 'Company', count: templates.filter(t => t.category === 'company').length },
    { id: 'news', name: 'News', count: templates.filter(t => t.category === 'news').length }
  ]

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory)

  const handleCreateTemplate = async (e) => {
    e.preventDefault()
    try {
      // Simulate API call
      const newTemplateData = {
        ...newTemplate,
        id: Date.now(),
        usage: 0,
        engagement: 0,
        createdAt: new Date().toISOString().split('T')[0]
      }
      
      setTemplates([newTemplateData, ...templates])
      setShowCreateModal(false)
      setNewTemplate({
        name: '',
        content: '',
        category: 'general',
        platforms: ['twitter'],
        tone: 'friendly'
      })
      toast.success('Template created successfully!')
    } catch (error) {
      toast.error('Failed to create template')
    }
  }

  const handleUseTemplate = (template) => {
    // Copy template content to clipboard
    navigator.clipboard.writeText(template.content)
    toast.success('Template copied to clipboard!')
    
    // In a real app, this might redirect to AI chat with pre-filled content
    // window.location.href = `/ai-chat?template=${template.id}`
  }

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) return
    
    try {
      setTemplates(templates.filter(t => t.id !== templateId))
      toast.success('Template deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete template')
    }
  }

  const getPlatformColor = (platform) => {
    const colors = {
      twitter: 'bg-blue-100 text-blue-800',
      linkedin: 'bg-blue-100 text-blue-800',
      instagram: 'bg-pink-100 text-pink-800',
      facebook: 'bg-blue-100 text-blue-800'
    }
    return colors[platform] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Content Templates
            </h1>
            <p className="text-gray-600">
              Save time with pre-made templates for your social media posts.
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Template
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
            <nav className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md ${
                    selectedCategory === category.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="capitalize">{category.name}</span>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                    {category.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTemplates.map((template) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="p-1 text-gray-400 hover:text-purple-600"
                      title="Use template"
                    >
                      <ClipboardDocumentIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Delete template"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {template.content}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {template.platforms.map((platform) => (
                    <span
                      key={platform}
                      className={`px-2 py-1 text-xs rounded-full capitalize ${getPlatformColor(platform)}`}
                    >
                      {platform}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <EyeIcon className="w-4 h-4 mr-1" />
                      <span>{template.usage} uses</span>
                    </div>
                    <div className="flex items-center">
                      <HeartIcon className="w-4 h-4 mr-1" />
                      <span>{template.engagement}% avg</span>
                    </div>
                  </div>
                  <span className="capitalize text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {template.tone}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
          
          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600 mb-4">
                {selectedCategory === 'all' 
                  ? 'Create your first template to get started.' 
                  : `No templates in the ${selectedCategory} category yet.`}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Create Template
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Template</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  className="input-field w-full"
                  placeholder="e.g., Product Launch"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                  className="input-field w-full h-24"
                  placeholder="Use {variable_name} for dynamic content..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={newTemplate.category}
                    onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
                    className="input-field w-full"
                  >
                    <option value="general">General</option>
                    <option value="marketing">Marketing</option>
                    <option value="motivation">Motivation</option>
                    <option value="education">Education</option>
                    <option value="company">Company</option>
                    <option value="news">News</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tone
                  </label>
                  <select
                    value={newTemplate.tone}
                    onChange={(e) => setNewTemplate({...newTemplate, tone: e.target.value})}
                    className="input-field w-full"
                  >
                    <option value="friendly">Friendly</option>
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="funny">Funny</option>
                    <option value="formal">Formal</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Create Template
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Templates
