const db = require("../config/db");

exports.getPackages = (req, res) => {

    const packageSql = `
        SELECT
            package_id,
            package_name,
            description,
            package_price,
            package_duration_minutes
        FROM service_package
        WHERE active_flag = TRUE
        ORDER BY package_name
    `;

    db.query(packageSql, (err, packages) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (packages.length === 0) {
            return res.json([]);
        }

        const serviceSql = `
            SELECT
                ps.package_id,
                sm.service_id,
                sm.service_name,
                sm.category,
                sm.price,
                sm.duration_minutes
            FROM package_services ps
            JOIN service_menu sm
                ON ps.service_id = sm.service_id
            WHERE sm.active_flag = TRUE
            ORDER BY sm.category, sm.service_name
        `;

        db.query(serviceSql, (err, services) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            packages.forEach(pkg => {

                pkg.services = services.filter(service =>
                    service.package_id === pkg.package_id
                );

            });

            res.json(packages);

        });

    });

};

exports.getPackage = (req, res) => {

    const packageId = req.params.id;

    const sql = `
        SELECT
            package_id,
            package_name,
            description,
            package_price,
            package_duration_minutes
        FROM service_package
        WHERE package_id = ?
        AND active_flag = TRUE
    `;

    db.query(sql, [packageId], (err, results) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Package not found"
            });
        }

        const pkg = results[0];

        const serviceSql = `
            SELECT
                sm.service_id,
                sm.service_name,
                sm.category,
                sm.price,
                sm.duration_minutes
            FROM package_services ps
            JOIN service_menu sm
                ON ps.service_id = sm.service_id
            WHERE ps.package_id = ?
            ORDER BY sm.category, sm.service_name
        `;

        db.query(serviceSql, [packageId], (err, services) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            pkg.services = services;

            res.json(pkg);

        });

    });

};

exports.createPackage = (req, res) => {

    const {
        package_name,
        description,
        package_price,
        service_ids
    } = req.body;

    db.beginTransaction((err) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        const serviceSql = `
            SELECT
                service_id,
                duration_minutes
            FROM service_menu
            WHERE service_id IN (?)
            AND active_flag = TRUE
        `;

        db.query(serviceSql, [service_ids], (err, services) => {

            if (err) {

                return db.rollback(() => {

                    res.status(500).json({
                        error: err.message
                    });

                });

            }

            if (services.length !== service_ids.length) {

                return db.rollback(() => {

                    res.status(400).json({
                        message: "One or more selected services do not exist or are inactive."
                    });

                });

            }

            let totalDuration = 0;

            services.forEach(service => {

                totalDuration += service.duration_minutes;

            });

            const insertPackageSql = `
                INSERT INTO service_package
                (
                    package_name,
                    description,
                    package_price,
                    package_duration_minutes
                )
                VALUES (?, ?, ?, ?)
            `;

            db.query(
                insertPackageSql,
                [
                    package_name,
                    description,
                    package_price,
                    totalDuration
                ],
                (err, result) => {

                    if (err) {

                        return db.rollback(() => {

                            res.status(500).json({
                                error: err.message
                            });

                        });

                    }

                    const packageId = result.insertId;

                    let completed = 0;

                    const insertServiceSql = `
                        INSERT INTO package_services
                        (
                            package_id,
                            service_id
                        )
                        VALUES (?, ?)
                    `;

                    service_ids.forEach(serviceId => {

                        db.query(
                            insertServiceSql,
                            [
                                packageId,
                                serviceId
                            ],
                            (err) => {

                                if (err) {

                                    return db.rollback(() => {

                                        res.status(500).json({
                                            error: err.message
                                        });

                                    });

                                }

                                completed++;

                                if (completed === service_ids.length) {

                                    db.commit((err) => {

                                        if (err) {

                                            return db.rollback(() => {

                                                res.status(500).json({
                                                    error: err.message
                                                });

                                            });

                                        }

                                        res.status(201).json({
                                            message: "Package created successfully",
                                            package_id: packageId
                                        });

                                    });

                                }

                            }
                        );

                    });

                }
            );

        });

    });

};

