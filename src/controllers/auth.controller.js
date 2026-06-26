const bcrypt = require('bcrypt');
const db = require('../config/db');

const { generateToken } =
  require('../utils/jwt');

exports.register = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      phone_number,
      email,
      street_address,
      barangay,
      city,
      province,
      password
    } = req.body;

    const [existing] = await db.query(
      `SELECT * FROM OWNER
       WHERE email = ?`,
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: 'Email already exists'
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO OWNER
      (
        first_name,
        last_name,
        phone_number,
        email,
        street_address,
        barangay,
        city,
        province,
        date_registered,
        password
      )
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [
        first_name,
        last_name,
        phone_number,
        email,
        street_address,
        barangay,
        city,
        province,
        hashedPassword
      ]
    );

    res.status(201).json({
      message: 'Registered successfully'
    });

  } catch (error) {
    res.status(500).json(error);
  }
};

exports.login = async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    const [owners] = await db.query(
      `SELECT * FROM OWNER
       WHERE email = ?`,
      [email]
    );

    if (owners.length === 0) {
      return res.status(400).json({
        message: 'Owner not found'
      });
    }

    const owner = owners[0];

    const match =
      await bcrypt.compare(
        password,
        owner.password
      );

    if (!match) {
      return res.status(400).json({
        message: 'Incorrect password'
      });
    }

    const token =
      generateToken(owner);

    res.json({
      token
    });

  } catch (error) {
    res.status(500).json(error);
  }
};