
/* 2. src/middleware/auth.middleware.ts
Your middleware currently performs these checks:
Step	Responsibility	Status
1	Read Authorization header	Correct
2	Check Bearer format	Correct
3	Extract token	Correct
4	Reject empty token	Correct
5	Check JWT secret	Correct
6	Verify token	Correct
7	Attach authenticated user to request	Missing

The important missing part
Currently, after verification, you call:
const decoded = jwt.verify(token, jwtSecret);

console.log("JWT verified successfully:", decoded);

next();


jwt.verify() confirms that the token is valid and has not expired. It also returns the decoded payload.

Your token contains:
{
    userId: "...",
    role: "customer"
}


But you are not saving this information anywhere accessible to the next controller.

3. Understand what happens now
Authentication flow
Client

Sends JWT in Authorization header


protect middleware

Checks token and verifies signature and expiry


req.user

userId + role attached to request


Controller

Can access req.user.userId and req.user.role


For example, a protected controller can now access:
export const getProfile = (
    req: Request,
    res: Response
): void => {
    res.status(200).json({
        success: true,
        userId: req.user?.userId,
        role: req.user?.role,
    });
};

4. Important concepts to understand
- JWT signing: Creates a token using a secret.
- JWT verification: Checks whether the token's signature is valid and whether it has expired.
- Decoded payload: Gives us the information stored inside the token.
- Request augmentation: Extends Express's TypeScript request type.
- req.user: Carries the authenticated user's information to subsequent middleware and controllers.
- next(): Passes execution to the next middleware or controller.

One security consideration for later: this middleware trusts the role stored in the signed token. If an administrator changes a user's role or deactivates their account, an already-issued token can remain valid until it expires. We can address that with a database-backed authentication check when we cover production authentication.

*/



import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { UserRole } from "../models/User.js";

const isUserRole = (role: unknown): role is UserRole => {
    return (
        role === "admin" ||
        role === "manager" ||
        role === "agent" ||
        role === "customer"
    );
};

export const protect = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({
            success: false,
            message: "Authentication required. Please login",
        });
        return;
    }

    if (!authHeader.startsWith("Bearer ")) {
        res.status(401).json({
            success: false,
            message: "Invalid Authorization format",
        });
        return;
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
        res.status(401).json({
            success: false,
            message: "Token is missing",
        });
        return;
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        res.status(500).json({
            success: false,
            message: "Authentication service configuration error",
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);

        if (
            typeof decoded === "string" ||
            typeof decoded.userId !== "string" ||
            typeof decoded.name !== "string" ||
            !isUserRole(decoded.role)
        ) {
            res.status(401).json({
                success: false,
                message: "Invalid token payload",
            });
            return;
        }

        req.user = {
            userId: decoded.userId,
            role: decoded.role,
            name: decoded.name
        };

        next();

    } catch {
        res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};