# 🦙 LLaMA Integration Setup Guide

## Overview
Your Social AI Scheduler now supports **LLaMA (Meta's Language Model)** with multiple provider options for maximum flexibility and performance.

## 🚀 Quick Start Options

### Option 1: Ollama (Local - Recommended for Development)
**Best for: Privacy, no API costs, offline usage**

1. **Install Ollama**
   ```bash
   # Windows: Download from https://ollama.ai
   # Or use winget
   winget install Ollama.Ollama
   ```

2. **Install LLaMA Model**
   ```bash
   ollama pull llama2
   # Or for better performance:
   ollama pull llama2:13b
   ollama pull codellama
   ```

3. **Verify Installation**
   ```bash
   ollama list
   ollama serve
   ```

4. **Update Environment Variables**
   ```env
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llama2
   ```

### Option 2: Hugging Face (Cloud)
**Best for: Easy setup, no local resources needed**

1. **Get API Key**
   - Visit https://huggingface.co/settings/tokens
   - Create a new token with "Read" permissions

2. **Update Environment Variables**
   ```env
   HUGGINGFACE_API_KEY=your-huggingface-api-key-here
   HUGGINGFACE_LLAMA_MODEL=meta-llama/Llama-2-7b-chat-hf
   ```

### Option 3: Replicate (Cloud)
**Best for: Production, scalable inference**

1. **Get API Token**
   - Visit https://replicate.com/account/api-tokens
   - Create a new API token

2. **Update Environment Variables**
   ```env
   REPLICATE_API_TOKEN=your-replicate-api-token-here
   REPLICATE_LLAMA_MODEL=meta/llama-2-7b-chat
   ```

### Option 4: Together AI (Cloud)
**Best for: Fast inference, competitive pricing**

1. **Get API Key**
   - Visit https://api.together.xyz/settings/api-keys
   - Create a new API key

2. **Update Environment Variables**
   ```env
   TOGETHER_API_KEY=your-together-api-key-here
   TOGETHER_LLAMA_MODEL=meta-llama/Llama-2-7b-chat-hf
   ```

## 🎯 How to Use LLaMA

### In the Web Interface
1. Go to **AI Chat** page
2. Scroll to **AI Provider** section
3. Select **🦙 LLaMA (Meta)**
4. Choose your preferred provider (Ollama, Hugging Face, etc.)
5. Start generating content!

### Via API
```javascript
// Generate content with LLaMA
const response = await axios.post('/api/ai/generate-llama', {
  prompt: 'Create a social media post about AI trends',
  tone: 'professional',
  platforms: ['twitter', 'linkedin']
})
```

### Check LLaMA Status
```javascript
// Check which providers are available
const status = await axios.get('/api/ai/llama-status')
console.log(status.data)
```

## 🔧 Configuration Options

### Model Selection
- **llama2**: General purpose, good balance
- **llama2:13b**: Better quality, slower
- **codellama**: Optimized for technical content
- **llama2:70b**: Best quality (requires powerful hardware)

### Provider Priority
The system automatically selects providers in this order:
1. **Ollama** (local) - if available
2. **Together AI** - if configured
3. **Hugging Face** - if configured
4. **Replicate** - if configured

## 🎨 LLaMA Features

### ✅ Supported Features
- **Multi-platform content generation** (Twitter, LinkedIn, Instagram)
- **Tone control** (Professional, Friendly, Funny, Formal, Casual)
- **Smart hashtag generation**
- **Emoji suggestions**
- **Character limit optimization**
- **Provider switching**
- **Real-time status monitoring**

### 🔄 Fallback System
- **Primary**: Selected LLaMA provider
- **Fallback 1**: Alternative LLaMA provider
- **Fallback 2**: Google Gemini
- **Fallback 3**: OpenAI
- **Final Fallback**: Enhanced Mock AI

## 🚀 Performance Tips

### For Ollama (Local)
- Use SSD storage for models
- Allocate sufficient RAM (8GB+ recommended)
- Use GPU acceleration if available
- Keep models updated: `ollama pull llama2`

### For Cloud Providers
- Monitor API usage and costs
- Use appropriate model sizes for your needs
- Implement rate limiting for production
- Cache responses when possible

## 🔍 Troubleshooting

### Common Issues

**"Ollama not available locally"**
- Install Ollama from https://ollama.ai
- Run `ollama serve` in terminal
- Check if port 11434 is available

**"LLaMA provider not available"**
- Verify API keys are correct
- Check internet connection
- Ensure provider endpoints are accessible

**"Generation failed"**
- Try switching to different provider
- Check API quotas/limits
- Verify model names are correct

### Debug Commands
```bash
# Test LLaMA integration
node testLlama.js

# Check Ollama status
curl http://localhost:11434/api/tags

# Test API endpoints
curl -X GET http://localhost:5000/api/ai/llama-status
```

## 💡 Best Practices

1. **Start with Ollama** for development and testing
2. **Use cloud providers** for production scaling
3. **Monitor costs** with cloud providers
4. **Cache responses** to reduce API calls
5. **Implement fallbacks** for reliability
6. **Test different models** for optimal results

## 🎉 Ready to Use!

Your Social AI Scheduler now has **cutting-edge LLaMA integration**! This gives you:

- **🔒 Privacy**: Local inference with Ollama
- **⚡ Performance**: Multiple cloud providers
- **💰 Cost Control**: Choose based on budget
- **🛡️ Reliability**: Automatic fallbacks
- **🎯 Quality**: Meta's state-of-the-art models

Start creating amazing social media content with the power of LLaMA! 🦙✨
