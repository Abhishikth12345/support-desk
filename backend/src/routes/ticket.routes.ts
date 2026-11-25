import { Router } from "express";
import {
  createTicket,
  getTickets,
  getTicketStats,
  getTicketById,
  updateTicketStatus,
  assignTicket,
} from "../controllers/ticket.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

router.use(protect);

router.post("/", createTicket);
router.get("/", getTickets);
router.get("/stats", getTicketStats);
router.get("/:id", getTicketById);
router.patch("/:id/status", authorize("admin", "manager", "agent"), updateTicketStatus);
router.patch("/:id/assign", authorize("admin", "manager", "agent"), assignTicket);

export default router;
