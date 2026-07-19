const db = require("../config/db");
const { calculateAppointmentEnd } = require("../utils/appointmenthelper");
const { findAvailableStaff } = require("../utils/staffavailability");

exports.bookAppointment = async (req, res) => {

    try {

        const user_id = req.user.user_id;

        const {
            pet_id,
            start_datetime,
            notes,
            service_ids = [],
            package_ids = [],
            staff_id
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
        minimumBookingTime.setHours(
            minimumBookingTime.getHours() + 5
        );

        if (appointmentDate < minimumBookingTime) {
            return res.status(400).json({
                message: "Appointments must be booked at least 5 hours in advance."
            });
        }
        
        if (service_ids.length === 0 && package_ids.length === 0) {

            return res.status(400).json({
                message: "Please select at least one service or package."
            });

        }

        if (service_ids.length > 0 && package_ids.length > 0) {

            const packageServices = await new Promise((resolve, reject) => {

                db.query(
                    `
                    SELECT
                        ps.service_id,
                        sm.service_name
                    FROM package_services ps
                    JOIN service_menu sm
                        ON ps.service_id = sm.service_id
                    WHERE ps.package_id IN (?)
                    `,
                    [package_ids],
                    (err, results) => {

                        if (err) return reject(err);

                        resolve(results);

                    }
                );

            });

            const duplicateServices = packageServices.filter(service =>
                service_ids.includes(service.service_id)
            );

            if (duplicateServices.length > 0) {

                return res.status(400).json({

                    message: "Some selected services are already included in the selected package(s).",

                    duplicates: duplicateServices

                });

            }

        }

        // Calculate duration
        const appointmentInfo = await calculateAppointmentEnd(
            service_ids,
            package_ids,
            start_datetime
        );

        const endDatetime = appointmentInfo.endDatetime;
        const total_price = appointmentInfo.totalPrice;

        const openingTime = new Date(start_datetime);
        openingTime.setHours(10, 0, 0, 0);

        const closingTime = new Date(start_datetime);
        closingTime.setHours(19, 0, 0, 0);

        if (
            new Date(start_datetime) < openingTime ||
            endDatetime > closingTime
        ) {
            return res.status(400).json({
                message: "Appointment must be within business hours (10:00 AM - 7:00 PM)."
            });
        }
        

        // Find available staff
        const staff = await findAvailableStaff(
            new Date(start_datetime),
            endDatetime,
            staff_id
        );

        if (!staff) {
            return res.status(409).json({
                message: staff_id
                    ? "Selected groomer is inactive or unavailable."
                    : "No active groomer is available."
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

                    const values = appointmentInfo.selectedItems.map(item => [

                        appointment_id,

                        item.service_id,

                        item.package_id,

                        item.is_package_service,

                        item.service_price,

                        item.duration_minutes

                    ]);

                    const insertServicesSql = `
                        INSERT INTO appointment_services
                        (
                            appointment_id,
                            service_id,
                            package_id,
                            is_package_service,
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
            service_ids,
            package_ids,
            staff_id
        } = req.query;

        if (!start_datetime || !service_ids) {
            return res.status(400).json({
                message: "start_datetime and service_ids are required."
            });
        }

        const appointmentInfo =
            await calculateAppointmentEnd(
                service_ids ? JSON.parse(service_ids) : [],
                package_ids ? JSON.parse(package_ids) : [],
                start_datetime
            );

        const staff =
            await findAvailableStaff(
                new Date(start_datetime),
                appointmentInfo.endDatetime,
                staff_id
            );

        res.json({
            available: !!staff,
            staff: staff || null
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};

exports.reassignAppointment = async (req, res) => {
    const { id } = req.params;
    const { staff_id } = req.body;

    try {
        const appointments = await new Promise((resolve, reject) => {
            db.query(
                `SELECT appointment_id, start_datetime, end_datetime
                 FROM appointments
                 WHERE appointment_id = ?
                 AND status NOT IN ('Completed', 'Cancelled')`,
                [id],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });

        if (appointments.length === 0) {
            return res.status(404).json({
                message: "Reassignable appointment not found."
            });
        }

        const appointment = appointments[0];
        const staff = await findAvailableStaff(
            new Date(appointment.start_datetime),
            new Date(appointment.end_datetime),
            staff_id,
            appointment.appointment_id
        );

        if (!staff) {
            return res.status(409).json({
                message: staff_id
                    ? "Selected groomer is inactive or unavailable."
                    : "No active groomer is available."
            });
        }

        await new Promise((resolve, reject) => {
            db.query(
                "UPDATE appointments SET staff_id = ? WHERE appointment_id = ?",
                [staff.staff_id, id],
                err => err ? reject(err) : resolve()
            );
        });

        return res.json({
            message: "Appointment reassigned successfully.",
            appointment_id: Number(id),
            assigned_staff: staff,
            assignment: staff_id ? "manual" : "automatic"
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// changed APPOINTMENTS to appointments so that it's not confusing, changed the name sd sa database
exports.getAppointments = (req, res) => {

    const user_id = req.user.user_id;

    const sql = `
        SELECT
        a.*,
        p.pet_name,
        s.first_name AS staff_first_name,
        s.last_name AS staff_last_name
    FROM appointments a
    JOIN pet p
        ON a.pet_id = p.pet_id
    LEFT JOIN staff s
        ON a.staff_id = s.staff_id
    WHERE p.user_id = ?
    ORDER BY a.start_datetime ASC;
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
        SELECT

            a.appointment_id,
            a.start_datetime,
            a.end_datetime,
            a.status,
            a.total_price,
            a.payment_status,
            a.notes,

            p.pet_name,

            s.first_name AS staff_first_name,
            s.last_name AS staff_last_name,

            am.service_id,
            sm.service_name,
            am.service_price,
            am.duration_minutes,
            am.package_id,
            am.is_package_service,

            sp.package_name

        FROM appointments a

        JOIN pet p
            ON a.pet_id = p.pet_id

        LEFT JOIN staff s
            ON a.staff_id = s.staff_id

        JOIN appointment_services am
            ON a.appointment_id = am.appointment_id

        JOIN service_menu sm
            ON am.service_id = sm.service_id

        LEFT JOIN service_package sp
            ON am.package_id = sp.package_id

        WHERE a.appointment_id = ?
        AND p.user_id = ?
    `;


    db.query(
        sql,
        [id, user_id],
        (err, results)=>{

            if(err){

                return res.status(500).json({
                    error:err.message
                });

            }


            if(results.length === 0){

                return res.status(404).json({
                    message:"Appointment not found"
                });

            }


            const appointment = {

                appointment_id: results[0].appointment_id,

                pet_name: results[0].pet_name,

                start_datetime: results[0].start_datetime,

                end_datetime: results[0].end_datetime,

                status: results[0].status,

                total_price: results[0].total_price,

                payment_status: results[0].payment_status,


                services: results.map(service => ({

                    service_id: service.service_id,

                    service_name: service.service_name,

                    price: service.service_price,

                    duration_minutes: service.duration_minutes,

                    package_id: service.package_id,

                    package_name: service.package_name,

                    is_package_service:
                        service.is_package_service === 1

                }))

            };


            res.json(appointment);


        }
    );

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

exports.updatePaymentStatus = (req, res) => {

    const { id } = req.params;
    const { payment_status } = req.body;

    if (!["Pending", "Paid"].includes(payment_status)) {
        return res.status(400).json({
            message: "Invalid payment status."
        });
    }

    db.query(
        `
        SELECT status
        FROM appointments
        WHERE appointment_id = ?
        `,
        [id],
        (err, results) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "Appointment not found."
                });
            }

            if (results[0].status !== "Completed") {
                return res.status(400).json({
                    message: "Payment can only be recorded after the appointment is completed."
                });
            }

            db.query(
                `
                UPDATE appointments
                SET payment_status = ?,
                    payment_date = NOW()
                WHERE appointment_id = ?
                `,
                [payment_status, id],
                (err) => {

                    if (err) {
                        return res.status(500).json({
                            error: err.message
                        });
                    }

                    res.json({
                        message: "Payment status updated successfully."
                    });

                }
            );

        }
    );

};

exports.cancelAppointment = (req, res) => {

    const { id } = req.params;
    const user_id = req.user.user_id;

    const getAppointmentSql = `
        SELECT a.start_datetime
        FROM appointments a
        JOIN pet p
            ON a.pet_id = p.pet_id
        WHERE a.appointment_id = ?
        AND p.user_id = ?
        AND a.status NOT IN ('Completed', 'Cancelled')
    `;

    db.query(getAppointmentSql, [id, user_id], (err, results) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Appointment not found or does not belong to you"
            });
        }

        const appointmentTime = new Date(results[0].start_datetime);

        const fiveHoursBefore = new Date(appointmentTime);
        fiveHoursBefore.setHours(
            fiveHoursBefore.getHours() - 5
        );

        if (new Date() > fiveHoursBefore) {
            return res.status(400).json({
                message: "Appointments can only be cancelled at least 5 hours before."
            });
        }

        const sql = `
            UPDATE appointments a
            JOIN pet p
                ON a.pet_id = p.pet_id
            SET a.status = 'Cancelled'
            WHERE a.appointment_id = ?
            AND p.user_id = ?
            AND a.status NOT IN ('Completed', 'Cancelled')
        `;

        db.query(sql, [id, user_id], (err, result) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Appointment not found or does not belong to you"
                });
            }

            res.json({
                message: "Appointment cancelled successfully"
            });

        });

    });

};

exports.adminCancelAppointment = (req, res) => {

    const { id } = req.params;

    const sql = `
        UPDATE appointments
        SET status = 'Cancelled'
        WHERE appointment_id = ?
        AND status NOT IN ('Completed','Cancelled')
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Appointment not found or already finished."
            });
        }

        res.json({
            message: "Appointment cancelled successfully."
        });

    });

};

exports.getCalendarAppointments = (req, res) => {

    const sql = `
        SELECT
            a.appointment_id AS id,
            a.start_datetime AS start,
            a.end_datetime AS end,
            a.status,

            p.pet_name,

            CONCAT(u.first_name,' ',u.last_name) AS owner,

            CONCAT(s.first_name,' ',s.last_name) AS groomer

        FROM appointments a

        JOIN pet p
            ON a.pet_id = p.pet_id

        JOIN user u
            ON p.user_id = u.user_id

        LEFT JOIN staff s
            ON a.staff_id = s.staff_id

        ORDER BY a.start_datetime ASC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        const events = results.map(event => ({

            id: event.id,

            title: `${event.pet_name} • ${event.groomer}`,

            start: event.start,

            end: event.end,

            status: event.status,

            owner: event.owner,

            groomer: event.groomer

        }));

        res.json(events);

    });

};