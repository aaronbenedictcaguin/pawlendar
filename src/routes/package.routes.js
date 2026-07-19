const express = require("express");

const router = express.Router();

const packageController = require("../controllers/package.controller");

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

const {
    validatePackage
} = require("../middleware/package.validation");


// CUSTOMER VIEW PACKAGES
router.get(
    "/",
    packageController.getPackages
);


// ADMIN VIEW ALL PACKAGES INCLUDING INACTIVE
router.get(
    "/admin/all",
    authMiddleware,
    adminMiddleware,
    packageController.getAllPackagesAdmin
);


// ADMIN CREATE PACKAGE
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    validatePackage,
    packageController.createPackage
);


// ADMIN UPDATE PACKAGE
router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    validatePackage,
    packageController.updatePackage
);


// ADMIN SOFT DELETE PACKAGE
router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    packageController.deletePackage
);


// ADMIN RESTORE PACKAGE
router.put(
    "/:id/restore",
    authMiddleware,
    adminMiddleware,
    packageController.restorePackage
);


// CUSTOMER SINGLE PACKAGE DETAILS
router.get(
    "/:id",
    packageController.getPackage
);


module.exports = router;