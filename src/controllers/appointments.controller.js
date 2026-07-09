const db = require("../config/db");

exports.bookAppointment = (req, res) => {
    const user_id = req.user.user_id;
    const {pet_id, staff_id, start_datetime, notes,  services} = req.body;
    if (!services || services.length === 0) {
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

    db.query(checkPetSql, [pet_id, user_id], (err, pets) => {

        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (pets.length === 0) {
            return res.status(403).json({
                message: "You do not own this pet."
            });
        }

        const checkSql = `
            SELECT *
            FROM appointments
            WHERE staff_id = ? AND start_datetime = ? AND status != 'Cancelled'
        `;

        const durationSql = `
            SELECT 
                SUM(duration_minutes) AS total_duration,
                SUM(price) AS total_price
            FROM service_menu
            WHERE service_id IN (?)
        `;

        db.query(durationSql, [services], (err, durationResult) => {

            if(err){
                return res.status(500).json({
                    error: err.message
                });
            }

            const totalDuration = durationResult[0].total_duration;
            const total_price = durationResult[0].total_price;

            const end_datetime = new Date(start_datetime);
            end_datetime.setMinutes(
                end_datetime.getMinutes() + totalDuration
            );

            db.query(checkSql, [staff_id, start_datetime], (err, results) => {
                if (err) {return res.status(500).json({error: err.message});}

                if (results.length > 0) {return res.status(400).json({message: "Selected time slot is unavailable"});}

                // changed APPOINTMENTS to appointments so that it's not confusing, changed the name sd sa database
                const insertSql = `
                    INSERT INTO appointments(
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
                    [pet_id, staff_id, start_datetime, end_datetime, total_price, notes],
                    (err, result) => {

                        if (err) {
                            return res.status(500).json({error: err.message});
                        }

                        const appointment_id = result.insertId;

                        const serviceSql = `
                            INSERT INTO appointment_services
                            (
                                appointment_id,
                                service_id,
                                service_price,
                                duration_minutes
                            )
                            SELECT ?, service_id, price, duration_minutes
                            FROM service_menu
                            WHERE service_id IN (?)
                        `;

                        db.query(
                            serviceSql,
                            [appointment_id, services],
                            (err) => {

                                if (err) {
                                    return res.status(500).json({
                                        error: err.message
                                    });
                                }

                                res.status(201).json({
                                    message: "Appointment booked successfully",
                                    appointment_id
                                });

                            }
                        );
                    }
                );
            });
        });
    });
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