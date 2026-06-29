module.exports.validateRegister = (req, res, next) => {
  const {
    first_name,
    last_name,
    email,
    password,
    phone_number,
    street_address,
    barangay,
    city,
    province
  } = req.body;

  if (
    !first_name ||
    !last_name ||
    !email ||
    !password ||
    !phone_number ||
    !street_address ||
    !barangay ||
    !city ||
    !province
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

    const phoneRegex = /^09\d{9}$/;

    if (!phoneRegex.test(phone_number)) {
        return res.status(400).json({
            message: "Invalid phone number"
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

//PET VALIDATION
module.exports.validatePet = (req, res, next) => {
    const {
        pet_name,
        species,
        breed,
        gender,
        weight
    } = req.body;

    if (
        !pet_name ||
        !species ||
        !breed ||
        !gender
    ) {
        return res.status(400).json({
            message: "Required pet information is missing"
        });
    }

    if (!["M", "F"].includes(gender)) {
        return res.status(400).json({
            message: "Invalid gender"
        });
    }

    if (weight !== undefined && weight <= 0) {
        return res.status(400).json({
            message: "Weight must be greater than 0"
        });
    }

    next();
};