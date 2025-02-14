const express = require('express');
const mongoose = require('mongoose');
const connect = require('./db')
const cors = require('cors')
require('dotenv').config();

//middlwares
const signup = require('./controllers/signUp')
const login = require('./controllers/login')


const app = express();

// const whitelist = ['http://localhost:5173',]; // Replace with your frontend IP and port
// const corsOptions = {
//   origin: (origin, callback) => {
//     if (whitelist.indexOf(origin) !== -1 || !origin) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   }
// };
app.use(cors());
app.use((req, res, next) => {
  const originUrl = req.get('Origin') || req.get('Referer');  // If 'Origin' is not available, fallback to 'Referer'
  console.log(`Request made from: ${originUrl}`);
  next();
});

app.use(express.json()); // Add middleware to parse JSON body
app.use(express.urlencoded({ extended: true })); // Allows parsing form data


//connections
connect(); //mongo 


// routes
app.use('/signup', signup);
app.use('/login', login);

const PORT = process.env.PORT || 4000;  

const server = app.listen(PORT, () => {
  console.log(`server listening on Port ${PORT}`);
});
server.timeout = 600000;
