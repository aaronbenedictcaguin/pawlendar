const express = require("express");

const router = express.Router();

const serviceController = require("../controllers/service.controller");
const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const { validateService } = require("../middleware/service.validation");


router.post("/", authMiddleware, adminMiddleware, validateService, serviceController.createService);
router.get("/", serviceController.getServices);
router.get("/:id", serviceController.getService);
router.put("/:id", authMiddleware, adminMiddleware, validateService, serviceController.updateService);
router.delete("/:id", authMiddleware, adminMiddleware, serviceController.deleteService);

module.exports = router;