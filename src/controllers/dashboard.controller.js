const db = require("../config/db");

exports.getDashboardStats = (req, res) => {

    const statsSql = `
        SELECT

            COUNT(*) AS todayAppointments,

            SUM(status = 'Checked In') AS checkedInPets,

            SUM(status = 'In Progress') AS groomingPets,

            SUM(status = 'Ready for Pickup') AS readyForPickup,

            SUM(status = 'Completed') AS completedAppointments,

            SUM(status = 'Cancelled') AS cancelledAppointments,

            SUM(
                CASE
                    WHEN payment_status = 'Paid'
                    THEN total_price
                    ELSE 0
                END
            ) AS todayRevenue

        FROM appointments

        WHERE DATE(start_datetime) = CURDATE()
    `;

    const upcomingSql = `
        SELECT

            a.appointment_id,

            a.start_datetime,

            p.pet_name,

            u.first_name,

            u.last_name,

            s.first_name AS staff_first_name,

            s.last_name AS staff_last_name,

            a.status

        FROM appointments a

        JOIN pet p
            ON a.pet_id = p.pet_id

        JOIN user u
            ON p.user_id = u.user_id

        LEFT JOIN staff s
            ON a.staff_id = s.staff_id

        WHERE
            DATE(a.start_datetime) = CURDATE()
            AND a.status <> 'Cancelled'

        ORDER BY a.start_datetime

        LIMIT 5
    `;

    const activitySql = `
        SELECT

            a.appointment_id,

            p.pet_name,

            a.status,

            a.updated_at

        FROM appointments a

        JOIN pet p
            ON a.pet_id = p.pet_id

        ORDER BY a.updated_at DESC

        LIMIT 5
    `;

    db.query(statsSql, (err, statsResult) => {

        if(err){
            return res.status(500).json({
                error: err.message
            });
        }

        db.query(upcomingSql, (err, upcomingResult)=>{

            if(err){
                return res.status(500).json({
                    error: err.message
                });
            }

            db.query(activitySql,(err,activityResult)=>{

                if(err){
                    return res.status(500).json({
                        error: err.message
                    });
                }

                res.json({

                    stats:{

                        todayAppointments:
                        statsResult[0].todayAppointments,

                        checkedInPets:
                        statsResult[0].checkedInPets || 0,

                        groomingPets:
                        statsResult[0].groomingPets || 0,

                        readyForPickup:
                        statsResult[0].readyForPickup || 0,

                        completedAppointments:
                        statsResult[0].completedAppointments || 0,

                        cancelledAppointments:
                        statsResult[0].cancelledAppointments || 0,

                        todayRevenue:
                        statsResult[0].todayRevenue || 0

                    },

                    upcoming:
                    upcomingResult,

                    activity:
                    activityResult

                });

            });

        });

    });

};