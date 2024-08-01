const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const colors = require("colors");
const cors = require("cors");
const { Server } = require("socket.io");
const { createServer } = require("http");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const router = express.Router();

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);
app.use(express.json());



app.use(
  cors({
    origin: [
      "https://chat-app-jo-frontend.vercel.app", // Your frontend URL on Vercel
      "http://localhost:5000", // Your local development URL
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

router.get("/", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "https://chat-app-jo-frontend.vercel.app"); 
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.json({ message: "CORS headers added to this response" });
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 3000;


// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: [
      "https://chat-app-jo-frontend.vercel.app",
      "http://localhost:5000",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("USER JOINED ROOM :" + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat;

    if (!chat.users) return console.log("Chat.user not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.get("/", (req, res) => {
  res.send("API is running successfully");
});

app.use((req, res) => {
  res.status(404).send("Not Found");
});

httpServer.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`.yellow.bold);
});
