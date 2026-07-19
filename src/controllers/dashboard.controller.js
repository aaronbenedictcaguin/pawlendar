const db = require("../config/db");

exports.getDashboardStats = (req, res) => {

    const statsSql = `
        SELECT

            COUNT(
                CASE 
                WHEN status <> 'Cancelled'
                THEN 1
                END
            ) AS todayAppointments,

            SUM(status = 'Checked In') AS checkedInPets,

            SUM(status = 'In Progress') AS groomingPets,

            SUM(status = 'Ready for Pickup') AS readyForPickup,

            SUM(status = 'Completed') AS completedAppointments,

            SUM(status = 'Cancelled') AS cancelledAppointments,

            SUM(
                CASE
                    WHEN payment_status = 'Paid'
                    THEN total_price
                    ELSE 0
                END
            ) AS todayRevenue,

            AVG(
                CASE
                    WHEN payment_status = 'Paid'
                    THEN total_price
                END
            ) AS averageSale

        FROM appointments

        WHERE DATE(start_datetime)=CURDATE()
    `;

    const monthlyRevenueSql = `
        SELECT
            COALESCE(SUM(total_price),0) AS monthlyRevenue
        FROM appointments
        WHERE payment_status='Paid'
        AND MONTH(start_datetime)=MONTH(CURDATE())
        AND YEAR(start_datetime)=YEAR(CURDATE())
    `;

    const customerSql = `
        SELECT COUNT(*) AS totalCustomers
        FROM user
        WHERE role='Customer'
        AND active_flag=TRUE
    `;

    const petSql = `
        SELECT COUNT(*) AS totalPets
        FROM pet
        WHERE active_flag=TRUE
    `;

    const groomerSql = `
        SELECT COUNT(*) AS activeGroomers
        FROM staff
        WHERE active_flag=TRUE
    `;

    const loyaltySql = `
        SELECT

        SUM(completed BETWEEN 0 AND 2) AS bronzeMembers,

        SUM(completed BETWEEN 3 AND 5) AS silverMembers,

        SUM(completed >= 6) AS goldMembers

        FROM(

            SELECT

                u.user_id,

                COUNT(a.appointment_id) AS completed

            FROM user u

            LEFT JOIN pet p
                ON u.user_id=p.user_id
                AND p.active_flag=TRUE

            LEFT JOIN appointments a
                ON p.pet_id=a.pet_id
                AND a.status='Completed'

            GROUP BY u.user_id

        ) loyalty
    `;

    const upcomingSql = `
        SELECT

            a.appointment_id,

            a.start_datetime,

            p.pet_name,

            u.first_name,

            u.last_name,

            s.first_name AS staff_first_name,

            s.last_name AS staff_last_name,

            a.status

        FROM appointments a

        JOIN pet p
            ON a.pet_id=p.pet_id

        JOIN user u
            ON p.user_id=u.user_id

        LEFT JOIN staff s
            ON a.staff_id=s.staff_id

        WHERE

            DATE(a.start_datetime)=CURDATE()

            AND a.status<>'Cancelled'

        ORDER BY a.start_datetime

        LIMIT 5
    `;

    const activitySql = `
        SELECT

            a.appointment_id,

            p.pet_name,

            a.status,

            a.updated_at

        FROM appointments a

        JOIN pet p
            ON a.pet_id=p.pet_id

        ORDER BY a.updated_at DESC

        LIMIT 8
    `;

    db.query(statsSql,(err,statsResult)=>{

        if(err){
            return res.status(500).json({error:err.message});
        }

        db.query(monthlyRevenueSql,(err,monthlyResult)=>{

            if(err){
                return res.status(500).json({error:err.message});
            }

            db.query(customerSql,(err,customerResult)=>{

                if(err){
                    return res.status(500).json({error:err.message});
                }

                db.query(petSql,(err,petResult)=>{

                    if(err){
                        return res.status(500).json({error:err.message});
                    }

                    db.query(groomerSql,(err,groomerResult)=>{

                        if(err){
                            return res.status(500).json({error:err.message});
                        }

                        db.query(loyaltySql,(err,loyaltyResult)=>{

                            if(err){
                                return res.status(500).json({error:err.message});
                            }

                            db.query(upcomingSql,(err,upcomingResult)=>{

                                if(err){
                                    return res.status(500).json({error:err.message});
                                }

                                db.query(activitySql,(err,activityResult)=>{

                                    if(err){
                                        return res.status(500).json({error:err.message});
                                    }

                                    res.json({

                                        stats:{

                                            todayAppointments:
                                            statsResult[0].todayAppointments,

                                            checkedInPets:
                                            statsResult[0].checkedInPets || 0,

                                            groomingPets:
                                            statsResult[0].groomingPets || 0,

                                            readyForPickup:
                                            statsResult[0].readyForPickup || 0,

                                            completedAppointments:
                                            statsResult[0].completedAppointments || 0,

                                            cancelledAppointments:
                                            statsResult[0].cancelledAppointments || 0,

                                            todayRevenue:
                                            statsResult[0].todayRevenue || 0,

                                            averageSale:
                                            Number(statsResult[0].averageSale || 0).toFixed(2),

                                            monthlyRevenue:
                                            monthlyResult[0].monthlyRevenue || 0,

                                            totalCustomers:
                                            customerResult[0].totalCustomers,

                                            totalPets:
                                            petResult[0].totalPets,

                                            activeGroomers:
                                            groomerResult[0].activeGroomers,

                                            bronzeMembers:
                                            loyaltyResult[0].bronzeMembers || 0,

                                            silverMembers:
                                            loyaltyResult[0].silverMembers || 0,

                                            goldMembers:
                                            loyaltyResult[0].goldMembers || 0

                                        },

                                        upcoming:
                                        upcomingResult,

                                        activity:
                                        activityResult

                                    });

                                });

                            });

                        });

                    });

                });

            });

        });

    });

};