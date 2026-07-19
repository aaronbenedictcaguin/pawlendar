module.exports.validatePackage = (req, res, next) => {

    const {
        package_name,
        description,
        package_price,
        service_ids
    } = req.body;

    if (!package_name ||
    package_name.trim() === "" ||
    service_ids == null) {
        return res.status(400).json({
            message: "Missing required package information."
        });
    }

    if (!Array.isArray(service_ids)) {
        return res.status(400).json({
            message: "service_ids must be an array."
        });
    }

    if (service_ids.length === 0) {
        return res.status(400).json({
            message: "A package must contain at least one service."
        });
    }

    if(package_price == null){

        return res.status(400).json({
            message:"Package price is required."
        });

    }

    if(
        String(package_price).trim() === ""
    ){
        return res.status(400).json({
            message:"Package price cannot be empty."
        });
    }

    if(isNaN(package_price)){

        return res.status(400).json({
            message:"Package price must be a number."
        });

    }


    if(package_price < 0){

        return res.status(400).json({
            message:"Package price cannot be negative."
        });

    }

    if (
        description != null &&
        typeof description !== "string"
    ){
        return res.status(400).json({
            message:"Description must be text."
        });
    }

    // Check duplicates
    const uniqueServices = [...new Set(service_ids)];

    if (uniqueServices.length !== service_ids.length) {
        return res.status(400).json({
            message: "Duplicate services are not allowed in a package."
        });
    }

    // Validate IDs
    for(const id of service_ids){

        if(
            Number.isNaN(Number(id)) ||
            Number(id) <= 0 ||
            !Number.isInteger(Number(id))
        ){

            return res.status(400).json({
                message:"Service IDs must be positive integers."
            });

        }

    }

    next();

};