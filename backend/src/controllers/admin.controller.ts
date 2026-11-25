import type { Request, Response } from "express";
import User from "../models/User.js";

export const getAdminDashboard = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({
        success: true,
        message: "Welcome to Admin Dashboard",
        user: {
            userId: req.user?.userId,
            name: req.user?.name,
            role: req.user?.role,
        },
    });
};

export const getAgents = async (req: Request, res: Response): Promise<void> => {
    try {
        const agents = await User.find({
            role: { $in: ["agent", "admin"] },
            isActive: true,
        })
            .select("name email role _id")
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            agents,
        });
    } catch (error) {
        console.error("Get agents error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch agents",
        });
    }
};
