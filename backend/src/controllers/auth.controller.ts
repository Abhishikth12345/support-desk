
/* 2. Authentication controller review
You have implemented two important APIs.
A. Registration API
Implemented
Endpoint:
POST /api/auth/register


Your registration flow:
Receive registration request


Validate name, email and password


Normalize email


Check existing user


Hash password using bcrypt


Create customer account in MongoDB


201 Created
Return user information


Something you implemented correctly
const hashedPassword = await bcrypt.hash(password, 12);


Here, 12 is the bcrypt cost factor.

bcrypt uses this factor to control the computational effort required for hashing.

You also correctly prevent users from choosing their own role during public registration:
role: "customer"


This prevents someone from submitting:
{
  "name": "Test",
  "email": "test@example.com",
  "password": "Password123",
  "role": "admin"
}


and becoming an administrator through public registration.

Excellent decision. */

/* B. Login API
Implemented
Endpoint:
POST /api/auth/login


Your login flow:
1. Receive email and password.
2. Validate required fields.
3. Normalize email.
4. Find the user in MongoDB.
5. Retrieve the password hash.
6. Compare the submitted password using bcrypt.
7. Check whether the account is active.
8. Generate JWT.
9. Return the token and user details.
Your password comparison is correct:
const isPasswordValid = await bcrypt.compare(
    password,
    user.password
);


Remember:
- Registration hashes the password.
- Login compares the plain-text submitted password against the stored hash.
- You never need to decrypt a bcrypt password.
*/


import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";

export const registerUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        //1. Extract data from request body
        const { name, email, password } = req.body;

        //2. Validate required fields
        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !password
        ) {
            res.status(400).json({
                success: false,
                message: "Name, email and password are required",
            });
            return;
        }

        //3. Validate password length
        if (password.length < 8) {
            res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters",
            });
            return;
        }

        const normalizedEmail = email.trim().toLowerCase();

        //4. check whether the email already exists
        const existingUser = await User.findOne({
            email: normalizedEmail
        })

        if (existingUser) {
            res.status(409).json({
                success: false,
                message: "Email already exists"
            });
            return;
        }

        //5. Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        //6. Creates Customer account
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "customer"
        });

        //7. Send response
        res.status(201).json({
            success: true,
            message: "Registration successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        // Handle duplicate email race conditions
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === 11000
        ) {
            res.status(409).json({
                success: false,
                message: "Email already registered",
            });
            return;
        }

        console.error("Registration error:", error);


        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


export const loginUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        // 1. Extract email and password
        const { email, password } = req.body;

        // 2. Validate required fields
        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
            return;
        }

        // 3. Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // 4. Find user and retrieve password hash
        const user = await User.findOne({
            email: normalizedEmail,
        }).select("+password");

        if (!user) {
            res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
            return;
        }

        // 5. Compare submitted password with stored hash
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
            return;
        }

        // 6. Check whether account is active
        if (!user.isActive) {
            res.status(403).json({
                success: false,
                message: "Your account is inactive",
            });
            return;
        }

        // 7. Generate JWT token
        const token = generateToken(
            user._id.toString(),
            user.role,
            user.name
        );

        // 8. Return login response
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
            },
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({
        success: true,
        message: "Profile fetched successfully",
        user: {
            userId: req.user?.userId,
            role: req.user?.role,
            name: req.user?.name
        }
    })
}