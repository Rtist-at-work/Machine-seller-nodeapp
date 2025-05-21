const express = require("express");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const { createServer } = require("http");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const cors = require("cors");

require("dotenv").config();

//middlwares
const connect = require("./db");
const signup = require("./controllers/signUp");
const login = require("./controllers/login");
const adminCategories = require("./controllers/Admin/categoryCreation");
const homepage = require("./controllers/Client/HomePage");
const categoryPage = require("./controllers/Client/Industry");
const sell = require("./controllers/sell");
const productPageRoute = require("./routes/ProductPageRoutes.js");
const categoryRoutes = require("./routes/categoryRoutes.js");
const productDetailRoutes = require("./routes/productDetails.js");
const AdminProduct = require("./routes/AdminProduct.js");
const profilePage = require("./routes/profileRoutes.js");
const qrRoute = require("./routes/qrRoute.js");
const secureRoute = require("./middlewares/secureRoute.js");
const wishlist = require("./routes/wishList.js");
const video = require("./routes/video.js");
const mechanicRoutes = require("./routes/mechanicRoutes");
const search = require("./controllers/Client/SearchController.js");
const supportTicket = require("./controllers/Client/supportTicket.js")

// const { getMessage, sendMessage } = require( "./controllers/Client/message_controller.js");
// const secureRoute = require("./middlewares/secureRoute.js");
const messageRoute = require("./routes/messageRoute.js");
const { app, server } = require("./socket/server.js");
const productListPage = require("./controllers/Client/productListPage.js");

// const app = express();
const httpServer = createServer(app);

//express setup
app.use(cors({ origin: "*" }));
app.use(express.json()); // Parses JSON request body
app.use(express.urlencoded({ extended: true })); // Parses form data

//connections
connect(); //mongo

// const whitelist = ['http://localhost:5173',]; // Replace with your frontend IP and port
// const corsOptions = {
//   origin: (origin, callback) => {
//     if (whitelist.indexOf(origin) !== -1 || !origin) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   }
// };
app.use(bodyParser.json({ limit: "200mb" }));
app.use(bodyParser.urlencoded({ limit: "200mb", extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.use((req, res, next) => {
  const originUrl = req.get("Origin") || req.get("Referer"); // If 'Origin' is not available, fallback to 'Referer'
  console.log(`Request made from: ${originUrl}`);
  next();
});

// routes
app.use("/signup", signup);
app.use("/login", login);
app.use("/adminCategories", adminCategories);
app.use("/productupload", secureRoute, sell);
app.use("/homepage", homepage);
app.use("/categories", categoryPage); //need to change
// app.use("/api/chat", require("./controllers/chat"));
app.use("/message", messageRoute);
app.use("/productPage", productPageRoute);
app.use("/CategoryPage", categoryRoutes);
app.use("/productDetails", productDetailRoutes);
app.use("/QrGenerator", qrRoute);
app.use("/profile", profilePage);
app.use("/adminApproval", AdminProduct);
app.use("/wishlist", wishlist);
app.use("/video", video);
app.use("/mechanicList", mechanicRoutes);
app.use("/searchResult", search);
app.use("/supportTicket", supportTicket);

//socket setup

// const io = new Server(httpServer, {
//   cors: {
//     origin: "*", // Allows requests from any domain
//     methods: ["GET", "POST", "PUT", "DELETE"], // Allows all necessary methods
//   },
// });

// const connectedSockets = new Map();

// io.on("connection", (socket) => {
//   console.log("socket connected successfully", socket.id);
//   connectedSockets.set(socket.id, socket);

//   socket.on('disconnect',()=>{
//     console.log('User disconnected: ' + socket.id);
//     connectedSockets.delete(socket.id);
//   })
// });

// io.on("connect_error", (err) => {
//   console.log("Connection Error: ", err.message);
// });

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`server listening on Port ${PORT}`);
});
