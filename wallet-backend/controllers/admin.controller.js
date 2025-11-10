// controllers/admin.controller.js
import User from "../models/wallet.models.js";
import { encrypt } from "../utils/encryption.js";
import { Transaction } from "../models/transaction.model.js";
import crypto from "crypto";

const AdminController = {
  // Get all pending users
  getPendingUsers: async (req, res) => {
    try {
      const users = await User.find({ status: "pending" }).select("-password");
      res.json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error.", details: error.message });
    }
  },

  // Approve a user
  
    approveUser: async (req, res) => {
      try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found." });
        if (user.status !== "pending") return res.status(400).json({ error: "User is not pending approval" });

        user.status = "active";

        // Generate Virtual Card with NUMERIC ONLY card number
        if (!user.virtualCard) {
          // Generate 15 random digits and add "4" prefix for Visa
          let randomDigits = "";
          for (let i = 0; i < 15; i++) {
            randomDigits += Math.floor(Math.random() * 10);
          }
          const cardNumber = "4" + randomDigits;
          
          const cardHolderName = user.name.toUpperCase();
          const expirationDate = `${String(new Date().getMonth() + 1).padStart(2, "0")}/${String(new Date().getFullYear() + 3).slice(-2)}`;
          const cvvPlain = String(Math.floor(100 + Math.random() * 900));
          const { iv, data } = encrypt(cvvPlain);

          user.virtualCard = {
            cardNumber,
            cardHolderName,
            expirationDate,
            cvv: { iv, data }
          };
        }

        await user.save();

        res.json({
          msg: "User approved and virtual card generated.",
          user: { id: user._id, status: user.status },
          virtualCard: user.virtualCard
        });
      } catch (error) {
        res.status(500).json({ error: "Internal server error.", details: error.message });
      }
    },

  // Reject a user
  rejectUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found." });
      if (user.status !== "pending") return res.status(400).json({ error: "User is not pending approval." });

      user.status = "rejected";
      await user.save();
      res.json({ msg: "User rejected.", user: { id: user._id, status: user.status } });
    } catch (error) {
      res.status(500).json({ error: "Internal server error.", details: error.message });
    }
  },

  // ===== ADD THESE NEW METHODS =====

  // Get all active users
  getActiveUsers: async (req, res) => {
    try {
      const users = await User.find({ status: "active" }).select("-password");
      res.json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error.", details: error.message });
    }
  },
  // Reactivate a suspended user
  unsuspendUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found." });

      user.status = "active";
      await user.save();
      
      res.json({ 
        success: true,
        msg: "User reactivated successfully.", 
        user: { id: user._id, status: user.status } 
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error.", details: error.message });
    }
  },
  // Get all suspended users
  getSuspendedUsers: async (req, res) => {
    try {
      const users = await User.find({ status: "suspended" }).select("-password");
      res.json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error.", details: error.message });
    }
  },



  // Suspend a user
  suspendUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found." });

      user.status = "suspended";
      await user.save();
      
      res.json({ 
        success: true,
        msg: "User suspended successfully.", 
        user: { id: user._id, status: user.status } 
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error.", details: error.message });
    }
  },
  //get all transactions from all users
   getAllTransactions : async (req, res) => {
    try {
      const transactions = await Transaction.find()
        .populate('user', 'name email idNumber') // Populate user info
        .populate('toUser', 'name email idNumber') // Populate recipient info for transfers
        .sort({ createdAt: -1 }) // Most recent first
        .limit(1000); // Limit to last 1000 transactions

      res.json(transactions);
    } catch (error) {
      console.error("Get all transactions error:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  },

  // Delete a user
  deleteUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findByIdAndDelete(userId);
      
      if (!user) return res.status(404).json({ error: "User not found." });
      
      res.json({ 
        success: true,
        msg: "User deleted successfully." 
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error.", details: error.message });
    }
  }
};

export default AdminController;