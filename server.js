const express = require('express');
const mongoose = require('mongoose');
const connect = require('./db')
const signup = require('./controllers/signUp')
const login = require('./controllers/login')
const corsControl = require('cors')
require('dotenv').config();


const app = express();

const corsRestriction = {
    origin : ['http://localhost:5173/'],
    methods :  ["GET", "POST", "PUT", "DELETE"],
    // credentials : true
}

app.use(corsControl(corsRestriction))

//db connection
connect()
// login()
// signup()
// //routes
app.use('/signup',signup);

const PORT = process.env.PORT || 5000 ;

const server = app.listen(PORT,()=>{
    console.log(`server listening on Port ${PORT}`)
})
server.timeout = 600000; 