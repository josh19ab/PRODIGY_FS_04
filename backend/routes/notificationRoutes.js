// routes/notificationRoutes.js
const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createNotification,
  getUserNotification,
  deleteUserNotifications,
} = require("../controllers/notificationControllers");

const router = express.Router();

router.route("/").post( createNotification);
router.route("/:userId").get( getUserNotification);
router.route("/:id").delete(protect, deleteUserNotifications);

module.exports = router;
