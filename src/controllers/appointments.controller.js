const db = require("../config/db");

exports.bookAppointment = (req, res) => {
    const {pet_id, staff_id, start_datetime, total_price, notes} = req.body;

    // changed APPOINTMENTS to appointments so that it's not confusing, changed the name sd sa database
    const checkSql = `
        SELECT *
        FROM appointments
        WHERE staff_id = ? AND start_datetime = ? AND status != 'Cancelled'
    `;

    db.query(checkSql, [staff_id, start_datetime], (err, results) => {
            if (err) {return res.status(500).json({error: err.message});}

            if (results.length > 0) {return res.status(400).json({message: "Selected time slot is unavailable"});}

            // changed APPOINTMENTS to appointments so that it's not confusing, changed the name sd sa database
            const insertSql = `
                INSERT INTO appointments(pet_id, staff_id, start_datetime, total_price, notes)
                VALUES (?, ?, ?, ?, ?)
            `;

            db.query(insertSql,[pet_id, staff_id, start_datetime, total_price, notes],
                (err, result) => {
                    if (err) {return res.status(500).json({error: err.message});}

                    res.status(201).json({message: "Appointment booked successfully", data: result });
                }
            );
        }
    );
};

exports.checkAvailability = (req, res) => {
    const {staff_id, start_datetime} = req.query;

    // changed APPOINTMENTS to appointments so that it's not confusing, changed the name sd sa database
    const sql = `
        SELECT *
        FROM appointments
        WHERE staff_id = ? AND start_datetime = ? AND status != 'Cancelled'
    `;

    db.query(sql, [staff_id, start_datetime],
        (err, results) => {
            if (err) {return res.status(500).json({error: err.message});}

            res.json({available: results.length === 0});
        }
    );
};

// changed APPOINTMENTS to appointments so that it's not confusing, changed the name sd sa database
exports.getAppointments = (req, res) => {
    const sql = "SELECT * FROM appointments";

    db.query(sql, (err, results) => {
        if (err) {return res.status(500).json({error: err.message});}

        res.json({data: results});
    });
};

exports.getAppointmentById = (req, res) => {
    const { id } = req.params;

    // changed APPOINTMENTS to appointments so that it's not confusing, changed the name sd sa database
    const sql = "SELECT * FROM appointments WHERE appointment_id = ?";

    db.query(sql, [id], (err, results) => {
        if (err) {return res.status(500).json({error: err.message});}

        res.json({data: results});
    });
};

exports.updateStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const sql = `
        UPDATE appointments
        SET status = ?
        WHERE appointment_id = ?
    `;

    db.query(sql, [status, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({ message: "Appointment updated successfully", data: result });
    });
};

exports.cancelAppointment = (req, res) => {
    const { id } = req.params;

    // changed APPOINTMENTS to appointments so that it's not confusing, changed the name sd sa database
    const sql = `
        UPDATE appointments
        SET status = 'Cancelled'
        WHERE appointment_id = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {return res.status(500).json({error: err.message});
        }

        res.json({message: "Appointment cancelled successfully", data: result});
    });
};