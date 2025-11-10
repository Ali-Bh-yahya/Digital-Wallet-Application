import User from "../models/wallet.models.js";
import { Transaction } from "../models/transaction.model.js";
import mongoose from "mongoose";
import { maskPan, getLast4 } from "../utils/cardHelpers.js";
import { encrypt, decrypt } from "../utils/encryption.js";


const WalletController = {
  // Get user wallet info
  getWalletInfo: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("name email walletBalance virtualCard status idNumber");
      if (!user) return res.status(404).json({ error: "User not found." });

      // Return full virtual card data (CVV stays encrypted)
      res.json({
        name: user.name,
        email: user.email,
        balance: user.walletBalance,
        status: user.status,
        idNumber: user.idNumber, // Added: Return user's ID number
        virtualCard: user.virtualCard || null,
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error.", details: error.message });
    }
  },

  // Deposit funds (atomic)
  deposit: async (req, res) => {
    try {
      const { amount, description } = req.body;
      if (!amount || Number(amount) <= 0) return res.status(400).json({ error: "Amount must be greater than zero." });

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $inc: { walletBalance: Number(amount) } },
        { new: true }
      );
      if (!user) return res.status(404).json({ error: "User not found." });

      await Transaction.create({
        user: user._id,
        type: "deposit",
        amount: Number(amount),
        status: "completed",
        description: description || "Deposit to wallet",
      });

      res.json({ msg: "Deposit successful.", balance: user.walletBalance });
    } catch (error) {
      res.status(500).json({ error: "Internal server error.", details: error.message });
    }
  },

  // Withdraw funds (atomic)
  withdraw: async (req, res) => {
    try {
      const { amount, description } = req.body;
      if (!amount || Number(amount) <= 0) return res.status(400).json({ error: "Amount must be greater than zero." });

      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ error: "User not found." });
      if (user.walletBalance < Number(amount)) return res.status(400).json({ error: "Insufficient funds." });

      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { $inc: { walletBalance: -Number(amount) } },
        { new: true }
      );

      await Transaction.create({
        user: user._id,
        type: "withdrawal",
        amount: Number(amount),
        status: "completed",
        description: description || "Withdrawal from wallet",
      });

      res.json({ msg: "Withdrawal successful.", balance: updatedUser.walletBalance });
    } catch (error) {
      res.status(500).json({ error: "Internal server error.", details: error.message });
    }
  },

  // 🔥 MODIFIED: Transfer funds using recipient's idNumber
  transfer: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Changed: recipientId instead of toUserId
      const { amount, recipientId, description } = req.body;

      // Validation
      if (!amount || Number(amount) <= 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: "Amount must be greater than zero." });
      }
      
      if (!recipientId) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: "Recipient ID is required." });
      }

      // Get sender
      const sender = await User.findById(req.user.id).session(session);
      if (!sender) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: "Sender not found." });
      }

      // Check balance
      if (sender.walletBalance < Number(amount)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: "Insufficient funds." });
      }

      // 🔥 KEY CHANGE: Find receiver by idNumber instead of MongoDB _id
      const receiver = await User.findOne({ idNumber: recipientId }).session(session);
      if (!receiver) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: "Recipient not found. Please check the ID number." });
      }

      // Prevent self-transfer
      if (sender._id.toString() === receiver._id.toString()) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: "You cannot transfer money to yourself." });
      }

      // Check if receiver account is active
      if (receiver.status !== "active") {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({ error: "Recipient account is not active." });
      }

      // Perform transfer
      sender.walletBalance -= Number(amount);
      receiver.walletBalance += Number(amount);

      await sender.save({ session });
      await receiver.save({ session });

      // Create transaction records for BOTH sender and receiver
      await Transaction.create(
        [
          // Transaction for SENDER (Ali)
          {
            user: sender._id,
            type: "transfer",
            amount: Number(amount),
            status: "completed",
            description: description || `Transfer to ${receiver.name} (ID: ${receiver.idNumber})`,
            toUser: receiver._id,
          },
          // 🆕 NEW: Transaction for RECEIVER (Yazan)
          {
            user: receiver._id,
            type: "receive", // Different type so receiver knows it's incoming
            amount: Number(amount),
            status: "completed",
            description: description || `Received from ${sender.name} (ID: ${sender.idNumber})`,
            toUser: sender._id, // Store who sent it
          },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      res.json({ 
        msg: "Transfer successful.", 
        senderBalance: sender.walletBalance,
        recipientName: receiver.name,
        recipientId: receiver.idNumber
      });

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error("Transfer error:", error);
      res.status(500).json({ error: "Internal server error.", details: error.message });
    }
  },

  // 🆕 NEW: Verify recipient before transfer
  verifyRecipient: async (req, res) => {
    try {
      const { recipientId } = req.body;

      if (!recipientId) {
        return res.status(400).json({ error: "Recipient ID is required." });
      }

      // Find user by idNumber
      const recipient = await User.findOne({ idNumber: recipientId })
        .select("name email idNumber status");

      if (!recipient) {
        return res.status(404).json({ error: "Recipient not found." });
      }

      // Check if it's the same user
      if (recipient._id.toString() === req.user.id) {
        return res.status(400).json({ error: "You cannot transfer to yourself." });
      }

      // Return recipient info for confirmation
      res.json({
        found: true,
        recipient: {
          name: recipient.name,
          idNumber: recipient.idNumber,
          status: recipient.status,
          // Partially hide email for privacy
          emailHint: recipient.email.substring(0, 3) + "***@" + recipient.email.split("@")[1]
        }
      });

    } catch (error) {
      console.error("Verify recipient error:", error);
      res.status(500).json({ error: "Internal server error.", details: error.message });
    }
  },

  // Generate and assign a virtual card
  generateVirtualCard: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ error: "User not found." });
      if (user.status !== "active") return res.status(403).json({ error: "User is not approved yet." });
      if (user.virtualCard) return res.status(400).json({ error: "Virtual card already assigned." });

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

      user.virtualCard = { cardNumber, cardHolderName, expirationDate, cvv: { iv, data } };
      await user.save();

      res.json({ msg: "Virtual card generated.", virtualCard: user.virtualCard });
    } catch (error) {
      res.status(500).json({ error: "Internal server error.", details: error.message });
    }
  },

  // Get transaction history
  getTransactions: async (req, res) => {
    try {
      const transactions = await Transaction.find({ user: req.user.id })
        .populate('toUser', 'name idNumber') // Populate recipient info
        .sort({ createdAt: -1 });
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Internal server error.", details: error.message });
    }
  },

  // Reveal CVV with password verification
  revealCVV: async (req, res) => {
    try {
      const { password } = req.body;
      if (!password) return res.status(400).json({ error: "Password is required to reveal CVV." });

      const user = await User.findById(req.user.id).select("password virtualCard");
      if (!user) return res.status(404).json({ error: "User not found." });
      if (!user.virtualCard || !user.virtualCard.cvv) {
        return res.status(404).json({ error: "No virtual card found." });
      }

      // Verify password
      const isPasswordCorrect = await user.comparePassword(password);
      if (!isPasswordCorrect) {
        return res.status(401).json({ error: "Invalid password." });
      }

      // Decrypt CVV
      let cvvPlain = null;
      try {
        cvvPlain = decrypt(user.virtualCard.cvv);
      } catch (e) {
        console.error("CVV decrypt failed:", e);
        return res.status(500).json({ error: "Failed to decrypt CVV." });
      }

      res.json({ cvv: cvvPlain });
    } catch (error) {
      console.error("revealCVV error:", error);
      res.status(500).json({ error: "Internal server error.", details: error.message });
    }
  },
};

export default WalletController;