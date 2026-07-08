const express = require("express");

const router = express.Router();

const dashboardController = require("../controllers/dashboard.controller");

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");


router.get(
    "/stats",
    authMiddleware,
    adminMiddleware,
    dashboardController.getDashboardStats
);


module.exports = router;