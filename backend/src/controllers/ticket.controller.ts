import type { Request, Response } from "express";
import mongoose from "mongoose";
import Ticket, {
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
} from "../models/Ticket.js";
import Counter from "../models/Counter.js";
import User from "../models/User.js";
import { sendTicketAssignmentEmail } from "../services/email.service.js";

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

const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

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
    } else if (req.query.assigned === "me" || (req.user.role === "agent" && req.query.assignedOnly === "true")) {
      filter.assignedTo = req.user.userId;
    } else if (req.query.assigned === "unassigned") {
      filter.assignedTo = null;
    }

    if (typeof req.query.status === "string" && VALID_STATUSES.includes(req.query.status as TicketStatus)) {
      filter.status = req.query.status;
    }

    if (typeof req.query.priority === "string" && VALID_PRIORITIES.includes(req.query.priority as TicketPriority)) {
      filter.priority = req.query.priority;
    }

    if (typeof req.query.category === "string" && VALID_CATEGORIES.includes(req.query.category as TicketCategory)) {
      filter.category = req.query.category;
    }

    const search = req.query.search;
    if (typeof search === "string" && search.trim().length > 0 && search.trim().length <= 100) {
      const escaped = escapeRegex(search.trim());
      filter.$or = [
        { ticketNumber: { $regex: escaped, $options: "i" } },
        { title: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
      ];
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const total = await Ticket.countDocuments(filter);
    const tickets = await Ticket.find(filter)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: tickets.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      tickets,
    });
  } catch (error) {
    console.error("Get tickets error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch tickets" });
  }
};

export const getTicketStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const baseFilter: Record<string, unknown> = {};
    if (req.user.role === "customer") {
      baseFilter.createdBy = req.user.userId;
    } else if (req.user.role === "agent" && req.query.assignedOnly === "true") {
      baseFilter.assignedTo = req.user.userId;
    }

    const [total, open, inProgress, pending, resolved, closed] = await Promise.all([
      Ticket.countDocuments(baseFilter),
      Ticket.countDocuments({ ...baseFilter, status: "open" }),
      Ticket.countDocuments({ ...baseFilter, status: "in_progress" }),
      Ticket.countDocuments({ ...baseFilter, status: "pending" }),
      Ticket.countDocuments({ ...baseFilter, status: "resolved" }),
      Ticket.countDocuments({ ...baseFilter, status: "closed" }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        open,
        inProgress,
        pending,
        resolved,
        closed,
      },
    });
  } catch (error) {
    console.error("Get ticket stats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch ticket stats" });
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

    if (agentId !== null && agentId !== undefined && agentId !== "") {
      const resolvedId = agentId === "me" ? req.user?.userId : agentId;

      if (!resolvedId || !mongoose.isValidObjectId(resolvedId)) {
        res.status(400).json({ success: false, message: "Invalid agent ID" });
        return;
      }

      if (req.user?.role === "agent" && resolvedId !== req.user.userId) {
        res.status(403).json({
          success: false,
          message: "Agents may only claim tickets for themselves",
        });
        return;
      }

      const agent = await User.findById(resolvedId);
      if (!agent || (agent.role !== "agent" && agent.role !== "admin" && agent.role !== "manager")) {
        res.status(400).json({
          success: false,
          message: "Assigned user must be an active agent, manager, or admin",
        });
        return;
      }

      targetAgentId = agent._id.toString();
    } else {
      if (req.user?.role === "agent") {
        res.status(403).json({
          success: false,
          message: "Only managers and admins can unassign tickets",
        });
        return;
      }
    }

    const currentTicket = await Ticket.findById(id);
    if (!currentTicket) {
      res.status(404).json({ success: false, message: "Ticket not found" });
      return;
    }

    const updateData: Record<string, unknown> = { assignedTo: targetAgentId };
    if (targetAgentId && currentTicket.status === "open") {
      updateData.status = "in_progress";
    } else if (!targetAgentId && currentTicket.status === "in_progress") {
      updateData.status = "open";
    }

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role");

    if (!ticket) {
      res.status(404).json({ success: false, message: "Ticket not found" });
      return;
    }

    // Send assignment notification email asynchronously
    if (
      targetAgentId &&
      ticket.assignedTo &&
      typeof ticket.assignedTo === "object" &&
      "email" in ticket.assignedTo
    ) {
      const assigned = ticket.assignedTo as unknown as { name: string; email: string };
      sendTicketAssignmentEmail({
        to: assigned.email,
        agentName: assigned.name,
        ticketNumber: ticket.ticketNumber,
        title: ticket.title,
        priority: ticket.priority,
        category: ticket.category,
        ticketId: ticket._id.toString(),
      }).catch((err) => console.error("Ticket assignment email error:", err));
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
