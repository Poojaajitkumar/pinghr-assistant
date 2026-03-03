import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  confidence?: "high" | "low";
  escalated?: boolean;
}

const mockResponses: Record<string, { content: string; confidence: "high" | "low" }> = {
  wfh: { content: "📋 **Work From Home Policy**\n\nOur WFH policy allows employees to work remotely up to 3 days per week.\n\n- **Eligibility:** All full-time employees after probation\n- **Core hours:** 10 AM – 4 PM local timezone\n- **Equipment:** Laptop and one monitor provided\n- **Approval:** Coordinate with your direct manager\n\nWould you like more details?", confidence: "high" },
  pto: { content: "🏖️ **Your PTO Balance**\n\n- **Available:** 14 days remaining\n- **Used this year:** 6 days\n- **Pending requests:** None\n- **Accrual rate:** 1.67 days/month\n\nNext accrual: **March 15, 2026**. Want to submit a request?", confidence: "high" },
  enrollment: { content: "💊 **Open Enrollment**\n\nNext window: **November 1–15, 2026**. You can change plans, add dependents, and adjust FSA/HSA contributions.", confidence: "high" },
  pay: { content: "💰 **Payroll Info**\n\nNext pay date: **March 15, 2026** (bi-weekly).\n- Direct deposit: Active ✅\n- W-2 for 2025 available in HR Portal", confidence: "high" },
  expense: { content: "🧾 **Expense Submission**\n\n1. HR Portal → Expenses → New Report\n2. Upload receipts\n3. Categorize expenses\n4. Submit for approval\n\n**Limits:** Meals $50/day, travel >$500 needs pre-approval\n**Timeline:** 5 business days after approval", confidence: "high" },
  "first week": { content: "🎉 **First Week Checklist**\n\n- Complete IT setup\n- Badge activation\n- Meet your buddy\n- Compliance training\n- Set up direct deposit\n- Schedule 1:1 with manager\n\nYour buddy is **Sarah Chen**!", confidence: "high" },
  skip: { content: "👥 **Your Reporting Chain**\n\n- **Manager:** Alex Rivera\n- **Skip-Level:** Priya Sharma (VP Eng)\n- **Dept Head:** James O'Brien (CTO)", confidence: "high" },
  performance: { content: "📊 **Performance Review — Q2 2026**\n\n- Self-assessment: April 7\n- Peer feedback: April 8–14\n- Manager review: April 15–25\n- Results: May 1", confidence: "high" },
  compliance: { content: "⚠️ **Report a Concern**\n\n1. Ethics Hotline: 1-800-555-ETHC\n2. Email: ethics@company.com\n3. HR Business Partner\n4. HR Portal → Report Concern\n\nAll reports are confidential.", confidence: "high" },
};

function getResponse(input: string) {
  const lower = input.toLowerCase();
  if (lower.includes("wfh") || lower.includes("work from home") || lower.includes("remote")) return mockResponses.wfh;
  if (lower.includes("pto") || lower.includes("time off") || lower.includes("leave") || lower.includes("vacation")) return mockResponses.pto;
  if (lower.includes("enrollment") || lower.includes("benefit") || lower.includes("insurance")) return mockResponses.enrollment;
  if (lower.includes("pay") || lower.includes("salary") || lower.includes("payroll")) return mockResponses.pay;
  if (lower.includes("expense") || lower.includes("reimburs")) return mockResponses.expense;
  if (lower.includes("first week") || lower.includes("onboarding")) return mockResponses["first week"];
  if (lower.includes("skip") || lower.includes("manager") || lower.includes("directory")) return mockResponses.skip;
  if (lower.includes("performance") || lower.includes("review") || lower.includes("promotion")) return mockResponses.performance;
  if (lower.includes("compliance") || lower.includes("ethics") || lower.includes("report") || lower.includes("harassment")) return mockResponses.compliance;
  return { content: "I'm not fully confident in answering this. Let me **escalate to HR Ops** — you'll get a response within 24 hours.\n\n🔄 **Escalated to HR Team**", confidence: "low" as const };
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const msg = input.trim();
    if (!msg || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: msg, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getResponse(msg);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
        confidence: response.confidence,
        escalated: response.confidence === "low",
      }]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-3.5rem)]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
                <Bot className="h-8 w-8 text-accent-foreground" />
              </div>
              <h2 className="font-semibold text-lg mb-1">Chat with PingHR</h2>
              <p className="text-sm text-muted-foreground max-w-md">
                Ask me about policies, leave, benefits, payroll, expenses, onboarding, org structure, performance reviews, or compliance.
              </p>
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
              <div className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}>
                <div className="whitespace-pre-wrap">
                  {msg.content.split(/(\*\*.*?\*\*)/).map((part, i) =>
                    part.startsWith("**") && part.endsWith("**")
                      ? <strong key={i}>{part.slice(2, -2)}</strong>
                      : <span key={i}>{part}</span>
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

        {/* Input */}
        <div className="border-t p-4 max-w-3xl mx-auto w-full">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask PingHR anything..."
              className="flex-1 rounded-xl border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isTyping} className="h-11 w-11 rounded-xl">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
