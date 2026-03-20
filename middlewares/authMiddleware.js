const { verifyToken } = require('../config/jwtConfig')
const createError = require('http-errors');

exports.authenticate = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) return next(createError(401, 'Access denied. No token provided.'));

  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    next(createError(403, 'Invalid token.'));
  }
};

