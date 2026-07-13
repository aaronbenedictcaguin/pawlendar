const db = require("../config/db");

exports.createGroomer = (req, res) => {

    const {
        first_name,
        last_name,
        email,
        phone_number,
        specialization,
        hire_date,
        max_daily_appointments
    } = req.body;

    const sql = `
        INSERT INTO groomer 
        (
            first_name,
            last_name,
            email,
            phone_number,
            specialization,
            hire_date,
            max_daily_appointments
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            first_name,
            last_name,
            email,
            phone_number,
            specialization,
            hire_date,
            max_daily_appointments
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.status(201).json({
                message: "Groomer created successfully",
                staff_id: result.insertId
            });
        }
    );

}

// gets all groomers (woah)
exports.getGroomers = (req, res) => {

    const sql = `
        SELECT
            staff_id,
            first_name,
            last_name,
            email,
            phone_number,
            specialization,
            hire_date,
            max_daily_appointments,
            active_flag,
            created_at,
            updated_at
        FROM groomer
        WHERE active_flag = TRUE;
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(results);

    });

};
// if admin accounts should only be able to modify groomers in their own branch i'll have to add like
// AND branch_id = ?

exports.getGroomerByID = (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            staff_id,
            first_name,
            last_name,
            email,
            phone_number,
            specialization,
            hire_date,
            max_daily_appointments,
            active_flag,
            created_at,
            updated_at
        FROM groomer
        WHERE active_flag = TRUE;
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Groomer not found"
            });
        }

        res.json(results[0]);

    });

}

exports.updatePet = (req, res) => {
    const {id} = req.params;
    const {
        first_name,
        last_name,
        email,
        phone_number,
        specialization,
        hire_date,
        max_daily_appointments,
        active_flag
    } = req.body;

    const sql = `
        UPDATE groomer
            SET first_name,
            last_name,
            email,
            phone_number,
            specialization,
            hire_date,
            max_daily_appointments,
            active_flag
        WHERE staff_id = ?
        `;

    db.query(
        sql,
        [
            first_name,
            last_name,
            email,
            phone_number,
            specialization,
            hire_date,
            max_daily_appointments,
            active_flag
        ],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Groomer not found"
                });
            }

            res.json({
                message: "Groomer updated successfully"
            });
        }
    );
};

exports.deletePet = (req, res) => {
    const {id} = req.params;

    const sql = "UPDATE groomer SET active_flag = FALSE, updated_at = NOW() WHERE staff_id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Groomer not found"
                });
            }

        res.json({
            message: "Groomer deleted successfully"
        });
    });
};