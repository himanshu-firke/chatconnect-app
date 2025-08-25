const Joi = require('joi');

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string()
    .pattern(/^[a-zA-Z0-9_]+$/)
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.pattern.base': 'Username must contain only letters, numbers, and underscores',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 30 characters',
      'any.required': 'Username is required'
    }),
  email: Joi.string()
    .email({ tlds: { allow: false } }) // Allow any TLD including .demo
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    })
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } }) // Allow any TLD including .demo
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

const messageSchema = Joi.object({
  content: Joi.string()
    .trim()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'string.min': 'Message cannot be empty',
      'string.max': 'Message cannot exceed 1000 characters',
      'any.required': 'Message content is required'
    }),
  messageType: Joi.string()
    .valid('text', 'image', 'file')
    .default('text')
});

// Validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details[0].message;
      return res.status(400).json({
        success: false,
        message: errorMessage,
        field: error.details[0].path[0]
      });
    }
    
    next();
  };
};

module.exports = {
  validateRegister: validateRequest(registerSchema),
  validateLogin: validateRequest(loginSchema),
  validateMessage: validateRequest(messageSchema)
};
