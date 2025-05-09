const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
console.log("socket reached");
// Store user socket mappings
const users = [];

// Utility to get socket IDs for sender and receiver
const getReceiverSocketId = (receiverId, senderId) => {
  return [users[receiverId], users[senderId]];
};

//helper function to remove users from socket

function removeUserBySocketId(socketId) {
  const index = users.findIndex((obj) => Object.values(obj)[0] === socketId);
  if (index !== -1) {
    users.splice(index, 1);
  }
}

//helper function to add users in socket
function addUser(userId, socketId) {
  // Remove existing entry for this user
  const index = users.findIndex((obj) => Object.keys(obj)[0] === userId);
  console.log(index);
  if (index !== -1) {
    users.splice(index, 1);
  }
  console.log(users);
  // Add new entry
  users.push({ [userId]: socketId });
}

// Socket connection handler
io.on("connection", (socket) => {
  console.log("io reached");
  console.log("a user connected", socket.id);

  const token = socket.handshake.query.token;
  let decoded = null;

  if (token) {
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded) {
        const userId = decoded.id;

        // Remove any existing connection for this user
        removeUserBySocketId(socket.id);
        addUser(userId, socket.id);

        console.log("Users list:", users);
        io.emit("getOnlineUsers", users);
      }
    } catch (err) {
      console.log("JWT verification failed:", err.message);
    }
  }

  socket.on("join-post-room", (postId) => {
    socket.join(postId);
    console.log(`User ${socket.id} joined post room ${postId}`);
  });
  console.log(`${socket.id} rooms:`, socket.rooms);

  socket.on("leave-post-room", (postId) => {
    socket.leave(postId);
    console.log(`User ${socket.id} left post room ${postId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    removeUserBySocketId(socket.id);
    io.emit("getOnlineUsers", users);
  });
});

module.exports = { app, io, server, getReceiverSocketId };
