import express from "express";
import { login, register } from "../controllers/authController.js";

const router = express.Router();

// Route login admin
router.post("/login", login);

// Route register admin
router.post("/register", register);

export default router;

