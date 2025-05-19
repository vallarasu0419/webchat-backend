const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const messageRoutes = require("./routes/messageRoutes");
const authRoutes = require("./routes/auth");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const onlineUsers = new Map();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/WebChat", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api", authRoutes);
// app.use("/api/messages", messageRoutes);

// Socket.IO
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("registerUser", (userId) => {
    onlineUsers.set(userId, socket.id); // Map the userId to their socket.id
    console.log("Registered user:", userId, "with socket ID:", socket.id);
  });

  socket.on("sendMessage", async (data) => {
    const { senderId, receiverId, message } = data;

    try {
      const newMessage = new Message({
        senderId,
        receiverId,
        message,
        timestamp: new Date(),
      });

      await newMessage.save();

      const receiverSocketId = onlineUsers.get(receiverId);
      console.log("receiverId:", receiverId);
      console.log("receiverSocketId:", receiverSocketId);

      // Emit message only if receiver is online
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", newMessage);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  socket.on("disconnect", () => {
    // Remove disconnected socket from the map
    for (const [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        console.log("User disconnected:", userId);
        break;
      }
    }
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
