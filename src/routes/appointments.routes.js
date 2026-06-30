const express = require("express");

const router = express.Router();

const appointmentController = require("../controllers/appointments.controller");

router.post("/", appointmentController.bookAppointment);

router.get("/", appointmentController.getAppointments);

router.get("/availability", appointmentController.checkAvailability);

router.get("/:id", appointmentController.getAppointmentById);

router.put("/:id/status", appointmentController.updateStatus);

router.delete("/:id", appointmentController.cancelAppointment);

module.exports = router;