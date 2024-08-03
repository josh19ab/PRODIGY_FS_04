const asyncHandler = require("express-async-handler");
const Message = require('../models/messageModel');
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const cloudinary = require("../config/cloudinary");

//@description     Fetch all messages
//@route           get /api/Message/:chatId
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});


//@description     Create New Message
//@route           POST /api/Message/
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId, fileUrl } = req.body;

  if (!chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }
  const  newMessage = {
    sender: req.user._id,
    content: content || null,
    chat: chatId,
    fileUrl: fileUrl || null,
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic")
    message = await message.populate("chat")
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Upload media file
//@route           POST /api/message/upload
const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
    });
    // Return the secure URL of the uploaded file
    res.status(200).json({ url: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: "Failed to upload media", error: error.message });
  }
});

module.exports = { sendMessage, allMessages, uploadMedia };
