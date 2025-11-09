import express from 'express'
import { protect } from '../middleware/auth.js'
import Template from '../models/Template.js'

const router = express.Router()

// Get all templates for user
router.get('/', protect, async (req, res) => {
  try {
    const { category, search } = req.query
    
    let query = { user: req.user._id }
    
    if (category && category !== 'all') {
      query.category = category
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ]
    }
    
    const templates = await Template.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
    
    res.json({
      success: true,
      data: templates
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch templates'
    })
  }
})

// Get single template
router.get('/:id', protect, async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('user', 'name email')
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      })
    }
    
    res.json({
      success: true,
      data: template
    })
  } catch (error) {
    console.error('Error fetching template:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch template'
    })
  }
})

// Create new template
router.post('/', protect, async (req, res) => {
  try {
    const { name, content, category, platforms, tone, tags } = req.body
    
    // Validation
    if (!name || !content) {
      return res.status(400).json({
        success: false,
        message: 'Name and content are required'
      })
    }
    
    const template = new Template({
      name,
      content,
      category: category || 'general',
      platforms: platforms || ['twitter'],
      tone: tone || 'friendly',
      tags: tags || [],
      user: req.user._id
    })
    
    await template.save()
    await template.populate('user', 'name email')
    
    res.status(201).json({
      success: true,
      data: template,
      message: 'Template created successfully'
    })
  } catch (error) {
    console.error('Error creating template:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create template'
    })
  }
})

// Update template
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, content, category, platforms, tone, tags } = req.body
    
    const template = await Template.findOne({
      _id: req.params.id,
      user: req.user._id
    })
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      })
    }
    
    // Update fields
    if (name) template.name = name
    if (content) template.content = content
    if (category) template.category = category
    if (platforms) template.platforms = platforms
    if (tone) template.tone = tone
    if (tags) template.tags = tags
    
    template.updatedAt = new Date()
    
    await template.save()
    await template.populate('user', 'name email')
    
    res.json({
      success: true,
      data: template,
      message: 'Template updated successfully'
    })
  } catch (error) {
    console.error('Error updating template:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update template'
    })
  }
})

// Delete template
router.delete('/:id', protect, async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      user: req.user._id
    })
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      })
    }
    
    await Template.findByIdAndDelete(req.params.id)
    
    res.json({
      success: true,
      message: 'Template deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting template:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete template'
    })
  }
})

// Use template (increment usage count)
router.post('/:id/use', protect, async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      user: req.user._id
    })
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      })
    }
    
    template.usageCount += 1
    template.lastUsed = new Date()
    await template.save()
    
    res.json({
      success: true,
      data: template,
      message: 'Template usage recorded'
    })
  } catch (error) {
    console.error('Error recording template usage:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to record template usage'
    })
  }
})

// Get template categories
router.get('/categories/list', protect, async (req, res) => {
  try {
    const categories = await Template.distinct('category', { user: req.user._id })
    
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const count = await Template.countDocuments({
          user: req.user._id,
          category
        })
        return { name: category, count }
      })
    )
    
    res.json({
      success: true,
      data: categoriesWithCounts
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    })
  }
})

// Get popular templates
router.get('/popular/list', protect, async (req, res) => {
  try {
    const templates = await Template.find({ user: req.user._id })
      .sort({ usageCount: -1 })
      .limit(5)
      .populate('user', 'name email')
    
    res.json({
      success: true,
      data: templates
    })
  } catch (error) {
    console.error('Error fetching popular templates:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch popular templates'
    })
  }
})

export default router
