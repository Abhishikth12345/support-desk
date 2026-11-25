import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";

export const registerUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { name, email, password } = req.body;

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

        if (password.length < 8) {
            res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters",
            });
            return;
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            res.status(409).json({
                success: false,
                message: "Email already exists",
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "customer",
        });

        res.status(201).json({
            success: true,
            message: "Registration successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
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
            message: "Internal Server Error",
        });
    }
};

export const loginUser = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { email, password } = req.body;

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

        const normalizedEmail = email.trim().toLowerCase();

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

        if (!user.isActive) {
            res.status(403).json({
                success: false,
                message: "Your account is inactive",
            });
            return;
        }

        const token = generateToken(
            user._id.toString(),
            user.role,
            user.name
        );

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
            name: req.user?.name,
        },
    });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        if (typeof email !== "string" || !email.trim()) {
            res.status(400).json({
                success: false,
                message: "Email is required",
            });
            return;
        }

        const normalizedEmail = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            res.status(400).json({
                success: false,
                message: "Please provide a valid email address",
            });
            return;
        }

        if (mongoose.connection.readyState === 1) {
            await User.findOne({ email: normalizedEmail });
        }

        res.status(200).json({
            success: true,
            message: "If an account with that email exists, password reset instructions have been sent.",
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
