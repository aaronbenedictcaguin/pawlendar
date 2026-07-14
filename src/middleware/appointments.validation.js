exports.validateAppointment = (req, res, next) => {
    const {pet_id, start_datetime} = req.body;

    if (!pet_id || !start_datetime) {
        return res.status(400).json({message: "pet_id and start_datetime are required"});
    }

    const appointmentDate = new Date(start_datetime);   //updated because db updated

    if (Number.isNaN(appointmentDate.getTime())) {
        return res.status(400).json({message: "start_datetime must be a valid date"});
    }

    if (appointmentDate < new Date()) {
        return res.status(400).json({message: "Appointment date must be in the future"});
    }

    next();
};
