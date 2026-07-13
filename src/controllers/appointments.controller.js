const db = require("../config/db");
const { calculateAppointmentEnd } = require("../utils/appointmentHelper");
const { findAvailableStaff } = require("../utils/staffAvailability");

exports.bookAppointment = async (req, res) => {

    try {
        const user_id = req.user.user_id;
        const {pet_id, start_datetime, notes, service_ids} = req.body;

        if (!service_ids || service_ids.length === 0) {
            return res.status(400).json({
                message:"At least one service is required"
            });
        }

        // changed APPOINTMENTS to appointments so that it's not confusing, changed the name sd sa database
        const checkPetSql = `
            SELECT *
            FROM pet
            WHERE pet_id = ?
            AND user_id = ?
            AND active_flag = TRUE
        `;

        const pets = await new Promise((resolve, reject) => {

            db.query(checkPetSql, [pet_id, user_id], (err, results) => {

                if (err) {
                    return reject(err);
                }

                resolve(results);

            });

        });

        if (pets.length === 0) {

            return res.status(403).json({
                message: "You do not own this pet."
            });

        }

        const appointmentInfo =
            await calculateAppointmentEnd(
                service_ids,
                start_datetime
            );

        const endDatetime =
            appointmentInfo.endDatetime;

        const total_price =
            appointmentInfo.totalPrice;

        const staff =
            await findAvailableStaff(
                new Date(start_datetime),
                endDatetime
            );

        if (!staff) {
            return res.status(409).json({
                message:
                    "No staff available."
            });
        }

        const insertSql = `
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
            insertSql,
            [
                pet_id,
                staff.staff_id,
                start_datetime,
                endDatetime,
                total_price,
                notes
            ],
            (err, result) => {

                if (err) {
                    return res.status(500).json({
                        error: err.message
                    });
                }

                const appointment_id = result.insertId;

                const values = [];

                service_ids.forEach(service => {

                    values.push([
                        appointment_id,
                        service
                    ]);

                });

                const serviceSql = `
                    INSERT INTO appointment_services
                    (
                        appointment_id,
                        service_id
                    )
                    VALUES ?
                `;

                db.query(
                    serviceSql,
                    [values],
                    (serviceErr) => {

                        if (serviceErr) {
                            return res.status(500).json({
                                error: serviceErr.message
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

                    }
                );
            }
        );
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
            a.status,
            a.start_datetime,
            a.end_datetime,
            p.pet_name,
            u.first_name,
            u.last_name
        FROM appointments a

        JOIN pet p
        ON a.pet_id = p.pet_id

        JOIN user u
        ON p.user_id = u.user_id
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

    // changed APPOINTMENTS to appointments so that it's not confusing, changed the name sd sa database
    const sql = `
        UPDATE appointments
        SET status = ?
        WHERE appointment_id = ?
    `;

    db.query(sql, [status, id], (err, result) => {
            if (err) {return res.status(500).json({error: err.message});}

            res.json({message: "Appointment updated successfully", data: result});
        }
    );
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