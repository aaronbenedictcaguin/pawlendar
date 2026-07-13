const db = require("../config/db");

exports.calculateAppointmentEnd = (serviceIds, startDatetime) => {
    return new Promise((resolve, reject) => {

        if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
            return reject(new Error("At least one service must be selected."));
        }

        const sql = `
            SELECT SUM(duration_minutes) AS totalDuration, SUM(price) AS totalPrice
            FROM service_menu
            WHERE service_id IN (?)
            AND active_flag = 1
        `;

        db.query(sql, [serviceIds], (err, results) => {

            if (err) return reject(err);

            const totalDuration = results[0].totalDuration;
            const totalPrice = results[0].totalPrice;

            if (!totalDuration || totalPrice === null) {
                return reject(new Error("Invalid service selection."));
            }

            const start = new Date(startDatetime);

            const endDatetime = new Date(
                start.getTime() + totalDuration * 60000
            );

            resolve({
                totalDuration,
                totalPrice,
                endDatetime
            });

        });

    });
};