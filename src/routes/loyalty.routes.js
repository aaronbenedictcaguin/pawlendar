const express = require("express");

const router = express.Router();

const loyaltyController =
require("../controllers/loyalty.controller");

const authMiddleware =
require("../middleware/auth.middleware");

const adminMiddleware =
require("../middleware/admin.middleware");

router.get(

    "/me",

    authMiddleware,

    loyaltyController.getMyLoyalty

);

router.get(

    "/admin",

    authMiddleware,

    adminMiddleware,

    loyaltyController.getAdminLoyalty

);

module.exports = router;