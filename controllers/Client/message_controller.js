const { getReceiverSocketId, io } = require("../../socket/server.js");
const Conversation = require("../../models/conversationModel.js");
const Message = require("../../models/messageModel.js");
const User = require("../../models/userSIgnUp.js");

const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const senderId = req.user.id;
    const receiverId = req.params.id;

    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        members: [senderId, receiverId],
      });
      await User.updateOne({ _id: senderId }, { $push: { chats: receiverId } });
      await User.updateOne({ _id: receiverId }, { $push: { chats: senderId } });
    }
    const newMessage = new Message({
      senderId,
      receiverId,
      message,
    });
    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }
    await conversation.save();
    await newMessage.save();
    await Promise.all([conversation.save(), newMessage.save()]); // run parallel
    const [receiverSocketId, senderSocketId] = getReceiverSocketId(
      receiverId,
      senderId
    );
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", newMessage);
    }
    if (receiverSocketId) {
      newMessage.seen = true;
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMessage = async (req, res) => {
  try {
    const UserId = req.user.id;
    const { chatUser } = req.params;
    console.log("user :", req.user, chatUser);

    let conversation = await Conversation.findOne({
      members: { $all: [UserId, chatUser] },
    }).populate("messages");

    if (!conversation) {
      return res.status(201).json([]);
    }

    // Extract messages
    const messages = conversation.messages;

    // Find unread messages (where seen is false)
    const unreadMessages = messages.filter(
      (msg) => msg.receiverId.toString() === UserId && !msg.seen
    );

    // Update the seen status for unread messages
    if (unreadMessages.length > 0) {
      await Message.updateMany(
        { _id: { $in: unreadMessages.map((msg) => msg._id) } },
        { $set: { seen: true } }
      );
    }

    res.status(201).json(messages);
  } catch (error) {
    console.log("Error in getMessage", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const selectedUser = req.params.selectedUser;

    const isUserInChats = await User.exists({
      _id: userId,
      chats: selectedUser, // Directly checks if selectedUser exists in chats
    });

    const users = await User.findById({ _id: userId })
      .populate("chats", "username email mobile")
      .select("chats -_id")
      .lean();

    let newUser;

    if (selectedUser && !isUserInChats) {
      newUser = await User.findById(selectedUser)
        .select("username email mobile")
        .lean();
      users.chats.push(newUser);
    }

    // const users = await User.find().select("username email mobile");
    Array.isArray(users.chats)
      ? res.status(200).json(users.chats)
      : res.status(200).json([users.chats]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};
module.exports = { sendMessage, getMessage, getUsers };
