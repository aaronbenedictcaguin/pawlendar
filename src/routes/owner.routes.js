const express = require("express");
const router = express.Router();

const ownerController = require("../controllers/owner.controller");
const authMiddleware = require("../middleware/auth.middleware");

// create
router.post("/create", ownerController.createOwner);

// read
router.get("/", ownerController.getOwners);
router.get("/me", authMiddleware, ownerController.getMe);

module.exports = router;