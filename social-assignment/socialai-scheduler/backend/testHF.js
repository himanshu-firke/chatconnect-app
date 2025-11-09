import dotenv from 'dotenv'
dotenv.config()

console.log('🔍 Environment Variables Check:')
console.log('HUGGINGFACE_API_KEY:', process.env.HUGGINGFACE_API_KEY ? `${process.env.HUGGINGFACE_API_KEY.substring(0, 10)}...` : 'Not found')
console.log('HUGGINGFACE_LLAMA_MODEL:', process.env.HUGGINGFACE_LLAMA_MODEL || 'Not found')

// Test if the key starts with hf_
if (process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_API_KEY.startsWith('hf_')) {
  console.log('✅ Hugging Face API key format looks correct')
} else {
  console.log('❌ Hugging Face API key format issue')
}
