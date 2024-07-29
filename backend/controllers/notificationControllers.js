// controllers/notificationControllers.js
const asyncHandler = require("express-async-handler");
const Notification = require("../models/notificationModel");

const createNotification = asyncHandler(async (req, res) => {
  const { title, content, chatId } = req.body;

  if (!title || !content) {
    res.status(400);
    throw new Error("Title and content are required");
  }

  const notification = await Notification.create({
    title,
    content,
    user,
    chat,
    read: false,
  });

  res.status(201).json(notification);
});

module.exports = { createNotification };
