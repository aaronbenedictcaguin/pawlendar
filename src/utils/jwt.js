const jwt = require('jsonwebtoken');

const JWT_SECRET =
  process.env.JWT_SECRET || 'your_secret_key';

function generateToken(owner) {
  return jwt.sign(
    {
      owner_id: owner.owner_id,
      email: owner.email
    },
    JWT_SECRET,
    {
      expiresIn: '1d'
    }
  );
}

module.exports = {
  generateToken
};