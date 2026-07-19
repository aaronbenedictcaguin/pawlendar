module.exports.validateService = (req, res, next) => {

    const {
        service_name,
        category,
        description,
        price,
        duration_minutes
    } = req.body;

    if (
    !service_name ||
    service_name.trim() === "" ||
    !category ||
    category.trim() === "" ||
    !description ||
    description.trim() === "" ||
    price == null ||
    duration_minutes == null
    ) {
        return res.status(400).json({
            message: "Missing required service information"
        });
    }

    if (isNaN(price)) {
        return res.status(400).json({
            message: "Price must be a number."
        });
    }

    if (isNaN(duration_minutes)) {
        return res.status(400).json({
            message: "Duration must be a number."
        });
    }

    if (price < 0) {
        return res.status(400).json({
            message: "Price cannot be negative"
        });
    }

    if (duration_minutes <= 0) {
        return res.status(400).json({
            message: "Duration must be greater than zero"
        });
    }

    next();

};