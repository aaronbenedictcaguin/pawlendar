const db = require("../config/db");

const query = (sql, params = []) => db.promise().query(sql, params).then(([rows]) => rows);

async function getAvailableGroomer(startDatetime, endDatetime, requestedStaffId, excludedAppointmentId = null) {
    const params = [endDatetime, startDatetime, excludedAppointmentId, excludedAppointmentId];
    let requestedFilter = "";

    if (requestedStaffId) {
        requestedFilter = "AND u.user_id = ?";
        params.push(requestedStaffId);
    }

    params.push(startDatetime);

    const rows = await query(`
        SELECT
            u.user_id AS staff_id,
            u.first_name,
            u.last_name,
            COUNT(a.appointment_id) AS scheduled_count
        FROM user u
        LEFT JOIN appointments a
          ON a.staff_id = u.user_id
         AND a.status != 'Cancelled'
         AND a.start_datetime < ?
         AND a.end_datetime > ?
         AND (? IS NULL OR a.appointment_id != ?)
        WHERE u.role IN ('Staff', 'Groomer')
          AND u.active_flag = TRUE
          ${requestedFilter}
        GROUP BY u.user_id, u.first_name, u.last_name
        HAVING scheduled_count = 0
        ORDER BY (
            SELECT COUNT(*)
            FROM appointments workload
            WHERE workload.staff_id = u.user_id
              AND workload.status != 'Cancelled'
              AND DATE(workload.start_datetime) = DATE(?)
        ) ASC, u.user_id ASC
        LIMIT 1
    `, params);

    return rows[0] || null;
}

exports.bookAppointment = async (req, res) => {
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

    try {
        const pets = await query(checkPetSql, [pet_id, user_id]);
        if (pets.length === 0) {
            return res.status(403).json({
                message: "You do not own this pet."
            });
        }

        const durationSql = `
            SELECT 
                SUM(duration_minutes) AS total_duration,
                SUM(price) AS total_price,
                COUNT(*) AS service_count
            FROM service_menu
            WHERE service_id IN (?)
              AND active_flag = TRUE
        `;

        const durationResult = await query(durationSql, [services]);
            const totalDuration = durationResult[0].total_duration;
            const total_price = durationResult[0].total_price;

            if (!totalDuration || Number(durationResult[0].service_count) !== services.length) {
                return res.status(400).json({message: "Every selected service must exist and be active"});
            }

            const end_datetime = new Date(start_datetime);
            end_datetime.setMinutes(
                end_datetime.getMinutes() + totalDuration
            );

            const groomer = await getAvailableGroomer(start_datetime, end_datetime, staff_id);
            if (!groomer) {
                return res.status(409).json({
                    message: staff_id
                        ? "Selected groomer is inactive or unavailable for this time slot"
                        : "No active groomer is available for this time slot"
                });
            }

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

                const result = await query(insertSql,
                    [pet_id, groomer.staff_id, start_datetime, end_datetime, total_price, notes]);
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
                              AND active_flag = TRUE
                        `;

                await query(serviceSql, [appointment_id, services]);
                res.status(201).json({
                    message: "Appointment booked successfully",
                    appointment_id,
                    staff_id: groomer.staff_id,
                    assignment: staff_id ? "manual" : "automatic"
                });
    } catch (err) {
        return res.status(500).json({error: err.message});
    }
};

exports.checkAvailability = async (req, res) => {
    const {staff_id, start_datetime, end_datetime} = req.query;
    if (!start_datetime || !end_datetime) {
        return res.status(400).json({message: "start_datetime and end_datetime are required"});
    }

    try {
        const groomer = await getAvailableGroomer(start_datetime, end_datetime, staff_id);
        res.json({available: Boolean(groomer), groomer});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

exports.reassignAppointment = async (req, res) => {
    const {id} = req.params;
    const {staff_id} = req.body;

    try {
        const appointments = await query(`
            SELECT appointment_id, start_datetime, end_datetime
            FROM appointments
            WHERE appointment_id = ? AND status NOT IN ('Completed', 'Cancelled')
        `, [id]);

        if (!appointments.length) {
            return res.status(404).json({message: "Reassignable appointment not found"});
        }

        const appointment = appointments[0];
        const groomer = await getAvailableGroomer(
            appointment.start_datetime,
            appointment.end_datetime,
            staff_id,
            appointment.appointment_id
        );

        if (!groomer) {
            return res.status(409).json({
                message: staff_id
                    ? "Selected groomer is inactive or unavailable for this appointment"
                    : "No active groomer is available for this appointment"
            });
        }

        await query("UPDATE appointments SET staff_id = ? WHERE appointment_id = ?", [groomer.staff_id, id]);
        res.json({
            message: "Appointment reassigned successfully",
            appointment_id: Number(id),
            staff_id: groomer.staff_id,
            assignment: staff_id ? "manual" : "automatic"
        });
    } catch (err) {
        res.status(500).json({error: err.message});
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
