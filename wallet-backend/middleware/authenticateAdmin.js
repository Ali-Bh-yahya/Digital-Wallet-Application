import jwt from "jsonwebtoken";
import User from "../models/wallet.models.js";

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.usertoken || req.headers.authorization?.split?.(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access denied. No token provided."
      });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Access denied. User not found."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: "Access denied. Invalid token." });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: "Access denied. Token expired." });
    }
    res.status(500).json({ success: false, error: "Internal server error during authentication." });
  }
};

/**
 * Admin authentication middleware - validates JWT token AND admin role
 * Ensures only admin users can access protected routes
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.usertoken || req.headers.authorization?.split?.(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access denied. No token provided."
      });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Access denied. User not found."
      });
    }

    // Optional status check (suspended exists in schema now)
    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        error: "Account suspended. Contact administrator."
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Access denied. Admin privileges required.",
        userRole: user.role
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: "Access denied. Invalid token." });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: "Access denied. Token expired." });
    }
    res.status(500).json({ success: false, error: "Internal server error during authentication." });
  }
};

const authenticateSuperAdmin = async (req, res, next) => {
  try {
    // run admin authentication first
    await new Promise((resolve, reject) => {
      authenticateAdmin(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Future: more checks for super admin role
    next();
  } catch (error) {
    // error handled by authenticateAdmin; ensure request lifecycle stops
    return;
  }
};

export {
  authenticate,
  authenticateAdmin,
  authenticateSuperAdmin
};
