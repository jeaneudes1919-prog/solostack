const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtGenerator = (user_id, role) => {
  const payload = {
    user: {
      id: user_id,
      role: role
    }
  };

  // Le token expire dans 1 jour (réglable)
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
};

module.exports = jwtGenerator;