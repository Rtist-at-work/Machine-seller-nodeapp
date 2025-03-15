const express = require('express');
const mongoose = require('mongoose');
const connect = require('./db')
const cors = require('cors')
require('dotenv').config();
const bodyParser = require("body-parser"); 

 console.log("reached server")

//middlwares
const signup = require('./controllers/signUp')
const login = require('./controllers/login')
const adminCategories = require('./controllers/Admin/categoryCreation')
const homepage = require('./controllers/Client/HomePage')
const categoryPage = require('./controllers/Client/Industry')
const sell = require('./controllers/sell')
const app = express();
app.use(express.urlencoded({ extended: true }));

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
// app.use(bodyParser.json({ limit: "200mb" }));
// app.use(bodyParser.urlencoded({ limit: "200mb", extended: true }));
app.use(cors({ origin: "*"}));

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
app.use('/adminCategories',adminCategories)
app.use('/productupload',sell)
app.use('/homepage',homepage)
app.use('/categories',categoryPage)

const PORT = process.env.PORT || 5000;  

const server = app.listen(PORT,"0.0.0.0", () => {
  console.log(`server listening on Port ${PORT}`);
});

