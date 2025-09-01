const Joi = require('joi');

const validateProductData = (req, res, next) => {
  const schema = Joi.object({
    userId: Joi.string().optional(),
    productName: Joi.string().min(2).max(100).required(),
    category: Joi.string().required(),
    productType: Joi.string().optional(),
    brand: Joi.string().max(50).optional(),
    model: Joi.string().max(50).optional(),
    description: Joi.string().max(1000).allow('', null),
    price: Joi.number().positive().allow(null),
    specifications: Joi.object().optional(),
    questions: Joi.array().items(Joi.object({
      questionId: Joi.string().required(),
      question: Joi.string().required(),
      answer: Joi.alternatives().try(
        Joi.string().allow(''),
        Joi.number(),
        Joi.boolean(),
        Joi.array()
      ).allow(null),
      type: Joi.string().valid('text', 'number', 'boolean', 'select', 'multiselect', 'date', 'email', 'phone', 'textarea').required()
    })).optional(),
    submittedAt: Joi.date().default(Date.now),
    status: Joi.string().valid('draft', 'submitted', 'approved', 'rejected').default('draft')
  });

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    console.error('Product validation error:', error.details);
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }
  
  req.validatedData = value;
  next();
};

const validateCompanyRegistration = (req, res, next) => {
  const schema = Joi.object({
    companyName: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    industry: Joi.string().required(),
    contactPerson: Joi.string().min(2).max(100).required(),
    phone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]+$/).allow('').optional(),
    address: Joi.object({
      street: Joi.string().allow('').optional(),
      city: Joi.string().allow('').optional(),
      state: Joi.string().allow('').optional(),
      zipCode: Joi.string().allow('').optional(),
      country: Joi.string().allow('').optional()
    }).optional()
  });

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    console.error('Company registration validation error:', error.details);
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }
  
  req.validatedData = value;
  next();
};

const validateUserRegistration = (req, res, next) => {
  const schema = Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    department: Joi.string().allow('').optional(),
    phone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]+$/).allow('').optional()
  });

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    console.error('User registration validation error:', error.details);
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }
  
  req.validatedData = value;
  next();
};

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }
  
  req.validatedData = value;
  next();
};

module.exports = {
  validateProductData,
  validateCompanyRegistration,
  validateUserRegistration,
  validateLogin
};
