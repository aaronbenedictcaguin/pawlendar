const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const appointmentController = require("../controllers/appointments.controller");
const dashboardController = require("../controllers/dashboard.controller");
const userController = require("../controllers/user.controller");
const groomerController = require("../controllers/groomer.controller");

const { validateGroomer } = require("../middleware/groomer.validation");

// dashboard stats route
router.get("/stats", authMiddleware, adminMiddleware, dashboardController.getDashboardStats);
// admin routes for appointments
router.get("/appointments", authMiddleware, adminMiddleware, appointmentController.getAllAppointments);
router.get(
    "/appointments/calendar",
    authMiddleware,
    adminMiddleware,
    appointmentController.getCalendarAppointments
);
router.put("/appointments/:id/status", authMiddleware, adminMiddleware, appointmentController.updateStatus);
router.put(
    "/appointments/:id/payment",
    authMiddleware,
    adminMiddleware,
    appointmentController.updatePaymentStatus
);
router.put("/appointments/:id/reassign", authMiddleware, adminMiddleware, appointmentController.reassignAppointment);
router.delete("/appointments/:id", authMiddleware, adminMiddleware, appointmentController.adminCancelAppointment);
// admin routes for users
router.get("/users", authMiddleware, adminMiddleware, userController.getUsers);
// admin routes for groomers
router.post("/groomers", authMiddleware, adminMiddleware, validateGroomer, groomerController.createGroomer);
router.get("/groomers", authMiddleware, adminMiddleware, groomerController.getGroomers);
router.get(
    "/groomers/:id/availability",
    authMiddleware,
    adminMiddleware,
    groomerController.getAvailability
);
router.get("/groomers/:id", authMiddleware, adminMiddleware, groomerController.getGroomerById);
router.put("/groomers/:id", authMiddleware, adminMiddleware, validateGroomer, groomerController.updateGroomer);
router.delete("/groomers/:id", authMiddleware, adminMiddleware, groomerController.deactivateGroomer);

module.exports = router;