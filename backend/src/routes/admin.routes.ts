import { Router } from "express";
import { getAdminDashboard, getAgents } from "../controllers/admin.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

router.get("/dashboard", protect, authorize("admin"), getAdminDashboard);
router.get("/agents", protect, authorize("admin", "manager"), getAgents);

export default router;
