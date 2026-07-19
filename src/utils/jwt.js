const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if(!JWT_SECRET){
    throw new Error("JWT_SECRET is missing");
}

function generateToken(user) {
  return jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      role: user.role
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