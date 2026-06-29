const db = require("../config/db");

// Create Service
exports.createService = (req, res) => {

    const {
        service_name,
        description,
        price,
        duration_minutes,
        category
    } = req.body;

    const sql = `
        INSERT INTO SERVICE_MENU
        (
            service_name,
            description,
            price,
            duration_minutes,
            category,
            active_flag
        )
        VALUES (?, ?, ?, ?, ?, TRUE)
    `;

    db.query(
        sql,
        [
            service_name,
            description,
            price,
            duration_minutes,
            category
        ],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message: "Service created successfully",
                service_id: result.insertId
            });

        }
    );

};


// Get All Services
exports.getServices = (req, res) => {

    const sql = `
        SELECT *
        FROM SERVICE_MENU
        ORDER BY service_name
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


// Get One Service
exports.getService = (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT *
        FROM SERVICE_MENU
        WHERE service_id = ?
    `;

    db.query(sql, [id], (err, results) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (results.length === 0) {

            return res.status(404).json({
                message: "Service not found"
            });

        }

        res.json(results[0]);

    });

};


// Update Service
exports.updateService = (req, res) => {

    const { id } = req.params;

    const {
        service_name,
        description,
        price,
        duration_minutes,
        category,
        active_flag
    } = req.body;

    const sql = `
        UPDATE SERVICE_MENU
        SET
            service_name = ?,
            description = ?,
            price = ?,
            duration_minutes = ?,
            category = ?,
            active_flag = ?
        WHERE service_id = ?
    `;

    db.query(
        sql,
        [
            service_name,
            description,
            price,
            duration_minutes,
            category,
            active_flag,
            id
        ],
        (err) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message: "Service updated successfully"
            });

        }
    );

};


// Soft Delete
exports.deleteService = (req, res) => {

    const { id } = req.params;

    const sql = `
        UPDATE SERVICE_MENU
        SET active_flag = FALSE
        WHERE service_id = ?
    `;

    db.query(sql, [id], (err) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json({
            message: "Service deactivated successfully"
        });

    });

};