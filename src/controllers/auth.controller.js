const bcrypt = require("bcrypt");
const db = require("../config/db");

const { generateToken } = require("../utils/jwt");

// Register
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

        db.query(
            `
            SELECT email, phone_number
            FROM OWNER
            WHERE email = ? OR phone_number = ?
            `,
            [email, phone_number],
            async (err, existing) => {

                if (err) {
                    return res.status(500).json({
                        message: "Internal server error"
                    });
                }

                const emailExists = existing.some(
                    owner => owner.email === email
                );

                const phoneExists = existing.some(
                    owner => owner.phone_number === phone_number
                );

                if (emailExists) {
                    return res.status(400).json({
                        message: "Email already exists"
                    });
                }

                if (phoneExists) {
                    return res.status(400).json({
                        message: "Phone number already exists"
                    });
                }

                const hashedPassword =
                    await bcrypt.hash(password, 10);

                db.query(
                    `
                    INSERT INTO OWNER
                    (
                    first_name,
                    last_name,
                    phone_number,
                    email,
                    street_address,
                    barangay,
                    city,
                    province,
                    password
                    )
                    VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `,
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
                    ],
                    (err, result) => {

                        if (err) {
                            return res.status(500).json({
                                message: "Internal server error"
                            });
                        }

                        res.status(201).json({
                            message: "Registered successfully",
                            owner_id: result.insertId
                        });

                    }
                );

            }
        );

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

// Login
exports.login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        db.query(
            `
            SELECT *
            FROM OWNER
            WHERE email = ?
            AND active_flag = TRUE
            `,
            [email],
            async (err, owners) => {

                if (err) {
                    return res.status(500).json({
                        message: "Internal server error"
                    });
                }

                if (owners.length === 0) {
                    return res.status(400).json({
                        message: "Invalid email or password"
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
                        message: "Invalid email or password"
                    });
                }

                const token =
                    generateToken(owner);

                res.json({
                    message: "Login successful",
                    token
                });

            }
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Internal server error"
        });

    }

};