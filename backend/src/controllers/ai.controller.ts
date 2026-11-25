import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface TicketDraft {
  title: string;
  category: "technical" | "billing" | "account" | "general" | "other";
  priority: "low" | "medium" | "high" | "urgent";
  description: string;
}

const extractTicketDraft = (query: string): TicketDraft | undefined => {
  const q = query.toLowerCase().trim();

  const wantsTicketExplicitly =
    q.includes("create ticket") ||
    q.includes("file ticket") ||
    q.includes("submit ticket") ||
    q.includes("draft ticket") ||
    q.includes("open ticket");

  const isRealProblem =
    q.includes("error") ||
    q.includes("crash") ||
    q.includes("bug") ||
    q.includes("broken") ||
    q.includes("not working") ||
    q.includes("doesn't work") ||
    q.includes("failed to") ||
    q.includes("cannot access") ||
    q.includes("can't access") ||
    q.includes("cannot login") ||
    q.includes("can't login") ||
    q.includes("payment failed") ||
    q.includes("charged twice") ||
    q.includes("refund request") ||
    q.includes("service down") ||
    q.includes("500 error") ||
    q.includes("404 error");

  const isQuestionOrChat =
    q.startsWith("where") ||
    q.startsWith("why") ||
    q.startsWith("how to") ||
    q.startsWith("how can") ||
    q.startsWith("how do") ||
    q.startsWith("what is") ||
    q.startsWith("what are") ||
    q.startsWith("who is") ||
    q.startsWith("tell me") ||
    q.startsWith("can you") ||
    q.startsWith("may i know") ||
    q === "hi" ||
    q === "hello" ||
    q === "hey";

  // Suppress ticket drafting for informational questions or meta questions unless explicitly requested
  if (!wantsTicketExplicitly) {
    if (!isRealProblem || isQuestionOrChat) {
      return undefined;
    }
  }

  let category: TicketDraft["category"] = "general";
  let priority: TicketDraft["priority"] = "medium";

  if (q.includes("bill") || q.includes("payment") || q.includes("invoice") || q.includes("charge") || q.includes("refund")) {
    category = "billing";
    priority = "high";
  } else if (q.includes("password") || q.includes("login") || q.includes("account") || q.includes("auth")) {
    category = "account";
    priority = "medium";
  } else if (q.includes("error") || q.includes("crash") || q.includes("bug") || q.includes("500") || q.includes("404") || q.includes("down")) {
    category = "technical";
    priority = q.includes("down") || q.includes("critical") ? "urgent" : "high";
  }

  const cleanTitle = query.replace(/[?.,!]/g, "").trim();
  const title = cleanTitle.length > 50 ? cleanTitle.slice(0, 47) + "..." : cleanTitle;

  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    category,
    priority,
    description: query,
  };
};

