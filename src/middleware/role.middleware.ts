
import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "../models/User.js";

export const authorize = (...allowedRoles: UserRole[]) => {

    return (req: Request, res: Response, next: NextFunction): void => {

        // 1. Check whether authenticated user exists
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: "Authentication is required"
            });
            return;
        }

        // 2. Check whether user's role is allowed
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: "You do not have permission to access this resource"
            });
            return;
        }

        // 3. User is authorized
        next();
    };
};
