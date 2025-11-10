import jwt from "jsonwebtoken";
import User from "../models/wallet.models.js";

const authenticate = async (req, res, next) => {
  const token = req.cookies?.usertoken || req.headers.authorization?.split?.(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: "User not found." });

    req.user = user; // Attach full user document to request
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token." });
  }
};

export { authenticate };
