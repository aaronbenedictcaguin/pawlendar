const db = require("../config/db");

exports.calculateAppointmentEnd = (serviceIds, packageIds, startDatetime) => {

    return new Promise((resolve, reject) => {

        serviceIds = Array.isArray(serviceIds) ? serviceIds : [];
        packageIds = Array.isArray(packageIds) ? packageIds : [];

        if (serviceIds.length === 0 && packageIds.length === 0) {
            return reject(new Error("At least one service or package must be selected."));
        }

        const selectedItems = [];

        // ------------------------
        // 1. Individual Services
        // ------------------------

        const getServices = new Promise((resolveServices, rejectServices) => {

            if (serviceIds.length === 0) {
                return resolveServices([]);
            }

            const sql = `
                SELECT
                    service_id,
                    price,
                    duration_minutes
                FROM service_menu
                WHERE service_id IN (?)
                AND active_flag = 1
            `;

            db.query(sql, [serviceIds], (err, results) => {

                if (err) return rejectServices(err);

                resolveServices(results);

            });

        });

        // ------------------------
        // 2. Packages
        // ------------------------

        const getPackages = new Promise((resolvePackages, rejectPackages) => {

            if (packageIds.length === 0) {
                return resolvePackages([]);
            }

            const sql = `
                SELECT
                    package_id,
                    package_price,
                    package_duration_minutes
                FROM service_package
                WHERE package_id IN (?)
                AND active_flag = 1
            `;

            db.query(sql, [packageIds], (err, results) => {

                if (err) return rejectPackages(err);

                resolvePackages(results);

            });

        });

        Promise.all([getServices, getPackages])

            .then(([services, packages]) => {

                let totalDuration = 0;
                let totalPrice = 0;

                // Save selected services
                services.forEach(service => {

                    totalDuration += service.duration_minutes;
                    totalPrice += Number(service.price);

                    selectedItems.push({

                        service_id: service.service_id,
                        package_id: null,
                        is_package_service: 0,
                        service_price: Number(service.price),
                        duration_minutes: service.duration_minutes

                    });

                });

                // Save selected packages
                packages.forEach(pkg => {

                    totalDuration += pkg.package_duration_minutes;
                    totalPrice += Number(pkg.package_price);

                    selectedItems.push({

                        service_id: null,
                        package_id: pkg.package_id,
                        is_package_service: 1,
                        service_price: Number(pkg.package_price),
                        duration_minutes: pkg.package_duration_minutes

                    });

                });

                if (selectedItems.length === 0) {
                    return reject(new Error("Invalid service/package selection."));
                }

                const start = new Date(startDatetime);

                if (isNaN(start.getTime())) {
                    return reject(new Error("Invalid appointment date."));
                }

                const endDatetime = new Date(
                    start.getTime() + totalDuration * 60000
                );

                resolve({

                    totalDuration,
                    totalPrice,
                    endDatetime,

                    // THIS IS WHAT WE'LL INSERT LATER
                    selectedItems

                });

            })

            .catch(reject);

    });

};