const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    unique: true,
    default: () => new mongoose.Types.ObjectId(),
  }, 
  senderId: {
    type: String,
    required: true,
  },
  receiverId: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Message", messageSchema);
