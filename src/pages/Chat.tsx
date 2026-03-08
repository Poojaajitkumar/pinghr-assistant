import { useState, useRef, useEffect } from "react";
import { Loader2, ArrowUp, Sparkles, Mail, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConversationSidebar from "@/components/ConversationSidebar";
import MyRequestsPanel, { type EscalatedRequest } from "@/components/MyRequestsPanel";
import ChatMessageBubble from "@/components/ChatMessageBubble";
import CategoryCards from "@/components/CategoryCards";
import { useAuth } from "@/contexts/AuthContext";

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

const mockConversationMessages: Record<string, Message[]> = {
  "1": [
    { id: "1-1", role: "user", content: "What is the annual leave policy?", timestamp: new Date(Date.now() - 4 * 86400000) },
    { id: "1-2", role: "assistant", content: "🏖️ **Annual Leave Policy**\n\n- **Entitlement:** 20 days per year for full-time employees\n- **Probation:** Leave accrues but can't be taken in the first 3 months\n- **Carry-over:** Up to 5 unused days roll into the next year\n- **Approval:** Submit via HR Portal at least 5 business days in advance", timestamp: new Date(Date.now() - 4 * 86400000), confidence: "high" },
  ],
  "2": [
    { id: "2-1", role: "user", content: "What mental health resources are available?", timestamp: new Date(Date.now() - 4 * 86400000) },
    { id: "2-2", role: "assistant", content: "I'm not fully confident in answering this. Let me **escalate to HR Ops** — you'll get a response within 24 hours.\n\n🔄 **Escalated to HR Team**", timestamp: new Date(Date.now() - 4 * 86400000), confidence: "low", escalated: true },
  ],
  "3": [
    { id: "3-1", role: "user", content: "When is payday and how do I access my payslip?", timestamp: new Date(Date.now() - 4 * 86400000) },
    { id: "3-2", role: "assistant", content: "💰 **Payroll Info**\n\nNext pay date: **March 15, 2026** (bi-weekly).\n- Direct deposit: Active ✅\n- W-2 for 2025 available in HR Portal", timestamp: new Date(Date.now() - 4 * 86400000), confidence: "high" },
  ],
  "4": [
    { id: "4-1", role: "user", content: "When is payday and how do I view my pay history?", timestamp: new Date(Date.now() - 4 * 86400000) },
    { id: "4-2", role: "assistant", content: "💰 **Payroll Info**\n\nNext pay date: **March 15, 2026** (bi-weekly).\n- Direct deposit: Active ✅\n- W-2 for 2025 available in HR Portal\n\nYou can view full pay history under **HR Portal → Payroll → Statements**.", timestamp: new Date(Date.now() - 4 * 86400000), confidence: "high" },
  ],
  "5": [
    { id: "5-1", role: "user", content: "What health insurance benefits does Acme offer?", timestamp: new Date(Date.now() - 4 * 86400000) },
    { id: "5-2", role: "assistant", content: "💊 **Open Enrollment**\n\nNext window: **November 1–15, 2026**. You can change plans, add dependents, and adjust FSA/HSA contributions.", timestamp: new Date(Date.now() - 4 * 86400000), confidence: "high" },
  ],
  "6": [
    { id: "6-1", role: "user", content: "When is payday and how do I update my bank details?", timestamp: new Date(Date.now() - 3 * 86400000) },
    { id: "6-2", role: "assistant", content: "💰 **Payroll Info**\n\nNext pay date: **March 15, 2026** (bi-weekly).\n- Direct deposit: Active ✅\n\nTo update bank details go to **HR Portal → My Profile → Payment Info**.", timestamp: new Date(Date.now() - 3 * 86400000), confidence: "high" },
  ],
  "7": [
    { id: "7-1", role: "user", content: "Can you explain Acme's payroll schedule?", timestamp: new Date(Date.now() - 3 * 86400000) },
    { id: "7-2", role: "assistant", content: "💰 **Payroll Schedule**\n\nAcme runs **bi-weekly** payroll (every other Friday).\n- Cut-off for timesheets: Wednesday before payday\n- Direct deposit hits accounts by 9 AM on payday", timestamp: new Date(Date.now() - 3 * 86400000), confidence: "high" },
  ],
  "8": [
    { id: "8-1", role: "user", content: "What leave policies does Acme have?", timestamp: new Date(Date.now() - 3 * 86400000) },
    { id: "8-2", role: "assistant", content: "🏖️ **Leave Policies**\n\n- **Annual leave:** 20 days/year\n- **Sick leave:** 10 days/year\n- **Parental leave:** 12 weeks paid\n- **Bereavement:** 5 days\n- **Personal days:** 3 days/year", timestamp: new Date(Date.now() - 3 * 86400000), confidence: "high" },
  ],
  "9": [
    { id: "9-1", role: "user", content: "What are Acme's key company holidays?", timestamp: new Date(Date.now() - 3 * 86400000) },
    { id: "9-2", role: "assistant", content: "I'm not fully confident in answering this. Let me **escalate to HR Ops** — you'll get a response within 24 hours.\n\n🔄 **Escalated to HR Team**", timestamp: new Date(Date.now() - 3 * 86400000), confidence: "low", escalated: true },
  ],
};

function getResponse(input: string) {
  const lower = input.toLowerCase();
  if (lower.includes("wfh") || lower.includes("work from home") || lower.includes("remote")) return mockResponses.wfh;
  if (lower.includes("pto") || lower.includes("time off") || lower.includes("leave") || lower.includes("vacation") || lower.includes("annual")) return mockResponses.pto;
  if (lower.includes("enrollment") || lower.includes("benefit") || lower.includes("insurance") || lower.includes("health")) return mockResponses.enrollment;
  if (lower.includes("pay") || lower.includes("salary") || lower.includes("payroll") || lower.includes("payslip")) return mockResponses.pay;
  if (lower.includes("expense") || lower.includes("reimburs")) return mockResponses.expense;
  return mockResponses.default;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [requestsOpen, setRequestsOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [escalatedRequests, setEscalatedRequests] = useState<EscalatedRequest[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayName = user?.email?.split("@")[0] ?? "there";
  const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

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

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    setMessages(mockConversationMessages[id] || []);
  };

  const handleNewConversation = () => {
    setMessages([]);
    setActiveConversation(null);
  };

  const handleEscalate = (msg: Message) => {
    const msgIdx = messages.indexOf(msg);
    const userMsg = [...messages].slice(0, msgIdx).reverse().find((m) => m.role === "user");
    const queryText = userMsg?.content ?? "Unknown query";
    const now = new Date();

    const newRequest: EscalatedRequest = {
      id: `esc-${Date.now()}`,
      summary: queryText.length > 50 ? queryText.slice(0, 50) + "..." : queryText,
      fullSummary: `Employee asked about ${queryText.toLowerCase()}. Agent provided a response but the employee was not satisfied and escalated for human review.`,
      aiResponse: msg.content,
      status: "pending",
      priority: "high",
      category: detectCategory(queryText),
      timestamp: now,
      auditLog: [
        { label: "Escalated to HR by employee", timestamp: now },
        { label: "AI response generated", timestamp: new Date(msg.timestamp) },
        { label: "Query submitted", timestamp: new Date(userMsg?.timestamp ?? now) },
      ].reverse(),
    };
    setEscalatedRequests((prev) => [newRequest, ...prev]);
  };

  function detectCategory(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes("leave") || lower.includes("pto") || lower.includes("vacation") || lower.includes("time off")) return "Leave & Time Off";
    if (lower.includes("pay") || lower.includes("salary") || lower.includes("payroll")) return "Payroll & Pay";
    if (lower.includes("benefit") || lower.includes("insurance") || lower.includes("health") || lower.includes("enrollment")) return "Benefits";
    if (lower.includes("expense") || lower.includes("reimburs")) return "Expenses";
    if (lower.includes("wfh") || lower.includes("remote") || lower.includes("work from home")) return "Company Policy";
    return "General";
  }

  const showWelcome = messages.length === 0;

  return (
    <div className="min-h-screen flex w-full">
      <ConversationSidebar
        activeConversationId={activeConversation}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
      />

      <main className="flex-1 flex flex-col min-w-0 h-screen">
        <header className="flex items-center justify-between px-6 py-3 border-b bg-card">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base text-primary">PingHR</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-primary border-primary/30 hover:bg-primary/5"
            onClick={() => setRequestsOpen(true)}
          >
            <Mail className="h-4 w-4" />
            My Requests
            {escalatedRequests.length > 0 && (
              <span className="ml-1 h-5 min-w-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                {escalatedRequests.length}
              </span>
            )}
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {showWelcome ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 max-w-3xl mx-auto">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                Your HR assistant · Acme Corp
              </div>
              <h1 className="text-3xl font-bold mb-3 text-center">
                Hi {capitalizedName}, what can I help with?
              </h1>
              <p className="text-muted-foreground text-center mb-1 max-w-lg">
                Ask me anything about Acme's HR policies — leave, payroll, benefits, and more.
              </p>
              <p className="text-xs text-muted-foreground text-center mb-10">
                Sensitive queries are securely escalated to HR Ops.
              </p>
              <CategoryCards onSelectCategory={handleSend} />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
              {messages.map((msg) => (
                <ChatMessageBubble key={msg.id} msg={msg} onEscalate={handleEscalate} />
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
          )}
        </div>

        <div className="border-t px-6 py-4 max-w-3xl mx-auto w-full">
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
              placeholder="Ask anything about HR, leave, payroll, benefits..."
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
          <p className="text-center text-xs text-muted-foreground mt-2">
            Confident answers are grounded in policy. Low-confidence queries go to HR Ops.
          </p>
        </div>
      </main>

      <MyRequestsPanel isOpen={requestsOpen} onClose={() => setRequestsOpen(false)} requests={escalatedRequests} />
    </div>
  );
}
