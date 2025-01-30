const express = require("express");
const usermodel = require("../models/userSIgnUp");
const bcrypt = require("bcrypt");
const router = express.Router();

router.post('/',(req,res)=>{
    res.json({message:"ok"})
})

// const login = async () => {
//   let emailormobile = "tail";
//   const password = "Ch6is8in";
// //   try {
//     const email1 = new RegExp(/^[a-zA-z0-9+@+.]*\S$/);
//     const mobile = new RegExp(/^\+?\d{1,4}?\d{10}$/);
    
//     if (mobile.test(emailormobile)) {
//         console.log("email")
//         emailormobile = "email1";
//     } else if (email1.test(emailormobile)) {
//         console.log("mobile")
//         emailormobile = "mobile";
//     }
//     else{
//         console.log("jjj")
//     }
//     console.log(emailormobile)
//     const user = await usermodel.collection.findOne({ email });

//     if (user) {
//       const isMatch = bcrypt.compare(password, user.Password);
//       if (isMatch) {
//         console.log("Logged In Successfully");
//         // res.status(200).json({
//         //     message : "Logged In Successfully",
//         // })
//       } else {
//         console.log("Invalid Password");
//         // res.status(401).json({
//         //     message : "Invalid Password",
//         // })
//       }
//     } else {
//       console.log("user not found");
//       // res.status(401).json({
//       //     message : "user not found",
//       // })
//     }
//   } catch (err) {
//     // res.json({
//     //     ststus : "error",
//     //     message : "An Error Occured",
//     //     error : err
//     // })
//     console.log(err);
//   }
// };

// })

module.exports = router;