exports.updatePackage = (req, res) => {

    const packageId = req.params.id;

    const {
        package_name,
        description,
        package_price,
        service_ids
    } = req.body;

    db.beginTransaction((err) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        // Check if package exists
        const checkPackageSql = `
            SELECT package_id
            FROM service_package
            WHERE package_id = ?
            AND active_flag = TRUE
        `;

        db.query(checkPackageSql, [packageId], (err, packageResult) => {

            if (err) {
                return db.rollback(() => {
                    res.status(500).json({
                        error: err.message
                    });
                });
            }

            if (packageResult.length === 0) {
                return db.rollback(() => {
                    res.status(404).json({
                        message: "Package not found."
                    });
                });
            }

            // Retrieve selected services
            const serviceSql = `
                SELECT
                    service_id,
                    duration_minutes
                FROM service_menu
                WHERE service_id IN (?)
                AND active_flag = TRUE
            `;

            db.query(serviceSql, [service_ids], (err, services) => {

                if (err) {
                    return db.rollback(() => {
                        res.status(500).json({
                            error: err.message
                        });
                    });
                }

                if (services.length !== service_ids.length) {
                    return db.rollback(() => {
                        res.status(400).json({
                            message: "One or more selected services do not exist or are inactive."
                        });
                    });
                }

                let totalDuration = 0;

                services.forEach(service => {

                    totalDuration += service.duration_minutes;

                });

                // Update package details
                const updatePackageSql = `
                    UPDATE service_package
                    SET
                        package_name = ?,
                        description = ?,
                        package_price = ?,
                        package_duration_minutes = ?,
                        updated_at = NOW()
                    WHERE package_id = ?
                `;

                db.query(
                    updatePackageSql,
                    [
                        package_name,
                        description,
                        package_price,
                        totalDuration,
                        packageId
                    ],
                    (err) => {

                        if (err) {
                            return db.rollback(() => {
                                res.status(500).json({
                                    error: err.message
                                });
                            });
                        }

                        // Remove old services
                        const deleteSql = `
                            DELETE FROM package_services
                            WHERE package_id = ?
                        `;

                        db.query(deleteSql, [packageId], (err) => {

                            if (err) {
                                return db.rollback(() => {
                                    res.status(500).json({
                                        error: err.message
                                    });
                                });
                            }

                            let completed = 0;

                            const insertSql = `
                                INSERT INTO package_services
                                (
                                    package_id,
                                    service_id
                                )
                                VALUES (?, ?)
                            `;

                            service_ids.forEach(serviceId => {

                                db.query(
                                    insertSql,
                                    [
                                        packageId,
                                        serviceId
                                    ],
                                    (err) => {

                                        if (err) {
                                            return db.rollback(() => {
                                                res.status(500).json({
                                                    error: err.message
                                                });
                                            });
                                        }

                                        completed++;

                                        if (completed === service_ids.length) {

                                            db.commit((err) => {

                                                if (err) {
                                                    return db.rollback(() => {
                                                        res.status(500).json({
                                                            error: err.message
                                                        });
                                                    });
                                                }

                                                res.json({
                                                    message: "Package updated successfully."
                                                });

                                            });

                                        }

                                    }
                                );

                            });

                        });

                    }
                );

            });

        });

    });

};

exports.deletePackage = (req, res) => {

    const { id } = req.params;

    const sql = `
        UPDATE service_package
        SET
            active_flag = FALSE,
            updated_at = NOW()
        WHERE package_id = ?
        AND active_flag = TRUE
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Package not found"
            });
        }

        res.json({
            message: "Package deactivated successfully"
        });

    });

};

exports.getAllPackagesAdmin = (req, res) => {

    const sql = `
        SELECT
            package_id,
            package_name,
            description,
            package_price,
            package_duration_minutes,
            active_flag,
            created_at,
            updated_at
        FROM service_package
        ORDER BY active_flag ASC
    `;


    db.query(sql, (err, results) => {

        if(err){
            return res.status(500).json({
                error: err.message
            });
        }


        res.json(results);

    });

};

exports.restorePackage = (req,res)=>{

    const packageId = req.params.id;


    const sql = `
        UPDATE service_package
        SET
            active_flag = TRUE,
            updated_at = NOW()
        WHERE package_id = ?
    `;


    db.query(sql,[packageId],(err,result)=>{


        if(err){

            return res.status(500).json({
                error:err.message
            });

        }


        if(result.affectedRows === 0){

            return res.status(404).json({
                message:"Package not found"
            });

        }


        res.json({
            message:"Package restored successfully"
        });


    });

};