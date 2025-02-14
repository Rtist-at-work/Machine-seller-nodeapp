const mongoose = require('mongoose');

// Create the schema
const OtpSchema = new mongoose.Schema({
  mailOrPhone: {
    type: String,
    required: true, // This field is mandatory
    validate: {
      validator: function (v) {
        // Validate that it's either an email or a phone number
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{10}$/; // Adjust as per your phone format
        return emailRegex.test(v) || phoneRegex.test(v);
      },
      message: (props) => `${props.value} is not a valid email or phone number!`,
    },
  },
  otp: {
    type: String,
    required: true, // This field is mandatory
    minlength: 4, // Adjust OTP length as needed
    maxlength: 6,
  },
}, {
  timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
});

// Create the model
const Otp = mongoose.model('Otp', OtpSchema);

module.exports = Otp;