export const chatWithAi = async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages } = req.body as { messages?: ChatMessage[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ success: false, message: "Messages array is required" });
      return;
    }

    // 1. Resolve logged-in user context from JWT token if available
    let loggedInName = "Customer";
    let loggedInRole = "customer";
    let loggedInId = "";
    let isAuthenticated = false;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7).trim();
      const jwtSecret = process.env.JWT_SECRET;
      if (token && jwtSecret) {
        try {
          const decoded = jwt.verify(token, jwtSecret) as { name?: string; role?: string; userId?: string };
          if (decoded && decoded.name) {
            loggedInName = decoded.name;
            loggedInRole = decoded.role || "customer";
            loggedInId = decoded.userId || "";
            isAuthenticated = true;
          }
        } catch {
          // Token expired or invalid
        }
      }
    }

    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    const userQuery = lastUserMessage?.content?.trim() || "";
    const lowerQuery = userQuery.toLowerCase();

    // 2. Prepare user context for the system prompt
    const userContextStr = isAuthenticated
      ? `CURRENT LOGGED IN USER CONTEXT:
- Name: ${loggedInName}
- Role: ${loggedInRole}
- User ID: ${loggedInId}
Status: Authenticated`
      : "CURRENT USER CONTEXT: Guest / Unauthenticated visitor";

    const systemInstruction = `You are SupportDesk AI, the intelligent, dedicated customer support assistant for the SupportDesk platform.
${userContextStr}

CRITICAL RULES:
1. When the user asks for their name (e.g., "may i know my name?", "what is my name?"):
   Answer directly: "Your name is ${loggedInName}."
2. When the user asks for their role (e.g., "may i know my user role?", "what role do I have?"):
   Answer directly: "Your current user role is '${loggedInRole}'."
3. When the user asks how to create a team member or add a user:
   - Explain that creating team members requires an Administrator account.
   ${
     loggedInRole === "admin"
       ? `- Since you are logged in as an Admin (${loggedInName}), you can add team members directly by clicking "Team Management" in the sidebar and choosing "+ Add Team Member".`
       : `- Since your account role is "${loggedInRole}", you do not have administrative privileges. You need to sign in with an Administrator account to access the "Team Management" section and add staff members.`
   }
4. When the user says "hi", "hello", "hey":
   Respond warmly: "Hello ${loggedInName}! How can I assist you with SupportDesk today?"
5. For support issues, provide concise troubleshooting and offer to draft a ticket.
Keep answers professional, friendly, and concise.`;

    let aiReply: string | null = null;

    // 3. Try Google Gemini API if configured
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: `${systemInstruction}\n\nUser: ${userQuery}` }],
                },
              ],
            }),
          }
        );

        if (response.ok) {
          const data = (await response.json()) as {
            candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
          };
          aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || null;
        }
      } catch (err) {
        console.warn("Gemini call error:", err);
      }
    }

    // 4. Try Live Neural LLM endpoint (trimming history to last 6 messages for fast response)
    if (!aiReply) {
      try {
        const recentMessages = messages.slice(-6).map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        }));

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const response = await fetch("https://text.pollinations.ai/openai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            model: "openai",
            messages: [
              { role: "system", content: systemInstruction },
              ...recentMessages,
            ],
          }),
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = (await response.json()) as {
            choices?: Array<{ message?: { content?: string } }>;
          };
          aiReply = data.choices?.[0]?.message?.content || null;
        }
      } catch (err) {
        console.warn("Live Neural LLM primary error:", err);
      }
    }

    // 4b. Secondary fast fallback to plain-text Neural LLM if primary timed out
    if (!aiReply) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const cleanPrompt = `${systemInstruction}\n\nUser Question: ${userQuery}`;
        const response = await fetch(
          `https://text.pollinations.ai/${encodeURIComponent(cleanPrompt)}`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (response.ok) {
          const text = await response.text();
          if (text && text.trim().length > 0 && !text.includes("<!DOCTYPE") && !text.includes("<html>")) {
            aiReply = text.trim();
          }
        }
      } catch (err) {
        console.warn("Secondary LLM fallback error:", err);
      }
    }

    // 5. Intelligent contextual fallback if external network is completely unreachable
    if (!aiReply) {
      if (lowerQuery.includes("name")) {
        aiReply = `Your name is ${loggedInName}.`;
      } else if (lowerQuery.includes("role")) {
        aiReply = `Your current user role is "${loggedInRole}". ${
          loggedInRole === "customer"
            ? "As a customer, you can submit tickets and track their real-time resolution status."
            : "As an admin, you have full access to manage team members and assign tickets."
        }`;
      } else if (lowerQuery.includes("team member") || lowerQuery.includes("create user")) {
        aiReply = loggedInRole === "admin"
          ? `Here is how to create a team member:\n1. Click "Team Management" in the sidebar\n2. Click "+ Add Team Member"\n3. Enter their name, email, role, and temporary password\n4. Click "Create Account" to save`
          : `Creating team members is restricted to Administrators. Your current role is "${loggedInRole}". Please sign in with an Administrator account to access the Team Management panel.`;
      } else if (lowerQuery.includes("where do you get") || lowerQuery.includes("how do you know") || lowerQuery.includes("source") || lowerQuery.includes("who are you")) {
        aiReply = `I am SupportDesk AI, powered by a neural Large Language Model trained on software engineering, cloud infrastructure, and IT service desk best practices. When you ask about DevOps, CI/CD, or ticketing, I synthesize industry documentation and SupportDesk workflows in real time to assist you.`;
      } else if (lowerQuery.includes("devops")) {
        aiReply = `DevOps workflows in SupportDesk include automating ticket routing based on CI/CD build failures, managing production incident SLAs, and connecting monitoring alerts directly to engineering queues. How can I assist you with your DevOps setup?`;
      } else if (lowerQuery === "hi" || lowerQuery === "hello" || lowerQuery.startsWith("hi ")) {
        aiReply = `Hello ${loggedInName}! How can I help you with SupportDesk today?`;
      } else {
        aiReply = `Hello ${loggedInName}! I can answer questions about SupportDesk features, SLAs, tickets, and account permissions. How can I help you today?`;
      }
    }

    const suggestedDraft = extractTicketDraft(userQuery);

    res.status(200).json({
      success: true,
      reply: aiReply,
      suggestedDraft,
    });
  } catch (error) {
    console.error("AI chat error:", error);
    res.status(500).json({ success: false, message: "AI assistant service unavailable" });
  }
};

export const draftTicketFromPrompt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body as { prompt?: string };

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      res.status(400).json({ success: false, message: "Prompt is required" });
      return;
    }

    const draft = extractTicketDraft(prompt.trim()) || {
      title: prompt.trim().slice(0, 50),
      category: "general",
      priority: "medium",
      description: prompt.trim(),
    };

    res.status(200).json({
      success: true,
      draft,
    });
  } catch (error) {
    console.error("Draft ticket error:", error);
    res.status(500).json({ success: false, message: "Failed to generate ticket draft" });
  }
};
