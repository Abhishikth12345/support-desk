
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const protect = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // 1. Read the authorization header
    const authHeader = req.headers.authorization;

    // 2. Check whether header exists
    if (!authHeader) {
        res.status(401).json({
            success: false,
            message: "Authentication required. Please login"
        });
        return;
    }

    // 3. Check Bearer format
    if (!authHeader.startsWith("Bearer ")) {
        res.status(401).json({
            success: false,
            message: "Invalid Authorization format"
        });
        return;
    }

    // 4. Extract JWT token
    const token = authHeader.slice(7).trim();

    // 5. Check whether token exists
    if (!token) {
        res.status(401).json({
            success: false,
            message: "Token is missing"
        });
        return;
    }

    // 6. Read JWT secret
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        res.status(500).json({
            success: false,
            message: "Authentication service configuration error"
        });
        return;
    }

    // 7. Verify JWT token
    try {
        const decoded = jwt.verify(token, jwtSecret);

        // Temporary debugging - remove after verification
        console.log("JWT verified successfully:", decoded);

        // Next: validate payload and attach user to req.user
        next();

    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
        return;
    }
};
