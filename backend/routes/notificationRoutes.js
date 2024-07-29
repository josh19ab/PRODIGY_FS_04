// routes/notificationRoutes.js
const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createNotification,
} = require("../controllers/notificationControllers");

const router = express.Router();

router.route("/").post(protect, createNotification);

module.exports = router;
