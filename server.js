const express = require('express');
const mongoose = require('mongoose');
const connect = require('./db')
const signup = require('./controllers/signUp')
const login = require('./controllers/login')
require('dotenv').config();


const app = express();

//db connection
connect()
login()
//routes
// app.use('/signup',signup);

const PORT = process.env.PORT || 5000 ;

app.listen(PORT,()=>{
    console.log(`server listening on Port ${PORT}`)
})