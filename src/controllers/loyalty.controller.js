const db = require("../config/db");

const COMPLETED_STATUSES = ["Completed", "Complete", "Finished", "Done"];

function getMembershipSummary(completedAppointments) {
    if (completedAppointments >= 6) {
        return {
            loyalty_level: "Gold",
            discount_percent: 15,
            next_level: null,
            appointments_needed_for_next_level: 0,
            milestone_message: "You have unlocked Gold rewards and the best grooming discount."
        };
    }

    if (completedAppointments >= 3) {
        return {
            loyalty_level: "Silver",
            discount_percent: 10,
            next_level: "Gold",
            appointments_needed_for_next_level: 6 - completedAppointments,
            milestone_message: "A couple more completed visits will unlock Gold rewards."
        };
    }

    return {
        loyalty_level: "Bronze",
        discount_percent: 5,
        next_level: "Silver",
        appointments_needed_for_next_level: 3 - completedAppointments,
        milestone_message: "Keep booking grooming visits to unlock bigger discounts."
    };
}

function buildSummary(owner, completedAppointments) {
    const membership = getMembershipSummary(completedAppointments);

    return {
        owner_id: owner.owner_id,
        owner_name: `${owner.first_name || ""} ${owner.last_name || ""}`.trim(),
        email: owner.email,
        completed_appointments: completedAppointments,
        loyalty_level: membership.loyalty_level,
        discount_percent: membership.discount_percent,
        next_level: membership.next_level,
        appointments_needed_for_next_level: membership.appointments_needed_for_next_level,
        milestone_message: membership.milestone_message
    };
}

exports.getMyLoyalty = (req, res) => {
    const owner_id = req.user.owner_id;

    const sql = `
        SELECT
            o.owner_id,
            o.first_name,
            o.last_name,
            o.email,
            COUNT(DISTINCT a.appointment_id) AS completed_appointments
        FROM owner o
        LEFT JOIN pet p ON p.owner_id = o.owner_id AND p.active_flag = TRUE
        LEFT JOIN appointments a ON a.pet_id = p.pet_id
            AND a.status IN (${COMPLETED_STATUSES.map(() => "?").join(", ")})
        WHERE o.owner_id = ?
        GROUP BY o.owner_id, o.first_name, o.last_name, o.email
    `;

    db.query(sql, [...COMPLETED_STATUSES, owner_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Owner profile not found" });
        }

        const owner = results[0];
        const completedAppointments = Number(owner.completed_appointments || 0);

        res.json(buildSummary(owner, completedAppointments));
    });
};

exports.getAdminLoyalty = (req, res) => {
    const sql = `
        SELECT
            o.owner_id,
            o.first_name,
            o.last_name,
            o.email,
            COUNT(DISTINCT a.appointment_id) AS completed_appointments
        FROM owner o
        LEFT JOIN pet p ON p.owner_id = o.owner_id AND p.active_flag = TRUE
        LEFT JOIN appointments a ON a.pet_id = p.pet_id
            AND a.status IN (${COMPLETED_STATUSES.map(() => "?").join(", ")})
        GROUP BY o.owner_id, o.first_name, o.last_name, o.email
        ORDER BY completed_appointments DESC, o.last_name ASC
    `;

    db.query(sql, COMPLETED_STATUSES, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const summary = results.map((owner) => {
            const completedAppointments = Number(owner.completed_appointments || 0);
            return buildSummary(owner, completedAppointments);
        });

        res.json({ data: summary });
    });
};
