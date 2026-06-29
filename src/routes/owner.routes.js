const express = require("express");
const router = express.Router();

const ownerController = require("../controllers/owner.controller");

// create
router.post("/create", ownerController.createOwner);

// read
router.get("/", ownerController.getOwners);

module.exports = router;