
class CircuitBreaker {
  constructor(failureThreshold = 3, resetTimeout = 5000) {
    this.failureCount = 0;
    this.isOpen = false;
    this.lastFailureTime = null;
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
  }

  /**
   * Check if a request can be made
   * @returns {boolean} - true if request allowed, false if blocked
   */
  canMakeRequest() {
    if (!this.isOpen) return true;

    if (Date.now() - this.lastFailureTime < this.resetTimeout) {
      return false;
    }

    // Reset after timeout
    this.isOpen = false;
    this.failureCount = 0;
    return true;
  }

  /**
   * Record a failed request
   */
  recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.isOpen = true;
    }
  }

  /**
   * Record a successful request
   */
  recordSuccess() {
    this.failureCount = 0;
    this.isOpen = false;
  }
}

module.exports = CircuitBreaker;
