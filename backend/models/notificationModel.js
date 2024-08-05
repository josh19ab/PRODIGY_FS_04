const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
