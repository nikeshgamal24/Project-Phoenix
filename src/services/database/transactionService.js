const mongoose = require('mongoose');
const { AppError } = require('../../middleware/errorHandler');

class TransactionService {
  /**
   * Execute operation within a transaction with automatic retry
   */
  async executeTransaction(operation, options = {}) {
    const session = await mongoose.startSession();
    
    const {
      retries = 3,
      retryDelay = 100,
      readConcern = 'majority',
      writeConcern = { w: 'majority', j: true },
      maxTimeMS = 10000
    } = options;

    let lastError;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        session.startTransaction({
          readConcern: { level: readConcern },
          writeConcern,
          maxTimeMS
        });

        const result = await operation(session);
        
        await session.commitTransaction();
        return result;
        
      } catch (error) {
        await session.abortTransaction();
        lastError = error;
        
        // Check if error is retryable
        if (this.isRetryableError(error) && attempt < retries) {
          await this.delay(retryDelay * attempt); // Exponential backoff
          continue;
        }
        
        // Non-retryable error or max retries reached
        break;
      } finally {
        if (attempt === retries || !this.isRetryableError(lastError)) {
          session.endSession();
        }
      }
    }
    
    throw lastError || new AppError('Transaction failed after retries', 500);
  }

  /**
   * Execute multiple operations in bulk with transaction
   */
  async executeBulkTransaction(operations, options = {}) {
    return this.executeTransaction(async (session) => {
      const results = [];
      
      for (const operation of operations) {
        const result = await operation(session);
        results.push(result);
      }
      
      return results;
    }, options);
  }

  /**
   * Execute read-modify-write operation safely
   */
  async readModifyWrite(model, filter, updateFn, options = {}) {
    return this.executeTransaction(async (session) => {
      // Read with session to ensure consistency
      const doc = await model.findOne(filter).session(session);
      
      if (!doc) {
        throw new AppError('Document not found', 404);
      }
      
      // Modify
      const updatedDoc = updateFn(doc);
      
      // Write
      await updatedDoc.save({ session });
      
      return updatedDoc;
    }, options);
  }

  /**
   * Check if error is retryable (transient)
   */
  isRetryableError(error) {
    if (!error) return false;
    
    const retryableErrors = [
      'WriteConflict',
      'LockTimeout',
      'InterruptedAtShutdown',
      'InterruptedDueToReplStateChange',
      'NotMaster',
      'NotMasterNoSlaveOk',
      'NotMasterOrSecondary',
      'PrimarySteppedDown',
      'ShutdownInProgress',
      'HostNotFound',
      'HostUnreachable',
      'NetworkTimeout',
      'SocketException'
    ];
    
    return retryableErrors.some(retryableError => 
      error.message?.includes(retryableError) ||
      error.code === retryableError ||
      error.codeName === retryableError
    );
  }

  /**
   * Delay helper for retry logic
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate document references before transaction
   */
  async validateReferences(validations, session) {
    for (const validation of validations) {
      const { model, ids, fieldName = '_id' } = validation;
      
      if (!Array.isArray(ids)) continue;
      
      const count = await model.countDocuments({
        [fieldName]: { $in: ids }
      }).session(session);
      
      if (count !== ids.length) {
        throw new AppError(`Invalid reference in ${fieldName}`, 400);
      }
    }
  }

  /**
   * Execute operation with optimistic locking
   */
  async optimisticUpdate(model, filter, updateData, options = {}) {
    const maxRetries = options.maxRetries || 5;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        // Include version in filter for optimistic locking
        const result = await model.findOneAndUpdate(
          { ...filter, __v: updateData.__v },
          { 
            ...updateData,
            $inc: { __v: 1 } // Increment version
          },
          { 
            new: true,
            runValidators: true,
            ...options 
          }
        );
        
        if (!result) {
          // Document was modified by another operation
          attempt++;
          if (attempt >= maxRetries) {
            throw new AppError('Document was modified by another operation', 409);
          }
          // Brief delay before retry
          await this.delay(10 * attempt);
          continue;
        }
        
        return result;
        
      } catch (error) {
        if (attempt >= maxRetries - 1) {
          throw error;
        }
        attempt++;
        await this.delay(10 * attempt);
      }
    }
  }

  /**
   * Ensure data consistency across related documents
   */
  async ensureConsistency(consistencyChecks, session) {
    for (const check of consistencyChecks) {
      const { description, validate } = check;
      
      try {
        const isValid = await validate(session);
        
        if (!isValid) {
          throw new AppError(`Consistency check failed: ${description}`, 500);
        }
      } catch (error) {
        throw new AppError(`Consistency validation error: ${description} - ${error.message}`, 500);
      }
    }
  }
}

module.exports = new TransactionService();
