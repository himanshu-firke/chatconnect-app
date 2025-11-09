import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { 
  PaperAirplaneIcon, 
  SparklesIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  ClockIcon,
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'

const AIChat = () => {
  const [prompt, setPrompt] = useState('')
  const [tone, setTone] = useState('friendly')
  const [platforms, setPlatforms] = useState(['twitter', 'linkedin'])
  const [contentType, setContentType] = useState('text')
  const [aiProvider, setAiProvider] = useState('llama')
  const [llamaProvider, setLlamaProvider] = useState('huggingface')
  const [loading, setLoading] = useState(false)
  const [generatedContent, setGeneratedContent] = useState(null)
  const [chatHistory, setChatHistory] = useState([])
  const [availableTones, setAvailableTones] = useState([])
  const [availablePlatforms, setAvailablePlatforms] = useState([])
  const [llamaStatus, setLlamaStatus] = useState(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedContent, setSelectedContent] = useState(null)
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  
  // New states for enhanced features
  const [mode, setMode] = useState('ai') // 'ai' or 'manual'
  const [manualContent, setManualContent] = useState('')
  const [imageLoading, setImageLoading] = useState(false)
  const [imageStyle, setImageStyle] = useState('realistic')
  const [imageSize, setImageSize] = useState('1024x1024')
  const [uploadedImage, setUploadedImage] = useState(null)
  const [availableImageStyles, setAvailableImageStyles] = useState([])
  const [availableImageSizes, setAvailableImageSizes] = useState([])
  
  const chatEndRef = useRef(null)

  useEffect(() => {
    fetchTones()
    fetchPlatforms()
    fetchLlamaStatus()
    fetchImageStyles()
    fetchImageSizes()
  }, [])

  // Remove auto-scroll to prevent jumping to footer after content generation
  // useEffect(() => {
  //   scrollToBottom()
  // }, [chatHistory])

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchTones = async () => {
    try {
      const response = await axios.get('/api/ai/tones')
      if (response.data.success) {
        setAvailableTones(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching tones:', error)
    }
  }

  const fetchPlatforms = async () => {
    try {
      const response = await axios.get('/api/ai/platforms')
      if (response.data.success) {
        setAvailablePlatforms(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching platforms:', error)
    }
  }

  const fetchLlamaStatus = async () => {
    try {
      const response = await axios.get('/api/ai/llama-status')
      if (response.data.success) {
        setLlamaStatus(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching LLaMA status:', error)
    }
  }

  const fetchImageStyles = async () => {
    try {
      const response = await axios.get('/api/ai/image-styles')
      if (response.data.success) {
        setAvailableImageStyles(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching image styles:', error)
      // Set default styles as fallback
      setAvailableImageStyles([
        { id: 'realistic', name: 'Realistic', description: 'Photorealistic images' },
        { id: 'artistic', name: 'Artistic', description: 'Creative and stylized' },
        { id: 'cartoon', name: 'Cartoon', description: 'Fun illustrations' },
        { id: 'minimalist', name: 'Minimalist', description: 'Clean and simple' },
        { id: 'vintage', name: 'Vintage', description: 'Retro and classic' },
        { id: 'futuristic', name: 'Futuristic', description: 'Sci-fi and modern' }
      ])
    }
  }

  const fetchImageSizes = async () => {
    try {
      const response = await axios.get('/api/ai/image-sizes')
      if (response.data.success) {
        setAvailableImageSizes(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching image sizes:', error)
      // Set default sizes as fallback
      setAvailableImageSizes([
        { id: '1024x1024', name: 'Square (1024x1024)', description: 'Perfect for Instagram' },
        { id: '1792x1024', name: 'Landscape (1792x1024)', description: 'Great for Twitter/LinkedIn' },
        { id: '1024x1792', name: 'Portrait (1024x1792)', description: 'Ideal for stories' }
      ])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setLoading(true)
    
    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: prompt,
      timestamp: new Date()
    }
    setChatHistory(prev => [...prev, userMessage])

    try {
      // Choose endpoint based on selected AI provider
      const endpoint = aiProvider === 'llama' ? '/api/ai/generate-llama' : '/api/ai/generate'
      
      const response = await axios.post(endpoint, {
        prompt,
        tone,
        platforms,
        contentType,
        ...(aiProvider === 'llama' && { llamaProvider })
      })
      
      console.log('🔍 AI Request:', { endpoint, aiProvider, llamaProvider, prompt: prompt.substring(0, 50) })

      if (response.data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: response.data.data,
          timestamp: new Date()
        }
        setChatHistory(prev => [...prev, aiMessage])
        setGeneratedContent(response.data.data)
        toast.success('Content generated successfully!')
      } else {
        toast.error(response.data.message || 'Failed to generate content')
      }
    } catch (error) {
      console.error('Content generation error:', error)
      toast.error('Failed to generate content')
    } finally {
      setLoading(false)
      setPrompt('')
    }
  }

  const handlePlatformToggle = (platformId) => {
    setPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    )
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const regenerateContent = async () => {
    if (!generatedContent) return
    
    // Use the last user message to regenerate
    const lastUserMessage = chatHistory.filter(msg => msg.type === 'user').pop()
    if (lastUserMessage) {
      setPrompt(lastUserMessage.content)
      handleSubmit({ preventDefault: () => {} })
    }
  }

  const generateImage = async (imagePrompt) => {
    if (!imagePrompt.trim()) {
      toast.error('Please enter a prompt for image generation')
      return
    }

    setImageLoading(true)
    console.log('🎨 Starting image generation...', { prompt: imagePrompt, style: imageStyle, size: imageSize })
    
    try {
      const response = await axios.post('/api/ai/generate-image', {
        prompt: imagePrompt,
        style: imageStyle,
        size: imageSize
      })

      console.log('🎨 Image generation response:', response.data)

      if (response.data.success) {
        const imageMessage = {
          id: Date.now() + 2,
          type: 'ai',
          content: {
            type: 'image',
            imageUrl: response.data.data.imageUrl,
            prompt: imagePrompt,
            provider: response.data.data.provider,
            metadata: response.data.data.metadata
          },
          timestamp: new Date()
        }
        setChatHistory(prev => [...prev, imageMessage])
        setGeneratedContent(imageMessage.content)
        toast.success(`Image generated successfully with ${response.data.data.provider}!`)
      } else {
        console.error('Image generation failed:', response.data)
        toast.error(response.data.message || 'Failed to generate image')
      }
    } catch (error) {
      console.error('Image generation error:', error)
      if (error.response) {
        console.error('Error response:', error.response.data)
        toast.error(error.response.data?.message || 'Failed to generate image')
      } else {
        toast.error('Network error during image generation')
      }
    } finally {
      setImageLoading(false)
    }
  }

  const handleManualSubmit = async () => {
    if (!manualContent.trim()) return

    const manualMessage = {
      id: Date.now(),
      type: 'manual',
      content: {
        type: 'manual',
        text: manualContent,
        platforms: platforms,
        tone: tone,
        image: uploadedImage
      },
      timestamp: new Date()
    }

    setChatHistory(prev => [...prev, manualMessage])
    setGeneratedContent(manualMessage.content)
    setManualContent('')
    setUploadedImage(null)
    toast.success('Manual content created!')
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSchedulePost = (content = null) => {
    setSelectedContent(content || generatedContent)
    setShowScheduleModal(true)
    // Set default date/time to tomorrow at 9 AM
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)
    setScheduledDate(tomorrow.toISOString().split('T')[0])
    setScheduledTime('09:00')
  }

  const submitScheduledPost = async () => {
    if (!selectedContent || !scheduledDate || !scheduledTime) {
      toast.error('Please fill in all scheduling details')
      return
    }

    try {
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
      
      const postData = {
        content: {
          text: Object.values(selectedContent.platforms)[0].text, // Use first platform's text
          hashtags: selectedContent.hashtags,
          emojis: selectedContent.emojis
        },
        platforms: platforms.map(platformId => ({
          name: platformId,
          content: selectedContent.platforms[platformId]
        })),
        scheduling: {
          scheduledFor: scheduledDateTime,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        status: 'scheduled'
      }

      const response = await axios.post('/api/posts', postData)
      
      if (response.data.success) {
        toast.success('Post scheduled successfully!')
        setShowScheduleModal(false)
        setSelectedContent(null)
        setScheduledDate('')
        setScheduledTime('')
      } else {
        toast.error(response.data.message || 'Failed to schedule post')
      }
    } catch (error) {
      console.error('Error scheduling post:', error)
      toast.error('Failed to schedule post')
    }
  }

  const ScheduleModal = () => {
    if (!showScheduleModal || !selectedContent) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Schedule Post</h3>
            <button
              onClick={() => setShowScheduleModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Preview
              </label>
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                {Object.entries(selectedContent.platforms).map(([platform, data]) => (
                  <div key={platform} className="mb-2 last:mb-0">
                    <span className="font-medium capitalize">{platform}:</span>
                    <p className="text-gray-600 mt-1">{data.text}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                Schedule Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="input-field w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ClockIcon className="w-4 h-4 inline mr-1" />
                Schedule Time
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="input-field w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Platforms
              </label>
              <div className="flex flex-wrap gap-2">
                {platforms.map(platform => (
                  <span
                    key={platform}
                    className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full capitalize"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => setShowScheduleModal(false)}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={submitScheduledPost}
              className="flex-1 btn-primary"
            >
              Schedule Post
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
          AI Content Creator
        </h1>
        <p className="text-gray-600">
          Generate engaging social media content with AI assistance powered by 🦙 LLaMA (Meta), Google Gemini, or OpenAI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <div className="card h-[600px] flex flex-col relative">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {chatHistory.length === 0 ? (
                <div className="text-center py-16 flex flex-col justify-center h-full">
                  <SparklesIcon className="w-16 h-16 text-purple-500 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Start Creating Content
                  </h3>
                  <p className="text-gray-600 text-lg max-w-md mx-auto">
                    Describe what you want to post and I'll help you create engaging content.
                  </p>
                </div>
              ) : (
                chatHistory.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {(message.type === 'ai' || message.type === 'manual') && (
                        <div className="bg-white p-4 rounded-lg shadow-sm border max-w-2xl">
                          <div className="flex items-center mb-3">
                            {message.type === 'ai' ? (
                              <>
                                <SparklesIcon className="w-5 h-5 text-purple-500 mr-2" />
                                <span className="font-medium text-gray-900">Generated Content</span>
                              </>
                            ) : (
                              <>
                                <span className="text-lg mr-2">✍️</span>
                                <span className="font-medium text-gray-900">Manual Content</span>
                              </>
                            )}
                          </div>

                          {/* Handle image content */}
                          {message.content.type === 'image' && (
                            <div className="mb-4">
                              <img 
                                src={message.content.imageUrl} 
                                alt={message.content.prompt}
                                className="w-full max-w-md rounded-lg shadow-sm"
                              />
                              <p className="text-sm text-gray-600 mt-2">
                                Prompt: {message.content.prompt}
                              </p>
                              <p className="text-xs text-gray-500">
                                Generated by: {message.content.provider}
                              </p>
                            </div>
                          )}

                          {/* Handle manual content with image */}
                          {message.content.type === 'manual' && (
                            <div className="mb-4">
                              {message.content.image && (
                                <img 
                                  src={message.content.image} 
                                  alt="Uploaded content"
                                  className="w-full max-w-md rounded-lg shadow-sm mb-3"
                                />
                              )}
                              <p className="text-gray-700">{message.content.text}</p>
                            </div>
                          )}
                          
                          {/* Handle AI generated text content */}
                          {message.content.platforms && Object.entries(message.content.platforms).map(([platform, content]) => (
                            <div key={platform} className="mb-4 last:mb-0">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900 capitalize">{platform}</h4>
                                <button
                                  onClick={() => copyToClipboard(content.text)}
                                  className="text-gray-500 hover:text-gray-700"
                                  title="Copy to clipboard"
                                >
                                  <ClipboardDocumentIcon className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-gray-700 mb-2">{content.text}</p>
                              <div className="text-xs text-gray-500">
                                {content.characterCount}/{content.characterLimit} characters
                              </div>
                            </div>
                          ))}

                          {message.content.hashtags && message.content.hashtags.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                              <h5 className="font-medium text-gray-900 mb-2">Hashtags:</h5>
                              <p className="text-blue-600">{message.content.hashtags.join(' ')}</p>
                            </div>
                          )}

                          {message.content.emojis && message.content.emojis.length > 0 && (
                            <div className="mt-3">
                              <h5 className="font-medium text-gray-900 mb-2">Suggested Emojis:</h5>
                              <p className="text-2xl">{message.content.emojis.join(' ')}</p>
                            </div>
                          )}

                          <div className="mt-4 pt-4 border-t">
                            <button
                              onClick={() => handleSchedulePost(message.content)}
                              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg text-sm flex items-center"
                            >
                              <CalendarDaysIcon className="w-3 h-3 mr-1" />
                              Schedule This Post
                            </button>
                          </div>
                        </div>
                      )}
                      {message.type === 'user' ? (
                        <p>{message.content}</p>
                      ) : (
                        <div className="space-y-3">
                          <p className="font-medium">Generated Content:</p>
                          {message.content?.platforms && Object.entries(message.content.platforms).map(([platform, data]) => (
                            <div key={platform} className="border-l-2 border-purple-500 pl-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium capitalize">{platform}</span>
                                <button
                                  onClick={() => copyToClipboard(data.text)}
                                  className="text-xs text-purple-600 hover:text-purple-800"
                                >
                                  <ClipboardDocumentIcon className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-sm">{data.text}</p>
                              <div className="text-xs text-gray-500 mt-1">
                                {data.characterCount}/{data.characterLimit} characters
                              </div>
                            </div>
                          ))}
                          {message.content?.hashtags && message.content.hashtags.length > 0 && (
                            <div className="pt-2 border-t">
                              <p className="text-sm font-medium mb-1">Hashtags:</p>
                              <p className="text-sm">{message.content.hashtags.join(' ')}</p>
                            </div>
                          )}
                          {message.content?.emojis && message.content.emojis.length > 0 && (
                            <div className="pt-2 border-t">
                              <p className="text-sm font-medium mb-1">Suggested Emojis:</p>
                              <p className="text-lg">{message.content.emojis.join(' ')}</p>
                            </div>
                          )}
                          {/* Schedule Post Button for each AI message */}
                          <div className="pt-3 border-t mt-3">
                            <button
                              onClick={() => handleSchedulePost(message.content)}
                              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-3 rounded-lg text-xs flex items-center justify-center transition-colors"
                            >
                              <CalendarDaysIcon className="w-3 h-3 mr-1" />
                              Schedule This Post
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Scroll to Bottom Button */}
            {chatHistory.length > 0 && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-20 right-4 bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-full shadow-lg transition-colors"
                title="Scroll to bottom"
              >
                <ChevronDownIcon className="w-4 h-4" />
              </button>
            )}

            {/* Input Form */}
            <div className="border-t p-6 bg-gray-50">
              {/* Mode Selector */}
              <div className="mb-4 flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Mode:</span>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setMode('ai')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      mode === 'ai' 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    🤖 AI Generate
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('manual')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      mode === 'manual' 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    ✍️ Manual Create
                  </button>
                </div>
              </div>

              {mode === 'ai' ? (
                <form onSubmit={handleSubmit}>
                  {/* AI Provider Dropdown */}
                  <div className="mb-4 flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">🤖 AI:</span>
                      <select
                        value={aiProvider}
                        onChange={(e) => setAiProvider(e.target.value)}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="gemini">Google Gemini</option>
                        <option value="llama">🦙 LLaMA (Meta)</option>
                        <option value="openai">OpenAI GPT</option>
                      </select>
                    </div>

                    {/* LLaMA Provider Selection */}
                    {aiProvider === 'llama' && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Provider:</span>
                        <select
                          value={llamaProvider}
                          onChange={(e) => setLlamaProvider(e.target.value)}
                          className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="ollama">Ollama (Local)</option>
                          <option value="huggingface">Hugging Face</option>
                          <option value="replicate">Replicate</option>
                          <option value="together">Together AI</option>
                        </select>
                      </div>
                    )}

                    {/* Tone Selection */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Tone:</span>
                      <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="professional">Professional</option>
                        <option value="friendly">Friendly</option>
                        <option value="funny">Funny</option>
                        <option value="formal">Formal</option>
                        <option value="casual">Casual</option>
                      </select>
                    </div>

                    {/* Content Type Selection */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Type:</span>
                      <select
                        value={contentType}
                        onChange={(e) => setContentType(e.target.value)}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="text">Text Only</option>
                        <option value="image+text">Image + Text</option>
                        <option value="video+text">Video + Text</option>
                      </select>
                    </div>

                    {/* Image Style and Size (for image generation) */}
                    {contentType === 'image+text' && (
                      <>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Style:</span>
                          <select
                            value={imageStyle}
                            onChange={(e) => setImageStyle(e.target.value)}
                            className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            {availableImageStyles.map(style => (
                              <option key={style.id} value={style.id}>{style.name}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Size:</span>
                          <select
                            value={imageSize}
                            onChange={(e) => setImageSize(e.target.value)}
                            className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            {availableImageSizes.map(size => (
                              <option key={size.id} value={size.id}>{size.name}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {/* LLaMA Status Indicator */}
                    {aiProvider === 'llama' && llamaStatus && (
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${llamaStatus.providers?.huggingface?.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-xs text-gray-500">
                          {llamaStatus.currentProvider}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the content you want to create..."
                      className="flex-1 input-field py-3 px-4 text-base"
                      disabled={loading}
                    />
                    {contentType === 'image+text' && (
                      <button
                        type="button"
                        onClick={() => generateImage(prompt)}
                        disabled={imageLoading || !prompt.trim()}
                        className="btn-secondary px-4 py-3 disabled:opacity-50"
                        title="Generate Image"
                      >
                        {imageLoading ? (
                          <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        ) : (
                          '🎨'
                        )}
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={loading || !prompt.trim()}
                      className="btn-primary px-6 py-3 disabled:opacity-50"
                    >
                      {loading ? (
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      ) : (
                        <PaperAirplaneIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                // Manual Content Creation Mode
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Write your content:
                    </label>
                    <textarea
                      value={manualContent}
                      onChange={(e) => setManualContent(e.target.value)}
                      placeholder="Write your social media content here..."
                      className="w-full input-field py-3 px-4 text-base h-24 resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload Image (Optional):
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="text-sm"
                      />
                    </div>
                    
                    {uploadedImage && (
                      <div className="relative">
                        <img 
                          src={uploadedImage} 
                          alt="Uploaded" 
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => setUploadedImage(null)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleManualSubmit}
                    disabled={!manualContent.trim()}
                    className="btn-primary px-6 py-3 disabled:opacity-50"
                  >
                    Create Post
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        <div className="space-y-6">

          {/* Platform Selection */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Target Platforms</h3>
            <div className="space-y-2">
              {availablePlatforms.map((platform) => (
                <label key={platform.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={platforms.includes(platform.id)}
                    onChange={() => handlePlatformToggle(platform.id)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">{platform.name}</div>
                    <div className="text-sm text-gray-600">
                      {platform.characterLimit} character limit
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>


          {/* Quick Actions */}
          {generatedContent && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <p className="text-sm text-gray-600 mb-3">Actions for the latest generated content:</p>
              <div className="space-y-2">
                <button
                  onClick={regenerateContent}
                  className="w-full btn-secondary text-sm py-2"
                >
                  Regenerate Latest Content
                </button>
                <button
                  onClick={() => handleSchedulePost()}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg text-sm flex items-center justify-center"
                >
                  <CalendarDaysIcon className="w-4 h-4 mr-2" />
                  Schedule Latest Post
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Schedule Modal */}
      <ScheduleModal />
    </div>
  )
}

export default AIChat
