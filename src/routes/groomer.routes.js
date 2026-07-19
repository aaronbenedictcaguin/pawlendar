const express = require("express");
const router = express.Router();

const groomerController = require("../controllers/groomer.controller");

// Public
router.get("/", groomerController.getGroomers);
router.get("/:id", groomerController.getGroomerById);

module.exports = router;