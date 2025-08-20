const Joi = require('joi');
const { AppError } = require('../errorHandler');

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      convert: false,
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      
      return next(new AppError(errorMessage, 400));
    }

    next();
  };
};

// Common validation schemas
const authSchemas = {
  // Login validation
  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(8)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'any.required': 'Password is required'
      }),
    role: Joi.number()
      .integer()
      .valid(2001, 1984, 5150, 4334)
      .required()
      .messages({
        'any.only': 'Invalid role specified',
        'any.required': 'Role is required'
      })
  }),

  // Registration validation
  register: Joi.object({
    fullname: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s]+$/)
      .required()
      .messages({
        'string.min': 'Full name must be at least 2 characters long',
        'string.max': 'Full name cannot exceed 50 characters',
        'string.pattern.base': 'Full name can only contain letters and spaces',
        'any.required': 'Full name is required'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required'
      }),
    phoneNumber: Joi.string()
      .pattern(/^[0-9]{10,15}$/)
      .required()
      .messages({
        'string.pattern.base': 'Phone number must be 10-15 digits',
        'any.required': 'Phone number is required'
      }),
    program: Joi.number()
      .integer()
      .when('role', {
        is: 2001, // Student role
        then: Joi.required(),
        otherwise: Joi.optional()
      })
      .messages({
        'any.required': 'Program is required for students'
      }),
    role: Joi.number()
      .integer()
      .valid(2001, 1984, 5150)
      .required()
      .messages({
        'any.only': 'Invalid role specified',
        'any.required': 'Role is required'
      }),
    photo: Joi.string().optional(),
    designation: Joi.string()
      .when('role', {
        is: 1984, // Supervisor role
        then: Joi.required(),
        otherwise: Joi.optional()
      })
      .messages({
        'any.required': 'Designation is required for supervisors'
      }),
    institution: Joi.string()
      .when('role', {
        is: 1984, // Supervisor role
        then: Joi.required(),
        otherwise: Joi.optional()
      })
      .messages({
        'any.required': 'Institution is required for supervisors'
      })
  }),

  // Evaluator login validation
  evaluatorLogin: Joi.object({
    accessCode: Joi.string()
      .required()
      .messages({
        'any.required': 'Access code is required'
      }),
    role: Joi.number()
      .integer()
      .valid(4334)
      .required()
      .messages({
        'any.only': 'Invalid role for evaluator',
        'any.required': 'Role is required'
      })
  }),

  // Password reset validation
  passwordReset: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      })
  }),

  // New password validation
  newPassword: Joi.object({
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Confirm password is required'
      })
  }),

  // OTP validation
  otp: Joi.object({
    OTP: Joi.string()
      .length(6)
      .pattern(/^[0-9]+$/)
      .required()
      .messages({
        'string.length': 'OTP must be exactly 6 digits',
        'string.pattern.base': 'OTP must contain only numbers',
        'any.required': 'OTP is required'
      })
  })
};

// Student-specific validation schemas
const studentSchemas = {
  // Project creation validation
  createProject: Joi.object({
    projectName: Joi.string()
      .min(3)
      .max(100)
      .required()
      .messages({
        'string.min': 'Project name must be at least 3 characters long',
        'string.max': 'Project name cannot exceed 100 characters',
        'any.required': 'Project name is required'
      }),
    projectDescription: Joi.string()
      .min(10)
      .max(1000)
      .required()
      .messages({
        'string.min': 'Project description must be at least 10 characters long',
        'string.max': 'Project description cannot exceed 1000 characters',
        'any.required': 'Project description is required'
      }),
    teamMembers: Joi.array()
      .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
      .min(1)
      .max(4)
      .required()
      .messages({
        'array.min': 'At least one team member is required',
        'array.max': 'Maximum 4 team members allowed',
        'string.pattern.base': 'Invalid team member ID format',
        'any.required': 'Team members are required'
      }),
    categories: Joi.array()
      .items(Joi.string())
      .min(1)
      .max(5)
      .required()
      .messages({
        'array.min': 'At least one category is required',
        'array.max': 'Maximum 5 categories allowed',
        'any.required': 'Categories are required'
      }),
    eventId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid event ID format',
        'any.required': 'Event ID is required'
      })
  }),

  // Student update validation
  updateStudent: Joi.object({
    fullname: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s]+$/)
      .messages({
        'string.min': 'Full name must be at least 2 characters long',
        'string.max': 'Full name cannot exceed 50 characters',
        'string.pattern.base': 'Full name can only contain letters and spaces'
      }),
    phoneNumber: Joi.string()
      .pattern(/^[0-9]{10,15}$/)
      .messages({
        'string.pattern.base': 'Phone number must be 10-15 digits'
      }),
    program: Joi.number()
      .integer()
      .messages({
        'number.integer': 'Program must be a valid integer'
      })
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
  })
};

// Event validation schemas
const eventSchemas = {
  createEvent: Joi.object({
    eventName: Joi.string()
      .min(3)
      .max(100)
      .required()
      .messages({
        'string.min': 'Event name must be at least 3 characters long',
        'string.max': 'Event name cannot exceed 100 characters',
        'any.required': 'Event name is required'
      }),
    eventTarget: Joi.string()
      .required()
      .messages({
        'any.required': 'Event target is required'
      }),
    eventType: Joi.string()
      .valid('0', '1', '2')
      .required()
      .messages({
        'any.only': 'Event type must be 0 (FIRST), 1 (MINOR), or 2 (MAJOR)',
        'any.required': 'Event type is required'
      }),
    description: Joi.string()
      .max(500)
      .optional(),
    year: Joi.number()
      .integer()
      .min(2020)
      .max(2030)
      .required()
      .messages({
        'number.min': 'Year must be at least 2020',
        'number.max': 'Year cannot exceed 2030',
        'any.required': 'Year is required'
      }),
    proposal: Joi.object({
      defense: Joi.boolean().default(false),
      defenseDate: Joi.date().optional(),
      reportDeadline: Joi.date().optional()
    }).optional(),
    mid: Joi.object({
      defense: Joi.boolean().default(false),
      defenseDate: Joi.date().optional(),
      reportDeadline: Joi.date().optional()
    }).optional(),
    final: Joi.object({
      defense: Joi.boolean().default(false),
      defenseDate: Joi.date().optional(),
      reportDeadline: Joi.date().optional()
    }).optional()
  })
};

// Parameter validation
const paramSchemas = {
  objectId: Joi.object({
    id: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid ID format',
        'any.required': 'ID is required'
      })
  })
};

// Validate parameters middleware
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params);
    
    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message)
        .join(', ');
      
      return next(new AppError(errorMessage, 400));
    }
    
    next();
  };
};

module.exports = {
  validate,
  validateParams,
  authSchemas,
  studentSchemas,
  eventSchemas,
  paramSchemas
};
