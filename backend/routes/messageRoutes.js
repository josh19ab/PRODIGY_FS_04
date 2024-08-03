const express = require('express')

const { protect } = require('../middleware/authMiddleware')
const { sendMessage } = require('../controllers/messageControllers')
const { allMessages } = require("../controllers/messageControllers");
const { uploadMedia } = require("../controllers/messageControllers");

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary"); 

const router = express.Router()

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "chat-app", // Optional: specify a folder in your Cloudinary account
    allowed_formats: ["jpg", "png", "gif", "jpeg"], // Specify allowed formats
  },
});

const upload = multer({ storage });

router.route('/').post(protect,sendMessage)
router.route('/:chatId').get(protect,allMessages)
router.route("/upload").post(protect, upload.single("file"), uploadMedia);

module.exports = router