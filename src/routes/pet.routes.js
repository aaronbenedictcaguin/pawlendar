const express = require("express");
const router = express.Router();

const petController = require("../controllers/pet.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.use(authMiddleware);

router.post("/", petController.createPet);
router.get("/", petController.getPets);
router.get("/:id", petController.getPetById);
router.put("/:id", petController.updatePet);
router.delete("/:id", petController.deletePet);

module.exports = router;