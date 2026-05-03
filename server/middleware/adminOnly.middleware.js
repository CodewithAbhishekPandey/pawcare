const { protect } = require('./auth');

/**
 * Admin-only middleware.
 * First verifies JWT via protect, then checks role === 'admin'.
 */
const adminOnly = (req, res, next) => {
  protect(req, res, (err) => {
    if (err) return; // protect already sent the response
    if (res.headersSent) return; // protect returned an error response

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access only',
      });
    }
    next();
  });
};

module.exports = adminOnly;
