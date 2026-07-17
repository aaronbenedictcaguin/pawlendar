const db = require("../config/db");

// get all users
exports.getUsers = (req, res) => {
    const sql = `
        SELECT 
            user_id,
            first_name,
            last_name,
            email,
            phone_number,
            role,
            membership,
            loyalty_points
        FROM user
        WHERE active_flag = TRUE
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({
            data: results
        });
    });
};

exports.getMe = (req, res) => {
    const user_id = req.user.user_id;

    const sql = `
        SELECT user_id, first_name, last_name, email, phone_number
        FROM user
        WHERE user_id = ?
    `;

    db.query(sql, [user_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json(result[0]);
    });
};