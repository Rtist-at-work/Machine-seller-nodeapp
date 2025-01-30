const express = require('express');
const mongoose = require('mongoose');
const connect = require('./db')
const signup = require('./controllers/signUp')
const login = require('./controllers/login')
const cors = require('cors')
require('dotenv').config();

const app = express();

const whitelist = ['http://localhost:5173']; // Replace with your frontend IP and port
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};
app.use(cors(corsOptions));

app.use(express.json()); // Add middleware to parse JSON body

// db connection
connect();
// routes
app.use('/signup', signup);
app.use('/login', login);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`server listening on Port ${PORT}`);
});
server.timeout = 600000;
