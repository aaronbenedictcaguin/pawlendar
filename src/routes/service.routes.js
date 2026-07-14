const express = require("express");

const router = express.Router();

const serviceController = require("../controllers/service.controller");
const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const { validateService } = require("../middleware/service.validation");

// temporarily removed for connection purposes
// router.post("/", authMiddleware, validateService, serviceController.createService);
router.post("/", authMiddleware, validateService, adminMiddleware, serviceController.createService);
router.get("/", serviceController.getServices);
router.get("/:id", serviceController.getService);
// temporarily removed for connection purposes
// router.put("/:id", authMiddleware, validateService, serviceController.updateService);
// router.delete("/:id", authMiddleware, serviceController.deleteService);
router.put("/:id", authMiddleware, validateService, adminMiddleware,serviceController.updateService);
router.delete("/:id", authMiddleware, adminMiddleware, serviceController.deleteService);

module.exports = router;