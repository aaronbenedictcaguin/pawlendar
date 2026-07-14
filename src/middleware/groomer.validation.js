module.exports.validateGroomer = (req, res, next) => {
    const {
        first_name,
        last_name,
        phone_number,
        specialization,
        hire_date,
    } = req.body;

    if (
        !first_name || !last_name
        || !phone_number
        || !specialization
        || !hire_date
    ) {
        return res.status(400).json({
            message: "Missing required groomer information"
        });
    }
    next();
};