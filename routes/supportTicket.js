const express = require("express");
const {
  supportTicket,
} = require("../controllers/Client/supportTicket");
const secureRoute = require("../middlewares/secureRoute");
const router = express.Router();

router.post("/", supportTicket);

module.exports = router;
