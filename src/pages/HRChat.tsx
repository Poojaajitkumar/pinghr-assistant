import { useState, useRef, useEffect } from "react";
import { Loader2, ArrowUp, Sparkles, Mail, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import HRConversationSidebar from "@/components/HRConversationSidebar";
import MyRequestsPanel from "@/components/MyRequestsPanel";
import ChatMessageBubble from "@/components/ChatMessageBubble";
import HRCategoryCards from "@/components/HRCategoryCards";
import { useAuth } from "@/contexts/AuthContext";
import { useHRTickets } from "@/contexts/HRTicketsContext";
import type { Conversation } from "@/components/ConversationSidebar";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  confidence?: "high" | "low";
  escalated?: boolean;
}

const hrMockResponses: Record<string, { content: string; confidence: "high" | "low" }> = {
  lookup: {
    content: "👤 **Employee: Jordan Lee**\n\n- **Department:** Engineering\n- **Role:** Senior Software Engineer\n- **Location:** San Francisco, CA\n- **Tenure:** 2 years, 4 months\n- **Manager:** Alex Rivera\n- **Email:** jordan.lee@acme.com\n- **Status:** Active\n- **Last review:** Q4 2025 — Exceeds Expectations",
    confidence: "high",
  },
  policy: {
    content: "📋 **Parental Leave Policy**\n\n- **Primary caregiver:** 16 weeks paid leave\n- **Secondary caregiver:** 6 weeks paid leave\n- **Eligibility:** After 6 months of employment\n- **Benefits:** Full health coverage maintained during leave\n- **Return:** Guaranteed same or equivalent role\n- **Flexibility:** Can be taken in blocks within 12 months of birth/adoption\n\n*Last updated: January 2026*",
    confidence: "high",
  },
  draft: {
    content: "✍️ **Draft Response — Stock Options Vesting**\n\nHi [Employee],\n\nThank you for reaching out regarding your stock options vesting schedule.\n\nI've reviewed your offer letter and our equity records. Here's a summary:\n\n- **Total grant:** [X] shares\n- **Vesting schedule:** 4-year vesting with 1-year cliff\n- **Cliff date:** [Date]\n- **Monthly vesting after cliff:** [X/48] shares\n\nIf you notice any discrepancy, please share your offer letter reference number and I'll escalate to the Equity Administration team for a detailed audit.\n\nBest regards,\nHR Team\n\n---\n*You can edit this draft before sending to the employee.*",
    confidence: "high",
  },
  analytics: {
    content: "📊 **Escalation Analytics — March 2026**\n\n**Top Categories:**\n1. Leave & Time Off — 34% of queries\n2. Payroll & Pay — 28%\n3. Benefits — 18%\n4. Career Development — 12%\n5. Other — 8%\n\n**Resolution Metrics:**\n- Avg. resolution time: **42 min**\n- Same-day resolution: **87%**\n- Escalation rate: **15%** of total queries\n- Employee satisfaction: **4.6/5**\n\n**Trend:** Leave-related queries up 22% vs last month (spring break season).",
    confidence: "high",
  },
  default: {
    content: "I can help you with employee lookups, policy references, drafting responses, and analytics. Could you provide more details about what you need?",
    confidence: "high",
  },
};

function getHRResponse(input: string) {
  const lower = input.toLowerCase();
  if (lower.includes("look up") || lower.includes("lookup") || lower.includes("employee") || lower.includes("search")) return hrMockResponses.lookup;
  if (lower.includes("policy") || lower.includes("leave") || lower.includes("parental") || lower.includes("wfh") || lower.includes("remote")) return hrMockResponses.policy;
  if (lower.includes("draft") || lower.includes("response") || lower.includes("reply") || lower.includes("write")) return hrMockResponses.draft;
  if (lower.includes("analytics") || lower.includes("insight") || lower.includes("trend") || lower.includes("categor") || lower.includes("report") || lower.includes("metric")) return hrMockResponses.analytics;
  return hrMockResponses.default;
}

export default function HRChat() {
  const { user } = useAuth();
  const { getAssignedTickets, getAssignedRequests } = useHRTickets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [requestsOpen, setRequestsOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayName = user?.email?.split("@")[0] ?? "there";
  const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
  const assignedTickets = getAssignedTickets(displayName);
  const assignedRequests = getAssignedRequests(displayName);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isTyping) return;

    if (!activeConversation) {
      const newId = `conv-${Date.now()}`;
      const preview = msg.length > 30 ? msg.slice(0, 30) + "..." : msg;
      setConversations((prev) => [{ id: newId, preview, timestamp: new Date() }, ...prev]);
      setActiveConversation(newId);
    }

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: msg, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getHRResponse(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.content,
          timestamp: new Date(),
          confidence: response.confidence,
        },
      ]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    setMessages([]);
  };

  const handleNewConversation = () => {
    setMessages([]);
    setActiveConversation(null);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversation === id) {
      setMessages([]);
      setActiveConversation(null);
    }
  };

  const handleClearAll = () => {
    setConversations([]);
    setMessages([]);
    setActiveConversation(null);
  };

  const showWelcome = messages.length === 0;

  return (
    <div className="min-h-screen flex w-full">
      <HRConversationSidebar
        activeConversationId={activeConversation}
        conversations={conversations}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onClearAll={handleClearAll}
        assignedCount={assignedTickets.length}
      />

      <main className="flex-1 flex flex-col min-w-0 h-screen">
        <header className="flex items-center justify-between px-6 py-3 border-b bg-card">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base text-primary">PingHR</span>
            <span className="text-muted-foreground text-sm">/ HR Chat</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-primary border-primary/30 hover:bg-primary/5"
            onClick={() => setRequestsOpen(true)}
          >
            <Mail className="h-4 w-4" />
            My Assigned
            {assignedTickets.length > 0 && (
              <span className="ml-1 h-5 min-w-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                {assignedTickets.length}
              </span>
            )}
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {showWelcome ? (
            <div className="flex flex-col items-center justify-center px-6 py-6 max-w-3xl mx-auto h-full">
              <div className="flex-1 min-h-0" />
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                HR Assistant · Acme Corp
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center">
                Hi {capitalizedName}, how can I help?
              </h1>
              <p className="text-muted-foreground text-center mb-1 max-w-lg text-sm">
                Look up employees, reference policies, draft responses, or get analytics insights.
              </p>
              <p className="text-xs text-muted-foreground text-center mb-6">
                Your AI-powered HR operations assistant.
              </p>
              <HRCategoryCards onSelectCategory={handleSend} />
              <div className="flex-1 min-h-0" />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
              {messages.map((msg) => (
                <ChatMessageBubble key={msg.id} msg={msg} onEscalate={() => {}} />
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
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Look up employees, draft responses, check policies..."
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
            AI-assisted responses for HR operations.
          </p>
        </div>
      </main>

      <MyRequestsPanel isOpen={requestsOpen} onClose={() => setRequestsOpen(false)} requests={assignedRequests} />
    </div>
  );
}
