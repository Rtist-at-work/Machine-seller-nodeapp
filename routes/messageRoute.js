const express = require("express");
const {
  getMessage,
  sendMessage,
  getUsers,
} = require("../controllers/Client/message_controller");
const secureRoute = require("../middlewares/secureRoute");
console.log("riiii");
const router = express.Router();
router.post("/send/:id", secureRoute, sendMessage);
router.get("/get/:chatUser", secureRoute, getMessage);
router.get("/getUsers/:selectedUser", secureRoute, getUsers);

module.exports = router;
