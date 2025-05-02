const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:4000",
      "http://192.168.1.9:4000",
    ],
    methods: ["GET", "POST"],
  },
});

// Store user socket mappings
const users = {};

// Utility to get socket IDs for sender and receiver
const getReceiverSocketId = (receiverId, senderId) => {
  return [users[receiverId], users[senderId]];
};

// Socket connection handler
io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  const token = socket.handshake.query.token;
  let decoded = null;

  if (token) {
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded) {
        users[decoded.id] = socket.id;
        console.log("User added:", decoded.id, socket.id);
        io.emit("getOnlineUsers", Object.keys(users));
      }
    } catch (err) {
      console.log("JWT verification failed:", err.message);
    }
  }

  socket.on("disconnect", () => {
    console.log("a user disconnected", socket.id);
    if (decoded?.id) {
      delete users[decoded.id];
      io.emit("getOnlineUsers", Object.keys(users));
    }
  });
});

module.exports = { app, io, server, getReceiverSocketId };
