import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Loader2, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import HRLayout from "@/components/HRLayout";
import { Employee } from "@/data/mockEmployees";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  confidence?: "high" | "low";
  escalated?: boolean;
}

const mockResponses: Record<string, { content: string; confidence: "high" | "low" }> = {
  wfh: { content: "📋 **Work From Home Policy**\n\nOur WFH policy allows employees to work remotely up to 3 days per week.\n\n- **Eligibility:** All full-time employees after probation\n- **Core hours:** 10 AM – 4 PM local timezone\n- **Equipment:** Laptop and one monitor provided\n- **Approval:** Coordinate with your direct manager", confidence: "high" },
  pto: { content: "🏖️ **PTO Balance**\n\n- **Available:** 14 days remaining\n- **Used this year:** 6 days\n- **Pending requests:** None\n- **Accrual rate:** 1.67 days/month\n\nNext accrual: **March 15, 2026**.", confidence: "high" },
  enrollment: { content: "💊 **Open Enrollment**\n\nNext window: **November 1–15, 2026**. You can change plans, add dependents, and adjust FSA/HSA contributions.", confidence: "high" },
  pay: { content: "💰 **Payroll Info**\n\nNext pay date: **March 15, 2026** (bi-weekly).\n- Direct deposit: Active ✅\n- W-2 for 2025 available in HR Portal", confidence: "high" },
  expense: { content: "🧾 **Expense Submission**\n\n1. HR Portal → Expenses → New Report\n2. Upload receipts\n3. Categorize expenses\n4. Submit for approval\n\n**Limits:** Meals $50/day, travel >$500 needs pre-approval", confidence: "high" },
  default: { content: "I'm not fully confident in answering this. Let me **escalate to HR Ops** — you'll get a response within 24 hours.\n\n🔄 **Escalated to HR Team**", confidence: "low" },
};

function getResponse(input: string) {
  const lower = input.toLowerCase();
  if (lower.includes("wfh") || lower.includes("work from home") || lower.includes("remote")) return mockResponses.wfh;
  if (lower.includes("pto") || lower.includes("time off") || lower.includes("leave") || lower.includes("vacation")) return mockResponses.pto;
  if (lower.includes("enrollment") || lower.includes("benefit") || lower.includes("insurance")) return mockResponses.enrollment;
  if (lower.includes("pay") || lower.includes("salary") || lower.includes("payroll")) return mockResponses.pay;
  if (lower.includes("expense") || lower.includes("reimburs")) return mockResponses.expense;
  return mockResponses.default;
}

const suggestedQueries = [
  "What's my holiday balance?",
  "Who is my manager?",
  "Remote work policy",
];

function ChatContent({ selectedEmployee }: { selectedEmployee: Employee | null }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: msg, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getResponse(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.content,
          timestamp: new Date(),
          confidence: response.confidence,
          escalated: response.confidence === "low",
        },
      ]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  const employeeName = selectedEmployee?.name?.split(" ")[0] ?? "there";

  return (
    <div className="flex flex-col h-screen">
      {/* Blue Header Banner */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-8 py-6 rounded-b-2xl mx-4 mt-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">😊</span>
          <h1 className="text-xl font-bold">HR Assistant</h1>
        </div>
        <p className="text-primary-foreground/80 text-sm">
          Hello, {employeeName}! I'm here to help with HR questions, time-off requests, policies, and more.
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-semibold mb-1">👋 Welcome to HR Assistant</p>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              Ask about time off, compensation, team info, policies, or company events.
            </p>
            <div className="flex gap-2 flex-wrap justify-center">
              {suggestedQueries.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="text-xs px-3 py-1.5 rounded-full border bg-card hover:bg-muted transition-colors text-muted-foreground"
                >
                  Try: "{q}"
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
          >
            {msg.role === "assistant" && (
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex-shrink-0 flex items-center justify-center mt-0.5">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              <div className="whitespace-pre-wrap">
                {msg.content.split(/(\*\*.*?\*\*)/).map((part, i) =>
                  part.startsWith("**") && part.endsWith("**") ? (
                    <strong key={i}>{part.slice(2, -2)}</strong>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
              </div>
              {msg.escalated && (
                <div className="mt-2 px-2 py-1 rounded bg-warning/10 text-warning text-xs font-medium">
                  ⚠ Low confidence — Escalated to HR
                </div>
              )}
            </div>
            {msg.role === "user" && (
              <div className="h-8 w-8 rounded-lg bg-secondary flex-shrink-0 flex items-center justify-center mt-0.5">
                <User className="h-4 w-4 text-secondary-foreground" />
              </div>
            )}
          </motion.div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-muted rounded-xl px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <div className="text-center py-2 text-xs text-muted-foreground">
        <p>HR Assistant · Powered by PingHR</p>
        <p>© 2026 ACME Corporation · Internal Use Only</p>
      </div>

      {/* Input */}
      <div className="border-t px-8 py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question here..."
            className="w-full rounded-xl border bg-background px-4 py-3.5 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <HRLayout>
      {(selectedEmployee) => <ChatContent selectedEmployee={selectedEmployee} />}
    </HRLayout>
  );
}
