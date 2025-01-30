const express = require('express');
const signUp = require('../models/userSIgnUp')
const {v4 : uuidv4} = require('uuid')
const bcrypt = require('bcrypt')

const router = express.Router();

router.post('/signup',async(req,res)=>{

res.json({status:true,message:"not ok"})
// const signup = async()=>{
//     const id = uuidv4() ;
//     const userDetails = {
//         UserId : id,
//         Username : "tamil1",
//         Password : "Ch6is8in",
//         email : "tami1l@gmail.com",
//         mobile : +919999999999,
//         Location : "tiruppury",
//         createdAt : Date.now()
//     }
//   const hashedPassword = async (userDetails)=>{
//     try{
//         const hp = await bcrypt.hash(userDetails.Password,10)
//         return(hp)
//     }
//     catch(err){
//         throw{
//             message : "unknown error please try again later",
//             err : err
//         }
//     }
//   }   
//    userDetails.Password = await hashedPassword(userDetails);
//     try{
//         const result = new signUp(userDetails)
//         await result.save()
//         // const result = await signUp.collection.insertOne(userDetails) 
//         res.status(200).json({message:"user Details saved successfully"})
//     }
//     catch(err){
//         console.log(err)
//     }
    
}
)
module.exports = router