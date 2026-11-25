import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User, { type UserRole } from "../models/User.js";
import { sendWelcomeCredentialsEmail } from "../services/email.service.js";

const VALID_ROLES: UserRole[] = ["admin", "manager", "agent", "customer"];

const escapeRegex = (string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

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
            role: { $in: ["agent", "manager", "admin"] },
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

export const createUserByAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role } = req.body;

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

        if (!role || !VALID_ROLES.includes(role as UserRole)) {
            res.status(400).json({
                success: false,
                message: "Invalid role specified. Allowed: admin, manager, agent, customer",
            });
            return;
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            res.status(409).json({
                success: false,
                message: "A user with this email already exists",
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: role as UserRole,
            isActive: true,
        });

        // Dispatch credentials and role notification email
        sendWelcomeCredentialsEmail({
            to: newUser.email,
            name: newUser.name,
            role: newUser.role,
            password,
            isCreatedByAdmin: true,
        }).catch((err) => console.error("Admin user creation email dispatch error:", err));

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                isActive: newUser.isActive,
                createdAt: newUser.createdAt,
            },
        });
    } catch (error) {
        console.error("Create user error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create user",
        });
    }
};

export const getUsersByAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const filter: Record<string, unknown> = {};

        if (typeof req.query.role === "string" && VALID_ROLES.includes(req.query.role as UserRole)) {
            filter.role = req.query.role;
        }

        const search = req.query.search;
        if (typeof search === "string" && search.trim().length > 0 && search.trim().length <= 100) {
            const escaped = escapeRegex(search.trim());
            filter.$or = [
                { name: { $regex: escaped, $options: "i" } },
                { email: { $regex: escaped, $options: "i" } },
            ];
        }

        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
        const skip = (page - 1) * limit;

        const total = await User.countDocuments(filter);
        const users = await User.find(filter)
            .select("name email role isActive createdAt updatedAt")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            page,
            pages: Math.ceil(total / limit) || 1,
            users,
        });
    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch users",
        });
    }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
            return;
        }

        if (!role || !VALID_ROLES.includes(role as UserRole)) {
            res.status(400).json({
                success: false,
                message: "Invalid role specified",
            });
            return;
        }

        if (req.user?.userId === id && role !== "admin") {
            res.status(400).json({
                success: false,
                message: "Cannot demote your own admin account",
            });
            return;
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { role: role as UserRole },
            { new: true }
        ).select("name email role isActive createdAt updatedAt");

        if (!updatedUser) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: `User role updated to ${role}`,
            user: updatedUser,
        });
    } catch (error) {
        console.error("Update user role error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update user role",
        });
    }
};
