const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from "Bearer <token>"

  if (!token) {
    return res.status(403).json({ message: "Access Denied. No Token Provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET); 
    req.user = decoded; 
    next(); 
  } catch (err) {
    return res.status(401).json({ message: "Invalid or Expired Token." });
  }
};

module.exports = authMiddleware;
