exports.validateAppointment = (req, res, next) => {

    const { pet_id, start_datetime, service_ids } = req.body;

    // Required fields
    if (!pet_id || !start_datetime || !service_ids) {
        return res.status(400).json({
            message: "pet_id, start_datetime, and at least one service are required"
        });
    }

    // pet_id must be a positive integer
    if (!Number.isInteger(Number(pet_id)) || Number(pet_id) <= 0) {
        return res.status(400).json({
            message: "Invalid pet_id"
        });
    }

    // service_ids must be a non-empty array
    if (!Array.isArray(service_ids) || service_ids.length === 0) {
        return res.status(400).json({
            message: "At least one service must be selected"
        });
    }

    // Every service ID must be a positive integer
    if (service_ids.some(id => !Number.isInteger(Number(id)) || Number(id) <= 0)) {
        return res.status(400).json({
            message: "All service IDs must be positive integers"
        });
    }

    // Date must be valid
    const appointmentDate = new Date(start_datetime);

    if (isNaN(appointmentDate.getTime())) {
        return res.status(400).json({
            message: "Invalid appointment date"
        });
    }

    // Date must be in the future
    if (appointmentDate <= new Date()) {
        return res.status(400).json({
            message: "Appointment date must be in the future"
        });
    }

    next();
};