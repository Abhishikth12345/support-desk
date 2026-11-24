const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "agent" | "customer";
}

export interface TicketItem {
  _id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: "technical" | "billing" | "account" | "general" | "other";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "pending" | "resolved" | "closed";
  createdBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const setSession = (token: string, user: UserSession): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const getSessionUser = (): UserSession | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const clearSession = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string }> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        message: json.message || "An error occurred with your request",
      };
    }

    return {
      success: true,
      data: json,
    };
  } catch {
    return {
      success: false,
      message: "Network error. Please check server connection.",
    };
  }
}
