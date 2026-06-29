const express = require("express");

const router = express.Router();

const serviceController = require("../controllers/service.controller");

router.post("/", authMiddleware, serviceController.createService);

router.get("/", serviceController.getServices);

router.get("/:id", serviceController.getService);

router.put("/:id", authMiddleware, serviceController.updateService);

router.delete("/:id", authMiddleware, serviceController.deleteService);

module.exports = router;