import User from "../models/wallet.models.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

const AuthController = {
  // Register a user
  register: async (req, res) => {
    try {
      const { name, email, password, phone, idNumber } = req.body;

      // Check if user already exists
      const existing = await User.findOne({ $or: [{ email }, { phone }, { idNumber }] });
      if (existing) {
        return res.status(400).json({ error: "User with this email, phone, or ID number already exists." });
      }
      // Get uploaded file path from multer
      const idCardImage = req.file ? req.file.path : null;

      if (!idCardImage) {
        return res.status(400).json({ error: "ID card image is required." });
      }

      // Create user (password will be hashed by pre-save hook)
      const user = await User.create({
        name,
        email,
        password,
        phone,
        idNumber,
        idCardImage,
        status: "pending" // New users are pending approval
      });

      // Create JWT token (keep payload minimal)
      const userToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: "7d" });

      // Set token in cookie
      res.cookie("usertoken", userToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
      });

      res.status(201).json({
        msg: "Registration successful!",
        user: { id: user._id, email: user.email, status: user.status }
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Login a user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ error: "Email not found." });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ error: "Incorrect password." });

      const userToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: "7d" });

      res.cookie("usertoken", userToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({
        msg: "Login successful!",
        user: { id: user._id, email: user.email, status: user.status }
      });
    } catch (error) {
      res.status(500).json({ error: "Something went wrong. Please try again later." });
    }
  },

  // Logout a user (clear cookie)
  logout: (req, res) => {
    res.clearCookie("usertoken");
    res.json({ msg: "Logout successful." });
  }
};

export default AuthController;
