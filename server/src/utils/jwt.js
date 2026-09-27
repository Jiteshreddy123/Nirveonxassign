const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token
 * @param {Object} payload - Object containing id, email, role
 * @returns {String} token
 */
const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'dev_jwt_secret_nirveonx_assignment_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    {
      id: payload._id || payload.id,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    },
    secret,
    { expiresIn }
  );
};

module.exports = {
  generateToken,
};
