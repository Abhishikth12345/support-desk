import { Router } from "express";
import { chatWithAi, draftTicketFromPrompt } from "../controllers/ai.controller.js";

const router = Router();

// Allow support desk chat and ticket drafting
router.post("/chat", chatWithAi);
router.post("/draft", draftTicketFromPrompt);

export default router;