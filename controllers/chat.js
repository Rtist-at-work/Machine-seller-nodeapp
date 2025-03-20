const express = require("express");
const Chat = require("../models/chatModel");

const router = express.Router();

router.post("/send", async (req, res) => {
    console.log("@reached")
  const chat = new Chat(req.body);
  await chat.save();
  res.json({ success: true });
});

router.get("/:userId/:receiverId", async (req, res) => {
  const { userId, receiverId } = req.params;
  const chats = await Chat.find({
    $or: [
      { senderId: userId, receiverId },
      { senderId: receiverId, receiverId: userId },
    ],
  }).sort({ timestamp: 1 });
  res.json(chats);
});

module.exports = router;
