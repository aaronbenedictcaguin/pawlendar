const express = require("express");

const router = express.Router();

const appointmentController = require("../controllers/appointments.controller");
const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const { validateAppointment } = require("../middleware/appointments.validation");

router.post("/", authMiddleware, validateAppointment, appointmentController.bookAppointment);

router.get("/availability", authMiddleware, appointmentController.checkAvailability);

router.get("/admin/appointments", authMiddleware, adminMiddleware, appointmentController.getAllAppointments);

router.get("/", authMiddleware, appointmentController.getAppointments);

router.get("/:id", authMiddleware,appointmentController.getAppointmentById);

router.put("/admin/appointments/:id/status", authMiddleware, adminMiddleware, appointmentController.updateStatus);

router.put("/:id/reassign", authMiddleware, adminMiddleware, appointmentController.reassignAppointment);

router.delete("/:id", authMiddleware, appointmentController.cancelAppointment);

module.exports = router;
