const db = require("../config/db");

// creates an owner
exports.createOwner = (req, res) => {
    const { name, phone } = req.body;

    const sql = "INSERT INTO owner (name, phone) VALUES (?, ?)";

    db.query(sql, [name, phone], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({
            message: "Owner created successfully",
            data: result
        });
    });
};

// get all owners
exports.getOwners = (req, res) => {
    const sql = "SELECT * FROM owner";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({
            data: results
        });
    });
};