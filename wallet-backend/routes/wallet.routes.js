import express from "express";
import WalletController from "../controllers/wallet.controller.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// Protect all wallet routes with authentication
router.use(authenticate);

// Get wallet info (balance, status, virtual card)
router.get("/info", WalletController.getWalletInfo);

// Deposit funds
router.post("/deposit", WalletController.deposit);

// Withdraw funds
router.post("/withdraw", WalletController.withdraw);

// Transfer funds
router.post("/transfer", WalletController.transfer);

// Generate virtual card
router.post("/generate-card", WalletController.generateVirtualCard);

// Get transaction history
router.get("/transactions", WalletController.getTransactions);



router.post("/reveal-cvv", WalletController.revealCVV);

router.post('/verify-recipient',  WalletController.verifyRecipient);


export default router;