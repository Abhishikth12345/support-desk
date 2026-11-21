import { Router } from "express";

import { getAdminDashboard } from "../controllers/admin.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

router.get("/dashboard", protect, authorize("admin"), getAdminDashboard);

export default router;