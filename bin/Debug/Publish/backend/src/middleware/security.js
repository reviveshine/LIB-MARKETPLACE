export const securityMiddleware = {
  rateLimiter: (req, res, next) => {
    const key = `${req.ip}:${req.path}`;
    const requests = this.requestCounts.get(key) || 0;
    
    if (requests > 100) { // 100 requests per minute
      return res.status(429).json({ error: 'Too many requests' });
    }
    
    this.requestCounts.set(key, requests + 1);
    next();
  },

  sanitizeInput: (req, res, next) => {
    // Sanitize all input data
    req.body = this.sanitizeObject(req.body);
    req.query = this.sanitizeObject(req.query);
    req.params = this.sanitizeObject(req.params);
    next();
  },

  preventSQLInjection: (req, res, next) => {
    const suspicious = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)/gi;
    const checkValue = (value) => {
      if (typeof value === 'string' && suspicious.test(value)) {
        return true;
      }
      return false;
    };

    const hasSQLInjection = Object.values(req.body).some(checkValue) ||
                           Object.values(req.query).some(checkValue);

    if (hasSQLInjection) {
      return res.status(400).json({ error: 'Invalid input detected' });
    }
    next();
  },

  validateCSRF: (req, res, next) => {
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
      const token = req.headers['x-csrf-token'];
      if (!token || !this.validateCSRFToken(token, req.session)) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
      }
    }
    next();
  }
};