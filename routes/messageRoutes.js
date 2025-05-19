const express = require("express");
const Message = require("../models/Message");

const router = express.Router();

// HTTP route to get messages between two users
router.get("/:senderId/:receiverId", async (req, res) => {
  const { senderId, receiverId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Function to set up Socket.IO
function setupSocket(io, onlineUsers) {
  io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);

    // // When user registers, store userId on socket object
    socket.on("registerUser", (userId) => {
      socket.userId = userId; // 🧠 Attach userId to socket
      onlineUsers.set(userId, socket.id);
      console.log("✅ Registered user:", userId, "with socket ID:", socket.id);
    });
    console.log("+++++++++++++++++++");
    socket.on("sendMessage", async (data) => {
      const { senderId, receiverId, message } = data;
      console.log("📨 Received message data from client:", data);

      try {
        const newMessage = new Message({
          senderId,
          receiverId,
          message,
          timestamp: new Date(),
        });

        await newMessage.save();

        const receiverSocketId = onlineUsers.get(receiverId);
        console.log("receiverSocketId", receiverSocketId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receiveMessage", newMessage);
          console.log("✅ Sent message to receiver:", receiverId);
        } else {
          // io.to(receiverSocketId).emit("receiveMessage", newMessage);
          console.log("🕸️ Receiver not online:", receiverId);
        }
      } catch (error) {
        console.error("❌ Error sending message:", error);
      }
    });

    // socket.on("disconnect", () => {
    //   const userId = socket.userId;
    //   if (userId) {
    //     const savedSocketId = onlineUsers.get(userId);

    //     // ⚠️ Only remove if the same socket is still registered
    //     if (savedSocketId !== socket.id) {
    //       onlineUsers.delete(userId);
    //       console.log("❌ User disconnected:", userId);
    //     } else {
    //       console.log("🔄 Socket ID mismatch — user likely reconnected. Not removing:", userId);
    //     }
    //   } else {
    //     console.log("❌ Disconnect from unknown user/socket:", socket.id);
    //   }
    // });
  });
}

module.exports = { router, setupSocket };
