const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const connect = async ()=>{
    const uri = process.env.Mongo_URI;
    try{
        await mongoose.connect(uri,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }
    catch(err){
        // return(
        //     res.status(500).json({
        //         message:"Server not supporting",
        //         error : err
        //     })
        // )       
    }
}

module.exports = connect
