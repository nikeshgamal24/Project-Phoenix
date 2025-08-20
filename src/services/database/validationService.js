const mongoose = require('mongoose');
const { AppError } = require('../../middleware/errorHandler');

class ValidationService {
  /**
   * Validate foreign key references exist
   */
  async validateReferences(validations, session = null) {
    for (const validation of validations) {
      const { model, ids, fieldName = '_id', message } = validation;
      
      if (!Array.isArray(ids) || ids.length === 0) continue;
      
      // Filter out null/undefined values
      const validIds = ids.filter(id => id != null);
      if (validIds.length === 0) continue;
      
      const query = model.countDocuments({
        [fieldName]: { $in: validIds }
      });
      
      if (session) {
        query.session(session);
      }
      
      const count = await query;
      
      if (count !== validIds.length) {
        const defaultMessage = `Invalid reference(s) in ${fieldName}`;
        throw new AppError(message || defaultMessage, 400);
      }
    }
  }

  /**
   * Validate unique constraints across multiple fields
   */
  async validateUniqueness(model, document, uniqueFields, session = null) {
    for (const field of uniqueFields) {
      if (typeof field === 'string') {
        // Simple field uniqueness
        await this.validateUniqueField(model, document, field, session);
      } else if (typeof field === 'object') {
        // Compound uniqueness
        await this.validateUniqueCompound(model, document, field, session);
      }
    }
  }

  /**
   * Validate single field uniqueness
   */
  async validateUniqueField(model, document, fieldName, session = null) {
    const value = document[fieldName];
    if (value == null) return;

    const query = { 
      [fieldName]: value,
      _id: { $ne: document._id } // Exclude current document if updating
    };

    const existingDoc = await model.findOne(query).session(session);
    
    if (existingDoc) {
      throw new AppError(`${fieldName} already exists`, 409);
    }
  }

  /**
   * Validate compound field uniqueness
   */
  async validateUniqueCompound(model, document, compoundField, session = null) {
    const { fields, message } = compoundField;
    
    const query = {
      _id: { $ne: document._id } // Exclude current document if updating
    };
    
    // Build compound query
    for (const field of fields) {
      const value = document[field];
      if (value == null) return; // Skip if any field is null
      query[field] = value;
    }
    
    const existingDoc = await model.findOne(query).session(session);
    
    if (existingDoc) {
      const defaultMessage = `Combination of ${fields.join(', ')} already exists`;
      throw new AppError(message || defaultMessage, 409);
    }
  }

  /**
   * Validate business rules
   */
  async validateBusinessRules(rules, session = null) {
    for (const rule of rules) {
      const { description, validate } = rule;
      
      try {
        const isValid = await validate(session);
        
        if (!isValid) {
          throw new AppError(`Business rule violation: ${description}`, 400);
        }
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }
        throw new AppError(`Business rule validation error: ${description}`, 500);
      }
    }
  }

  /**
   * Validate data consistency across related documents
   */
  async validateDataConsistency(consistencyChecks, session = null) {
    for (const check of consistencyChecks) {
      const { description, validate } = check;
      
      try {
        const isConsistent = await validate(session);
        
        if (!isConsistent) {
          throw new AppError(`Data consistency check failed: ${description}`, 500);
        }
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }
        throw new AppError(`Consistency validation error: ${description}`, 500);
      }
    }
  }

  /**
   * Validate user permissions for operation
   */
  async validatePermissions(permissionChecks, session = null) {
    for (const check of permissionChecks) {
      const { description, validate } = check;
      
      try {
        const hasPermission = await validate(session);
        
        if (!hasPermission) {
          throw new AppError(`Permission denied: ${description}`, 403);
        }
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }
        throw new AppError(`Permission validation error: ${description}`, 500);
      }
    }
  }

  /**
   * Validate document state transitions
   */
  validateStateTransition(currentState, newState, allowedTransitions) {
    if (!allowedTransitions[currentState]) {
      throw new AppError(`Invalid current state: ${currentState}`, 400);
    }
    
    if (!allowedTransitions[currentState].includes(newState)) {
      throw new AppError(
        `Invalid state transition from ${currentState} to ${newState}`, 
        400
      );
    }
  }

  /**
   * Validate date ranges and logical constraints
   */
  validateDateConstraints(constraints) {
    for (const constraint of constraints) {
      const { startDate, endDate, description } = constraint;
      
      if (startDate && endDate) {
        if (new Date(startDate) >= new Date(endDate)) {
          throw new AppError(
            `Invalid date range: ${description || 'Start date must be before end date'}`, 
            400
          );
        }
      }
    }
  }

  /**
   * Validate numeric constraints
   */
  validateNumericConstraints(constraints) {
    for (const constraint of constraints) {
      const { value, min, max, fieldName } = constraint;
      
      if (min !== undefined && value < min) {
        throw new AppError(`${fieldName} must be at least ${min}`, 400);
      }
      
      if (max !== undefined && value > max) {
        throw new AppError(`${fieldName} cannot exceed ${max}`, 400);
      }
    }
  }

  /**
   * Comprehensive validation for complex operations
   */
  async validateComplexOperation(validationConfig, session = null) {
    const {
      references = [],
      uniqueness = [],
      businessRules = [],
      consistency = [],
      permissions = [],
      stateTransitions = [],
      dateConstraints = [],
      numericConstraints = []
    } = validationConfig;

    // Execute all validations
    await this.validateReferences(references, session);
    
    for (const uniqueValidation of uniqueness) {
      await this.validateUniqueness(
        uniqueValidation.model,
        uniqueValidation.document,
        uniqueValidation.fields,
        session
      );
    }
    
    await this.validateBusinessRules(businessRules, session);
    await this.validateDataConsistency(consistency, session);
    await this.validatePermissions(permissions, session);
    
    for (const transition of stateTransitions) {
      this.validateStateTransition(
        transition.currentState,
        transition.newState,
        transition.allowedTransitions
      );
    }
    
    this.validateDateConstraints(dateConstraints);
    this.validateNumericConstraints(numericConstraints);
  }
}

module.exports = new ValidationService();
