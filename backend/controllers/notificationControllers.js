// controllers/notificationControllers.js
const asyncHandler = require("express-async-handler");
const Notification = require("../models/notificationModel");

//@description     Create a notification
//@route           post /api/notifications/
const createNotification = asyncHandler(async (req, res) => {
   const { userId, chatId, message } = req.body;

   try {
     if (!userId || !chatId || !message) {
       return res.status(400).json({ message: "Missing required fields" });
     }

     const notification = await Notification.create({
       user: userId,
       chat: chatId,
       message,
     });

     res.status(201).json(notification);
   } catch (error) {
     console.error("Error creating notification:", error);
     res.status(500).json({ message: "Internal Server Error" });
   }
});

//@description     get all notifications
//@route           get /api/notifications/:userId
const getUserNotification = asyncHandler(async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.params.userId,
    })
      .populate("chat")
      .populate("user");
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving notifications" });
  }
});

//@description     delete a notification
//@route           detele /api/notifications/:Id
const deleteUserNotifications = asyncHandler(async (req, res) => {
  try {
    const notificationId = req.params.id;
    const deletedNotification = await Notification.findByIdAndDelete(
      notificationId
    );

    if (!deletedNotification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = {
  createNotification,
  getUserNotification,
  deleteUserNotifications,
};
