const db = require("../config/db");

exports.createGroomer = (req, res) => {

    const {
        first_name,
        last_name,
        email,
        phone_number,
        specialization,
        hire_date
    } = req.body;

    const sql = `
        INSERT INTO staff 
        (
            first_name,
            last_name,
            email,
            phone_number,
            specialization,
            hire_date
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
            hire_date
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
            active_flag,
            created_at,
            updated_at
        FROM staff
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

exports.getGroomerById = (req, res) => {

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
            active_flag,
            created_at,
            updated_at
        FROM staff
        WHERE staff_id = ? AND active_flag = TRUE;
    `;

    db.query(sql, [id], (err, results) => {

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

exports.updateGroomer = (req, res) => {
    const {id} = req.params;
    const {
        first_name,
        last_name,
        email,
        phone_number,
        specialization,
        hire_date,
        active_flag
    } = req.body;

    const sql = `
        UPDATE staff
            SET first_name = ?,
            last_name = ?,
            email = ?,
            phone_number = ?,
            specialization = ?,
            hire_date = ?,
            active_flag = ?
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
            active_flag,
            id
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

exports.deactivateGroomer = (req, res) => {
    const {id} = req.params;

    const sql = "UPDATE staff SET active_flag = FALSE, updated_at = NOW() WHERE staff_id = ?";

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

exports.getAvailability = (req,res)=>{

    db.query(
        `
        SELECT
            day_of_week,
            start_time,
            end_time
        FROM staff_availability
        WHERE staff_id=?
        ORDER BY FIELD(
            day_of_week,
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday'
        )
        `,
        [req.params.id],
        (err,results)=>{

            if(err)
                return res.status(500).json({error:err.message});

            res.json(results);

        }
    );

};