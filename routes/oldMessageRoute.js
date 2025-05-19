const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// GET messages between two users
router.get('/:senderId/:receiverId', async (req, res) => {
  const { senderId, receiverId } = req.params;
  try {
        const messages = await Message.find().sort({ timestamp: 1 });
//     const messages = await Message.find(
//         {
//       $or: [
//         { senderId, receiverId },
//         { senderId: receiverId, receiverId: senderId },
//       ],
//     }
// ).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST save new message
router.post('/', async (req, res) => {
  const { senderId, receiverId, message } = req.body;

  try {
    const newMessage = new Message({ senderId, receiverId, message });
    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
