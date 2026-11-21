import type { Request, Response } from "express"

export const getAdminDashboard = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({
        success: true,
        message: "Welcome to Admin Dashboard",
        user: {
            userId: req.user?.userId,
            name: req.user?.name,
            role: req.user?.role
        }
    })
}