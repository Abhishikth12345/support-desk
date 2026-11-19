import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import type { UserRole } from "../models/User.js";

// Read JWT secret from environment variables
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
}

// Read token expiration from environment variables
const expiresIn = process.env.JWT_EXPIRES_IN || "1d";

// Generate JWT token
export const generateToken = (
    userId: string,
    role: UserRole
): string => {

    const options: SignOptions = {
        expiresIn: expiresIn as SignOptions["expiresIn"]
    };

    return jwt.sign(
        { userId, role },
        jwtSecret,
        options
    );
};