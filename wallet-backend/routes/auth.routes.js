import express from "express";
import AuthController from "../controllers/auth.controller.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/register", upload.single("idCardImage"), AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);

export default router;