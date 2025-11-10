// routes/admin.routes.js
import express from "express";
import AdminController from "../controllers/admin.controller.js";
import { authenticateAdmin } from "../middleware/authenticateAdmin.js"; // Add curly braces

const router = express.Router();

router.get("/pending-users", authenticateAdmin, AdminController.getPendingUsers);
router.patch("/approve/:userId", authenticateAdmin, AdminController.approveUser);
router.patch("/reject/:userId", authenticateAdmin, AdminController.rejectUser);
router.get("/active-users", authenticateAdmin, AdminController.getActiveUsers);
router.patch("/suspend/:userId", authenticateAdmin, AdminController.suspendUser);
router.delete("/user/:userId", authenticateAdmin, AdminController.deleteUser);
router.get("/suspended-users", authenticateAdmin, AdminController.getSuspendedUsers);
router.patch("/unsuspend/:userId", authenticateAdmin, AdminController.unsuspendUser);
router.get("/all-transactions", authenticateAdmin, AdminController.getAllTransactions);

export default router;