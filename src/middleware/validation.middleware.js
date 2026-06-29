module.exports.validateRegister = (req, res, next) => {
  const {
    first_name,
    last_name,
    email,
    password,
    phone_number
  } = req.body;

  if (
    !first_name ||
    !last_name ||
    !email ||
    !password ||
    !phone_number
  ) {
    return res.status(400).json({
      message: 'All fields are required'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: 'Invalid email format'
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters'
    });
  }

  next();
};

module.exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required'
    });
  }

  next();
};