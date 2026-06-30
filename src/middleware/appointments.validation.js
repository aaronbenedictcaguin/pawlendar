exports.validateAppointment = (req, res, next) => {
    const {pet_id, staff_id, start_datetime} = req.body;    //updated because db updated

    if (!pet_id || !staff_id || !start_datetime) {  //updated because db updated
        return res.status(400).json({message: "pet_id, staff_id and appointment_datetime are required"});
    }

    const appointmentDate = new Date(start_datetime);   //updated because db updated

    if (appointmentDate < new Date()) {
        return res.status(400).json({message: "Appointment date must be in the future"});
    }

    next();
};