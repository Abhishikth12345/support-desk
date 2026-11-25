"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  Bot,
  Sparkles,
  X,
  Send,
  Loader2,
  Ticket,
  ChevronRight,
  MessageSquare,
  HelpCircle,
} from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  suggestedDraft?: {
    title: string;
    category: "technical" | "billing" | "account" | "general" | "other";
    priority: "low" | "medium" | "high" | "urgent";
    description: string;
  };
}

const QUICK_PROMPTS = [
  "How do I reset my password?",
  "What are your support SLAs?",
  "Report a payment or billing issue",
  "Report a technical bug or crash",
];

export default function ChatbotWidget() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I am your SupportDesk AI Assistant. Ask me anything about tickets, SLAs, account help, or describe your problem and I will draft a ticket for our team.",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    const res = await apiFetch<{
      reply: string;
      suggestedDraft?: ChatMessage["suggestedDraft"];
    }>("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    setLoading(false);

    if (res.success && res.data) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.data?.reply || "I am here to help.",
          suggestedDraft: res.data?.suggestedDraft,
        },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I could not reach the AI service right now. You can still create a ticket manually through the New Ticket button.",
        },
      ]);
    }
  };

  const handleApplyDraft = (draft: NonNullable<ChatMessage["suggestedDraft"]>) => {
    const params = new URLSearchParams({
      title: draft.title,
      category: draft.category,
      priority: draft.priority,
      description: draft.description,
    });
    setIsOpen(false);
    router.push(`/dashboard/tickets/new?${params.toString()}`);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold rounded-2xl shadow-xl shadow-indigo-900/40 border border-indigo-500/30 transition-all transform hover:scale-105 active:scale-95"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0c101a]" />
          </div>
          <span className="text-xs tracking-wide">AI Assistant</span>
          <Sparkles className="w-3.5 h-3.5 text-indigo-200 group-hover:rotate-12 transition" />
        </button>
      )}

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-white dark:bg-[#111622] border border-slate-200 dark:border-[#1f293d] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="px-4 py-3.5 bg-slate-50 dark:bg-[#0c101a] border-b border-slate-200 dark:border-[#1f293d] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>SupportDesk AI</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Instant answers &amp; ticket drafting</div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161c2c] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs bg-slate-50/50 dark:bg-transparent">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed whitespace-pre-wrap shadow-xs ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-white dark:bg-[#0c101a] border border-slate-200 dark:border-[#1f293d] text-slate-800 dark:text-slate-200 rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>

                {/* Suggested Ticket Draft Card */}
                {m.suggestedDraft && (
                  <div className="mt-2 w-[85%] p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-slate-800 dark:text-slate-200 space-y-2 shadow-xs">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Ready to draft a ticket?</span>
                    </div>
                    <div className="text-[11px] text-slate-700 dark:text-slate-300 font-medium line-clamp-2">
                      {m.suggestedDraft.title}
                    </div>
                    <button
                      onClick={() => handleApplyDraft(m.suggestedDraft!)}
                      className="w-full mt-1 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition shadow-sm shadow-indigo-600/20"
                    >
                      <span>Draft Ticket Now</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs py-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                <span>AI Assistant is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Prompt Chips */}
          <div className="p-2 border-t border-slate-200 dark:border-[#1f293d] bg-slate-50/80 dark:bg-[#0c101a]/60">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  disabled={loading}
                  onClick={() => handleSend(prompt)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-[#111622] hover:bg-slate-100 dark:hover:bg-[#161c2c] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-[#1f293d] transition disabled:opacity-50 shadow-xs"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-slate-200 dark:border-[#1f293d] bg-white dark:bg-[#0c101a] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question or describe an issue..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-[#1f293d] bg-slate-50/70 dark:bg-[#111622] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-40 transition shadow-sm"
              title="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
