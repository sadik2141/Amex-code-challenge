
class ExponentialBackoff {
  /**
   * Constructor
   * @param {number} maxAttempts - Maximum number of retry attempts (default: 3)
   * @param {number} baseDelay - Initial delay in milliseconds (default: 1000)
   */
  constructor(maxAttempts = 3, baseDelay = 1000) {
    this.maxAttempts = maxAttempts;
    this.baseDelay = baseDelay;
  }
  /**
   * Execute function with exponential backoff retry logic
   * @param {Function} fn - Async function to execute
   * @returns {Promise} - Result of the function on success
   * @throws {Error} - Throws error if all attempts fail
   */
  async execute(fn) {
    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        // Try to execute the function
        return await fn();
      } catch (error) {
        // If last attempt failed, throw the error
        if (attempt === this.maxAttempts) throw error;
        
        // Calculate exponential wait time
        const waitTime = this.baseDelay * Math.pow(2, attempt - 1);
        
        // Wait before next retry
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
}

module.exports = ExponentialBackoff;
