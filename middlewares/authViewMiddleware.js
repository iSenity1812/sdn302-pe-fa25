const { verifyToken } = require('../config/jwtConfig');

exports.authenticateView = (req, res, next) => {
  try {
    // Try to get token from cookies first, then from Authorization header
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    // If no token found, redirect to login
    if (!token) {
      console.log('[Auth Middleware] No token found, redirecting to login');
      return res.redirect('/auth/login');
    }

    // Verify the token
    const decoded = verifyToken(token);
    req.user = decoded;
    console.log('[Auth Middleware] Token verified successfully for user:', decoded.id);
    next();
  } catch (error) {
    console.error('[Auth Middleware] Token verification failed:', error.message);
    res.clearCookie('token');
    return res.redirect('/auth/login');
  }
};
