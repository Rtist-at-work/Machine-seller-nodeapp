const { Server } = require( "socket.io");
const http = require ("http");
const express = require ("express");

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://192.168.1.5:5000","http://localhost:8081"],
    methods: ["GET", "POST"],
  },
});

// realtime message code goes here
const getReceiverSocketId = (receiverId) => {
  return users[receiverId];
};

const users = {};

// used to listen events on server side.
io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  const userId = socket.handshake.query.userId;
  if (userId) {
    users[userId] = socket.id;
    console.log("Hello ", users);
  }
  // used to send the events to all connected users
  io.emit("getOnlineUsers", Object.keys(users));

  // used to listen client side events emitted by server side (server & client)
  socket.on("disconnect", () => {
    console.log("a user disconnected", socket.id);
    delete users[userId];
    io.emit("getOnlineUsers", Object.keys(users));
  });
});


module.exports = { app, io, server,getReceiverSocketId }