const express = require('express');
const usermodel = require('../models/userSIgnUp')
const bcrypt = require('bcrypt')
const router = express.Router();


// router.get('/login',(req,res)=>{

    const login = async()=>{
        const email = "tamil@gmail.com"
        const password = "Ch6is8in"
        try{
            const user = await usermodel.collection.findOne({email});

            if(user){
                const isMatch = bcrypt.compare(password,user.Password)
                if(isMatch){
                    console.log("Logged In Successfully")
                    // res.status(200).json({
                    //     message : "Logged In Successfully",                    
                    // })
                }
                else{
                    console.log("Invalid Password")
                    // res.status(401).json({
                    //     message : "Invalid Password",                    
                    // })
                }
            }
            else{
                console.log("user not found")
                // res.status(401).json({
                //     message : "user not found",                    
                // })
            }
        }
        catch(err){
            // res.json({
            //     ststus : "error",
            //     message : "An Error Occured",     
            //     error : err               
            // })
            console.log(err)
        }
        

    }

// })

module.exports = login