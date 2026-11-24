import type { Request, Response } from "express";
import mongoose from "mongoose";
import Ticket, {
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
} from "../models/Ticket.js";
import Counter from "../models/Counter.js";
import User from "../models/User.js";

const VALID_CATEGORIES: TicketCategory[] = [
  "technical",
  "billing",
  "account",
  "general",
  "other",
];

const VALID_PRIORITIES: TicketPriority[] = ["low", "medium", "high", "urgent"];

const VALID_STATUSES: TicketStatus[] = [
  "open",
  "in_progress",
  "pending",
  "resolved",
  "closed",
];

export const createTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const { title, description, category, priority } = req.body;

    if (
      typeof title !== "string" ||
      typeof description !== "string" ||
      title.trim().length < 3 ||
      title.trim().length > 100 ||
      !description.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Title (3-100 characters) and description are required",
      });
      return;
    }

    const normalizedCategory = VALID_CATEGORIES.includes(category)
      ? category
      : "general";

    const normalizedPriority = VALID_PRIORITIES.includes(priority)
      ? priority
      : "medium";

    const currentYear = new Date().getFullYear();
    const counter = await Counter.findByIdAndUpdate(
      `ticket_${currentYear}`,
      { $inc: { sequence: 1 } },
      { new: true, upsert: true }
    );

    const ticketNumber = `SD-${currentYear}-${String(counter.sequence).padStart(5, "0")}`;

    const ticket = await Ticket.create({
      ticketNumber,
      title: title.trim(),
      description: description.trim(),
      category: normalizedCategory,
      priority: normalizedPriority,
      status: "open",
      createdBy: req.user.userId,
      assignedTo: null,
    });

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticket,
    });
  } catch (error) {
    console.error("Create ticket error:", error);
    res.status(500).json({ success: false, message: "Failed to create ticket" });
  }
};

export const getTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const filter: Record<string, unknown> = {};

    if (req.user.role === "customer") {
      filter.createdBy = req.user.userId;
    } else if (req.user.role === "agent" && req.query.assignedOnly === "true") {
      filter.assignedTo = req.user.userId;
    }

    if (typeof req.query.status === "string" && VALID_STATUSES.includes(req.query.status as TicketStatus)) {
      filter.status = req.query.status;
    }

    if (typeof req.query.priority === "string" && VALID_PRIORITIES.includes(req.query.priority as TicketPriority)) {
      filter.priority = req.query.priority;
    }

    const tickets = await Ticket.find(filter)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("Get tickets error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch tickets" });
  }
};

export const getTicketById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ success: false, message: "Invalid ticket ID" });
      return;
    }

    const ticket = await Ticket.findById(id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role");

    if (!ticket) {
      res.status(404).json({ success: false, message: "Ticket not found" });
      return;
    }

    if (
      req.user.role === "customer" &&
      ticket.createdBy._id.toString() !== req.user.userId
    ) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    res.status(200).json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error("Get ticket by ID error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch ticket" });
  }
};

export const updateTicketStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ success: false, message: "Invalid ticket ID" });
      return;
    }

    if (!VALID_STATUSES.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
      return;
    }

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role");

    if (!ticket) {
      res.status(404).json({ success: false, message: "Ticket not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Ticket status updated",
      ticket,
    });
  } catch (error) {
    console.error("Update ticket status error:", error);
    res.status(500).json({ success: false, message: "Failed to update ticket status" });
  }
};

export const assignTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ success: false, message: "Invalid ticket ID" });
      return;
    }

    let targetAgentId: string | null = null;

    if (agentId !== null && agentId !== undefined) {
      if (!mongoose.isValidObjectId(agentId)) {
        res.status(400).json({ success: false, message: "Invalid agent ID" });
        return;
      }

      const agent = await User.findById(agentId);
      if (!agent || (agent.role !== "agent" && agent.role !== "admin")) {
        res.status(400).json({
          success: false,
          message: "Assigned user must be an active agent or admin",
        });
        return;
      }

      targetAgentId = agent._id.toString();
    }

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { assignedTo: targetAgentId },
      { new: true }
    )
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role");

    if (!ticket) {
      res.status(404).json({ success: false, message: "Ticket not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Ticket assigned successfully",
      ticket,
    });
  } catch (error) {
    console.error("Assign ticket error:", error);
    res.status(500).json({ success: false, message: "Failed to assign ticket" });
  }
};
