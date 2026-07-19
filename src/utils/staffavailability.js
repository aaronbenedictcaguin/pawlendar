const db = require("../config/db");

exports.findAvailableStaff = (startDatetime, endDatetime, requestedStaffId = null, excludedAppointmentId = null) => {
    return new Promise((resolve, reject) => {

        const appointmentDate = new Date(startDatetime);

        const days = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
        ];

        const dayOfWeek = days[appointmentDate.getDay()];

        const startTime = startDatetime.toLocaleTimeString("en-GB", {
            hour12: false
        });
        const endTime = endDatetime.toLocaleTimeString("en-GB", {
            hour12: false
        });

        const sql = `
            SELECT s.staff_id, 
                s.first_name,
                s.last_name,
                COUNT(DISTINCT a.appointment_id) AS dailyAppointments

            FROM staff s

            INNER JOIN staff_availability sa
                ON sa.staff_id = s.staff_id

            LEFT JOIN appointments a
                ON a.staff_id = s.staff_id
                AND DATE(a.start_datetime) = DATE(?)
                AND a.status <> 'Cancelled'

            WHERE s.active_flag = 1
                AND (? IS NULL OR s.staff_id = ?)
                AND sa.day_of_week = ?
                AND sa.start_time <= ?
                AND sa.end_time >= ?
                AND NOT EXISTS (
                    SELECT 1
                    FROM appointments ap
                    WHERE
                        ap.staff_id = s.staff_id
                        AND ap.status <> 'Cancelled'
                        AND (? IS NULL OR ap.appointment_id <> ?)
                        AND ( ap.start_datetime < ?
                            AND ap.end_datetime > ?)
                )

            GROUP BY s.staff_id

            ORDER BY dailyAppointments ASC, s.staff_id ASC

            LIMIT 1
        `;

        db.query(
            sql,
            [
                startDatetime,
                requestedStaffId,
                requestedStaffId,
                dayOfWeek,
                startTime,
                endTime,
                excludedAppointmentId,
                excludedAppointmentId,
                endDatetime,
                startDatetime
            ],
            (err, results) => {

                if (err) {
                    return reject(err);
                }

                if (results.length === 0) {
                    return resolve(null);
                }

                resolve(results[0]);

            }
        );

    });
};
