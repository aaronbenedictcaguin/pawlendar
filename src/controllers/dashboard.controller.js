const db = require("../config/db");

exports.getDashboardStats = (req, res) => {

    const sql = `
        SELECT

        COUNT(*) AS todayAppointments,

        SUM(status = 'Checked In') AS checkedInPets,

        SUM(status = 'In Progress') AS groomingPets,

        SUM(status = 'Ready for Pickup') AS readyForPickup,

        SUM(status = 'Completed') AS completedAppointments


        FROM appointments

        WHERE DATE(start_datetime) = CURDATE();
    `;


    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }


        res.json({
            todayAppointments: results[0].todayAppointments,
            checkedInPets: results[0].checkedInPets || 0,
            groomingPets: results[0].groomingPets || 0,
            readyForPickup: results[0].readyForPickup || 0,
            completedAppointments: results[0].completedAppointments || 0
        });

    });

};