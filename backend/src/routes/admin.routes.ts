import { Router } from "express";
import {
    getAdminDashboard,
    getAgents,
    getUsersByAdmin,
    createUserByAdmin,
    updateUserRole,
} from "../controllers/admin.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

router.get("/dashboard", protect, authorize("admin"), getAdminDashboard);
router.get("/agents", protect, authorize("admin", "manager"), getAgents);
router.get("/users", protect, authorize("admin"), getUsersByAdmin);
router.post("/users", protect, authorize("admin"), createUserByAdmin);
router.patch("/users/:id/role", protect, authorize("admin"), updateUserRole);

export default router;
