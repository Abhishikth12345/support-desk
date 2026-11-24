
/* 1. src/utils/jwt.ts
What is correct
- Reads JWT_SECRET from environment variables.
- Stops the application if the secret is missing.
- Uses JWT_EXPIRES_IN, defaulting to "1d".
- Includes userId and role in the token payload.
- Uses jwt.sign() to generate the token.
Your login controller calls:
const token = generateToken(
    user._id.toString(),
    user.role
);


That matches the utility's function signature.

One improvement to consider later: avoid using a TypeScript type assertion for the expiration value:
expiresIn: expiresIn as SignOptions["expiresIn"]


This assertion tells TypeScript to trust the value, but it does not validate the environment variable at runtime. We can add proper environment validation later.

For now, this is acceptable for learning and local development. */



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
    role: UserRole,
    name: string
): string => {

    const options: SignOptions = {
        expiresIn: expiresIn as SignOptions["expiresIn"]
    };

    return jwt.sign(
        { userId, role, name },
        jwtSecret,
        options
    );
};