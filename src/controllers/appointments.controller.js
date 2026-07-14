const db = require("../config/db");
const { calculateAppointmentEnd } = require("../utils/appointmentHelper");
const { findAvailableStaff } = require("../utils/staffAvailability");

exports.bookAppointment = async (req, res) => {

    try {

        const user_id = req.user.user_id;

        const {
            pet_id,
            start_datetime,
            notes,
            service_ids
        } = req.body;

        // Check if pet belongs to logged-in user
        const checkPetSql = `
            SELECT *
            FROM pet
            WHERE pet_id = ?
            AND user_id = ?
            AND active_flag = TRUE
        `;

        const pets = await new Promise((resolve, reject) => {

            db.query(checkPetSql, [pet_id, user_id], (err, results) => {

                if (err) return reject(err);

                resolve(results);

            });

        });

        if (pets.length === 0) {
            return res.status(403).json({
                message: "You do not own this pet."
            });
        }

        // Appointment must be in the future
        const appointmentDate = new Date(start_datetime);

        const minimumBookingTime = new Date();
        minimumBookingTime.setMinutes(
            minimumBookingTime.getMinutes() + 30
        );

        if (appointmentDate < minimumBookingTime) {
            return res.status(400).json({
                message: "Appointments must be booked at least 30 minutes in advance."
            });
        }

        // Calculate duration and total price
        const appointmentInfo = await calculateAppointmentEnd(
            service_ids,
            start_datetime
        );

        const endDatetime = appointmentInfo.endDatetime;
        const total_price = appointmentInfo.totalPrice;

        // Find available staff
        const staff = await findAvailableStaff(
            new Date(start_datetime),
            endDatetime
        );

        if (!staff) {
            return res.status(409).json({
                message: "No staff available."
            });
        }

        // Start transaction
        db.beginTransaction((err) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            const insertAppointmentSql = `
                INSERT INTO appointments
                (
                    pet_id,
                    staff_id,
                    start_datetime,
                    end_datetime,
                    total_price,
                    notes
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            db.query(
                insertAppointmentSql,
                [
                    pet_id,
                    staff.staff_id,
                    start_datetime,
                    endDatetime,
                    total_price,
                    notes
                ],
                (err, appointmentResult) => {

                    if (err) {

                        return db.rollback(() => {

                            res.status(500).json({
                                error: err.message
                            });

                        });

                    }

                    const appointment_id = appointmentResult.insertId;

                    const getServicesSql = `
                        SELECT
                            service_id,
                            price,
                            duration_minutes
                        FROM service_menu
                        WHERE service_id IN (?)
                        AND active_flag = 1
                    `;

                    db.query(
                        getServicesSql,
                        [service_ids],
                        (serviceErr, services) => {

                            if (serviceErr) {

                                return db.rollback(() => {

                                    res.status(500).json({
                                        error: serviceErr.message
                                    });

                                });

                            }

                            if (services.length === 0) {

                                return db.rollback(() => {

                                    res.status(400).json({
                                        message: "Invalid services selected."
                                    });

                                });

                            }

                            const values = services.map(service => [

                                appointment_id,
                                service.service_id,
                                service.price,
                                service.duration_minutes

                            ]);

                            const insertServicesSql = `
                                INSERT INTO appointment_services
                                (
                                    appointment_id,
                                    service_id,
                                    service_price,
                                    duration_minutes
                                )
                                VALUES ?
                            `;

                            db.query(
                                insertServicesSql,
                                [values],
                                (insertErr) => {

                                    if (insertErr) {

                                        return db.rollback(() => {

                                            res.status(500).json({
                                                error: insertErr.message
                                            });

                                        });

                                    }

                                    db.commit((commitErr) => {

                                        if (commitErr) {

                                            return db.rollback(() => {

                                                res.status(500).json({
                                                    error: commitErr.message
                                                });

                                            });

                                        }

                                        return res.status(201).json({

                                            message: "Appointment booked successfully.",

                                            appointment_id,

                                            assigned_staff: {
                                                staff_id: staff.staff_id,
                                                first_name: staff.first_name,
                                                last_name: staff.last_name
                                            }

                                        });

                                    });

                                }
                            );

                        }
                    );

                }
            );

        });

    }

    catch (err) {

        return res.status(500).json({
            error: err.message
        });

    }

};

exports.checkAvailability = async (req, res) => {

    try {

        const {
            start_datetime,
            service_ids
        } = req.query;

        if (!start_datetime || !service_ids) {
            return res.status(400).json({
                message: "start_datetime and service_ids are required."
            });
        }

        const appointmentInfo =
            await calculateAppointmentEnd(
                JSON.parse(service_ids),
                start_datetime
            );

        const staff =
            await findAvailableStaff(
                new Date(start_datetime),
                appointmentInfo.endDatetime
            );

        res.json({
            available: !!staff
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};

// changed APPOINTMENTS to appointments so that it's not confusing, changed the name sd sa database
exports.getAppointments = (req, res) => {

    const user_id = req.user.user_id;

    const sql = `
        SELECT a.*
        FROM appointments a
        JOIN pet p
        ON a.pet_id = p.pet_id
        WHERE p.user_id = ?
    `;

    db.query(sql, [user_id], (err, results) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(results);
    });
};

exports.getAppointmentById = (req, res) => {

    const { id } = req.params;
    const user_id = req.user.user_id;

    const sql = `
        SELECT a.*
        FROM appointments a
        JOIN pet p
        ON a.pet_id = p.pet_id
        WHERE a.appointment_id = ?
        AND p.user_id = ?
    `;

    db.query(sql, [id, user_id], (err, results) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if(results.length === 0){
            return res.status(404).json({
                message:"Appointment not found"
            });
        }

        res.json(results[0]);
    });
};

exports.getAllAppointments = (req,res)=>{

    const sql = `
        SELECT
            a.appointment_id,
            a.start_datetime,
            a.end_datetime,
            a.status,
            a.total_price,
            a.payment_status,

            p.pet_name,

            u.first_name,
            u.last_name,

            s.staff_id,
            s.first_name AS staff_first_name,
            s.last_name AS staff_last_name

        FROM appointments a

        JOIN pet p
            ON a.pet_id = p.pet_id

        JOIN user u
            ON p.user_id = u.user_id

        LEFT JOIN staff s
            ON a.staff_id = s.staff_id

        ORDER BY a.start_datetime ASC
    `;


    db.query(sql,(err,results)=>{

        if(err){
            return res.status(500).json({
                error:err.message
            });
        }


        res.json(results);

    });

};

exports.updateStatus = (req, res) => {

    const { id } = req.params;
    const { status } = req.body;


    const sqlGet = `
        SELECT status
        FROM appointments
        WHERE appointment_id = ?
    `;


    db.query(sqlGet, [id], (err, results) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }


        if (results.length === 0) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }


        const currentStatus = results[0].status;


        const allowedTransitions = {

            "Scheduled": "Checked In",

            "Checked In": "In Progress",

            "In Progress": "Ready for Pickup",

            "Ready for Pickup": "Completed"

        };


        if (allowedTransitions[currentStatus] !== status) {

            return res.status(400).json({

                message:
                `Cannot change status from ${currentStatus} to ${status}`

            });

        }


        const sqlUpdate = `
            UPDATE appointments
            SET status = ?
            WHERE appointment_id = ?
        `;


        db.query(
            sqlUpdate,
            [status, id],
            (err, result)=>{

                if(err){
                    return res.status(500).json({
                        error:err.message
                    });
                }


                res.json({
                    message:"Appointment status updated"
                });

            }
        );

    });

};

exports.cancelAppointment = (req, res) => {

    const { id } = req.params;
    const user_id = req.user.user_id;


    const sql = `
        UPDATE appointments a
        JOIN pet p 
        ON a.pet_id = p.pet_id

        SET a.status = 'Cancelled'

        WHERE a.appointment_id = ?
        AND p.user_id = ?
        AND a.status NOT IN ('Completed', 'Cancelled')
    `;


    db.query(
        sql,
        [id, user_id],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }


            if(result.affectedRows === 0){
                return res.status(404).json({
                    message:"Appointment not found or does not belong to you"
                });
            }


            res.json({
                message:"Appointment cancelled successfully"
            });

        }
    );
};