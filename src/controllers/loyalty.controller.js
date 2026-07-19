const db = require("../config/db");

function getMembershipSummary(completedAppointments) {

    if (completedAppointments >= 6) {

        return {
            loyalty_level: "Gold",
            discount_percent: 15,
            next_level: null,
            appointments_needed_for_next_level: 0,
            progress_to_next_level: "6/6",
            milestone_message:
                "You have unlocked Gold membership."
        };

    }

    if (completedAppointments >= 3) {

        return {
            loyalty_level: "Silver",
            discount_percent: 10,
            next_level: "Gold",
            appointments_needed_for_next_level: 6 - completedAppointments,
            progress_to_next_level: `${completedAppointments}/6`,
            milestone_message:
                `${6 - completedAppointments} more completed visits to reach Gold.`
        };

    }

    return {

        loyalty_level: "Bronze",

        discount_percent: 5,

        next_level: "Silver",

        appointments_needed_for_next_level: 3 - completedAppointments,

        progress_to_next_level: `${completedAppointments}/3`,

        milestone_message:
            `${3 - completedAppointments} more completed visits to reach Silver.`

    };

}

function buildSummary(user, completedAppointments) {

    const membership =
        getMembershipSummary(completedAppointments);

    return {

        user_id: user.user_id,

        user_name:
            `${user.first_name} ${user.last_name}`,

        email: user.email,

        completed_appointments: completedAppointments,

        loyalty_level:
            membership.loyalty_level,

        discount_percent:
            membership.discount_percent,

        next_level:
            membership.next_level,

        appointments_needed_for_next_level:
            membership.appointments_needed_for_next_level,

        progress_to_next_level:
            membership.progress_to_next_level,

        milestone_message:
            membership.milestone_message

    };

}

exports.getMyLoyalty = (req, res) => {

    const user_id = req.user.user_id;

    const sql = `

        SELECT

            u.user_id,

            u.first_name,

            u.last_name,

            u.email,

            COUNT(DISTINCT a.appointment_id)
            AS completed_appointments

        FROM user u

        LEFT JOIN pet p

            ON p.user_id = u.user_id

            AND p.active_flag = TRUE

        LEFT JOIN appointments a

            ON a.pet_id = p.pet_id

            AND a.status = 'Completed'

            AND a.payment_status = 'Paid'

        WHERE u.user_id = ?

        GROUP BY

            u.user_id,

            u.first_name,

            u.last_name,

            u.email

    `;

    db.query(sql, [user_id], (err, results) => {

        if (err) {

            return res.status(500).json({

                error: err.message

            });

        }

        if (results.length === 0) {

            return res.status(404).json({

                message: "User not found."

            });

        }

        const user = results[0];

        res.json(

            buildSummary(

                user,

                Number(user.completed_appointments)

            )

        );

    });

};

exports.getAdminLoyalty = (req, res) => {

    const sql = `

        SELECT

            u.user_id,

            u.first_name,

            u.last_name,

            u.email,

            COUNT(DISTINCT a.appointment_id)
            AS completed_appointments

        FROM user u

        LEFT JOIN pet p

            ON p.user_id = u.user_id

            AND p.active_flag = TRUE

        LEFT JOIN appointments a

            ON a.pet_id = p.pet_id

            AND a.status = 'Completed'

            AND a.payment_status = 'Paid'

        GROUP BY

            u.user_id,

            u.first_name,

            u.last_name,

            u.email

        ORDER BY

            completed_appointments DESC,

            u.last_name ASC

    `;

    db.query(sql, (err, results) => {

        if (err) {

            return res.status(500).json({

                error: err.message

            });

        }

        res.json({

            data: results.map(user =>

                buildSummary(

                    user,

                    Number(user.completed_appointments)

                )

            )

        });

    });

};