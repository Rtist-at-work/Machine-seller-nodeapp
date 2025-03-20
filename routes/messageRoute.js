const express = require( "express");
const { getMessage, sendMessage } = require('../controllers/Client/message_controller');
const secureRoute = require("../middlewares/secureRoute");

const router = express.Router();
router.post("/send/:id", secureRoute, sendMessage);
router.get("/get/:id", secureRoute, getMessage);

module.exports = router;