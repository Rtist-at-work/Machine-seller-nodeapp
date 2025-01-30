const mongoose = require('mongoose');
require('dotenv').config();

const connect = async () => {
    const uri = process.env.Mongo_URI;
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected successfully!");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1); // Exit process on failure
    }
};

module.exports = connect;
