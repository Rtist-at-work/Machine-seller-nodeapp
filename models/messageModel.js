const mongoose = require('mongoose')
const User = require('./userSIgnUp')

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
      trim : true,
      validate : [{
        validator : ( value )=> value.length > 0,
        message : "Message cannot be empty"
      }]
    },
    seen :{
      type : Boolean,
      default : false
    },
    createdAt : { type : Date, default : Date.now}
  },
  { timestamps: true }
);

const Message = mongoose.model("message", messageSchema);

module.exports = Message