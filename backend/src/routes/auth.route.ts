import { Router } from "express";
import {
    registerUser,
    loginUser,
    getProfile,
    forgotPassword,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.get("/profile", protect, getProfile);

export default router;
