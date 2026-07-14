const db = require("../config/db");

// Create Service
exports.createService = (req, res) => {

    const {
        service_name,
        category,
        description,
        price,
        duration_minutes
    } = req.body;

    const sql = `
        SELECT
            service_id,
            service_name,
            category,
            description,
            price,
            duration_minutes
        FROM service_menu
        WHERE service_id = ?
        AND active_flag = TRUE
    `;

    db.query(
        sql,
        [
            service_name,
            category,
            description,
            price,
            duration_minutes
        ],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.status(201).json({
                message: "Service created successfully",
                service_id: result.insertId
            });

        }
    );

};


// Get All Services
exports.getServices = (req, res) => {

    const sql = `
        SELECT
            service_id,
            service_name,
            category,
            description,
            price,
            duration_minutes
        FROM service_menu
        WHERE active_flag = TRUE
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
        SELECT 
        service_name,
        category,
        description,
        price,
        duration_minutes
        FROM service_menu
        WHERE service_id = ? AND active_flag = TRUE
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
        category,
        description,
        price,
        duration_minutes
    } = req.body;

    const sql = `
        UPDATE service_menu
        SET
            service_name = ?,
            category = ?,
            description = ?,
            price = ?,
            duration_minutes = ?,
            updated_at = NOW()
        WHERE service_id = ? AND active_flag = TRUE
    `;

    db.query(
        sql,
        [
            service_name,
            category,
            description,
            price,
            duration_minutes,
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
                    message: "Service not found"
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
        UPDATE service_menu
        SET active_flag = FALSE
        WHERE service_id = ? AND active_flag = TRUE
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        res.json({
            message: "Service deactivated successfully"
        });

    });
};