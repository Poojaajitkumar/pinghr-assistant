import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Eye,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Filter,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import HRConversationSidebar from "@/components/HRConversationSidebar";
import MyRequestsPanel, { type EscalatedRequest, type AuditEvent } from "@/components/MyRequestsPanel";
import type { Conversation } from "@/components/ConversationSidebar";
import { useAuth } from "@/contexts/AuthContext";

type Priority = "critical" | "high" | "medium";
type Status = "pending" | "assigned" | "in_review" | "resolved";

interface EscalatedTicket {
  id: string;
  employee: string;
  question: string;
  aiDraft: string;
  status: Status;
  priority: Priority;
  category: string;
  timestamp: Date;
  assignedTo?: string;
  timeToResolve?: number;
}

const mockTickets: EscalatedTicket[] = [
  {
    id: "1",
    employee: "Jordan Lee",
    question: "Can I take unpaid leave for 3 months to care for a family member abroad?",
    aiDraft: "Hi Jordan,\n\nUnder our Extended Leave Policy, you have a few options:\n\n1. **FMLA Leave** — up to 12 weeks protected leave\n2. **Personal Leave** — up to 6 months with VP approval\n3. **Remote Work** — possible depending on role\n\nBest,\nHR Team",
    status: "pending",
    priority: "critical",
    category: "Leave & Time Off",
    timestamp: new Date(Date.now() - 2 * 3600000),
  },
  {
    id: "2",
    employee: "Sam Patel",
    question: "Stock options vesting schedule differs from offer letter",
    aiDraft: "Hi Sam,\n\nThank you for flagging this. I've created a ticket for Equity Administration to review your vesting schedule.\n\nExpected response: 2–3 business days.\n\nBest,\nHR Team",
    status: "pending",
    priority: "high",
    category: "Compensation",
    timestamp: new Date(Date.now() - 5 * 3600000),
  },
  {
    id: "3",
    employee: "Alex Kim",
    question: "Internal transfer process to another team — what are the steps?",
    aiDraft: "Hi Alex,\n\n1. Express interest to current manager\n2. Apply via Internal Job Board\n3. Interview with receiving team\n4. Both managers approve\n5. HR facilitates transition\n\nBest,\nHR Team",
    status: "pending",
    priority: "medium",
    category: "Career Development",
    timestamp: new Date(Date.now() - 86400000),
  },
  {
    id: "4",
    employee: "Morgan Chen",
    question: "Tuition reimbursement for part-time MBA program — am I eligible?",
    aiDraft: "Hi Morgan,\n\nYes! Up to $10,000/year for approved programs. Requirements: accredited institution, 1 year employment, B average.\n\nBest,\nHR Team",
    status: "pending",
    priority: "medium",
    category: "Benefits",
    timestamp: new Date(Date.now() - 2 * 86400000),
  },
  {
    id: "5",
    employee: "Riley Park",
    question: "When is the next pay day and how do I update my bank details?",
    aiDraft: "Hi Riley,\n\nNext pay date: March 15, 2026 (bi-weekly cycle).\n\nTo update bank details: HR Portal → My Profile → Payment Info.\n\nBest,\nHR Team",
    status: "pending",
    priority: "medium",
    category: "Payroll & Pay",
    timestamp: new Date(Date.now() - 3 * 86400000),
  },
];

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  critical: { label: "Critical", className: "bg-destructive/10 text-destructive border-destructive/20" },
  high: { label: "High", className: "bg-warning/10 text-warning border-warning/20" },
  medium: { label: "Medium", className: "bg-muted text-muted-foreground" },
};

const statusConfig: Record<Status, { label: string; icon: typeof Clock; color: string }> = {
  pending: { label: "Pending", icon: AlertTriangle, color: "text-warning" },
  assigned: { label: "Assigned", icon: UserPlus, color: "text-info" },
  in_review: { label: "In Review", icon: Clock, color: "text-info" },
  resolved: { label: "Resolved", icon: CheckCircle2, color: "text-success" },
};

type FilterCategory = "all" | string;

export default function HROps() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState(mockTickets);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>("all");
  const [requestsOpen, setRequestsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

  const displayName = user?.email?.split("@")[0] ?? "HR User";

  const categories = Array.from(new Set(tickets.map((t) => t.category)));

  const assignedTickets = tickets.filter((t) => t.assignedTo === displayName);

  const assignedRequests: EscalatedRequest[] = assignedTickets.map((t) => ({
    id: t.id,
    summary: t.question.length > 50 ? t.question.slice(0, 50) + "..." : t.question,
    fullSummary: `${t.employee} asked: "${t.question}". AI drafted a response pending your review.`,
    aiResponse: t.aiDraft,
    status: t.status === "resolved" ? "resolved" : t.status === "in_review" ? "in_review" : "pending",
    priority: t.priority,
    category: t.category,
    timestamp: t.timestamp,
    auditLog: [
      { label: `Assigned to ${displayName}`, timestamp: new Date() },
      { label: "Escalated by employee", timestamp: t.timestamp },
    ],
  }));

  const handleAssignToMe = (id: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: "assigned" as Status, assignedTo: displayName } : t
      )
    );
  };

  const handleStatusChange = (id: string, newStatus: Status) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: newStatus,
              timeToResolve: newStatus === "resolved" ? Math.floor(Math.random() * 60 + 15) : undefined,
            }
          : t
      )
    );
  };

  const filtered = categoryFilter === "all" ? tickets : tickets.filter((t) => t.category === categoryFilter);

  const sorted = [...filtered].sort((a, b) => {
    const order: Record<Priority, number> = { critical: 0, high: 1, medium: 2 };
    return order[a.priority] - order[b.priority];
  });

  const pendingCount = tickets.filter((t) => t.status === "pending").length;

  return (
    <div className="min-h-screen flex w-full">
      <HRConversationSidebar
        activeConversationId={activeConversation}
        conversations={conversations}
        onSelectConversation={setActiveConversation}
        onNewConversation={() => setActiveConversation(null)}
        onDeleteConversation={(id) => {
          setConversations((prev) => prev.filter((c) => c.id !== id));
          if (activeConversation === id) setActiveConversation(null);
        }}
        onClearAll={() => { setConversations([]); setActiveConversation(null); }}
        assignedCount={assignedTickets.length}
      />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-auto">
        <header className="flex items-center justify-between px-6 py-3 border-b bg-card">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base text-primary">PingHR</span>
            <span className="text-muted-foreground text-sm">/ HR Ops</span>
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

        <div className="p-6 max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">HR Ops Queue</h1>
              <p className="text-muted-foreground text-sm">
                {pendingCount} pending · {tickets.length} total escalated queries
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48 h-9 text-sm">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-card border rounded-xl shadow-soft overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[100px]">Priority</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead className="max-w-[300px]">Query</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((ticket) => {
                  const pConfig = priorityConfig[ticket.priority];
                  const sConfig = statusConfig[ticket.status];
                  const isExpanded = expandedId === ticket.id;
                  const isAssignedToMe = ticket.assignedTo === displayName;

                  return (
                    <>
                      <TableRow
                        key={ticket.id}
                        className={`cursor-pointer hover:bg-muted/30 ${isAssignedToMe ? "bg-primary/5" : ""}`}
                        onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                      >
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${pConfig.className}`}>
                            {pConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-sm">{ticket.employee}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">
                          {ticket.question}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{ticket.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs gap-1">
                            <sConfig.icon className={`h-3 w-3 ${sConfig.color}`} />
                            {sConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {!ticket.assignedTo && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssignToMe(ticket.id);
                              }}
                            >
                              <UserPlus className="h-3 w-3" />
                              Assign to me
                            </Button>
                          )}
                          {isAssignedToMe && (
                            <span className="text-xs text-primary font-medium">Assigned to you</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                      </TableRow>

                      {isExpanded && (
                        <TableRow key={`${ticket.id}-expanded`}>
                          <TableCell colSpan={7} className="bg-muted/10 p-0">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6 py-4 space-y-4">
                              <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                  Employee Question
                                </h4>
                                <p className="text-sm bg-card rounded-lg p-3 border">{ticket.question}</p>
                              </div>
                              <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                  AI-Drafted Response
                                </h4>
                                <div className="text-sm bg-accent/30 rounded-lg p-3 whitespace-pre-wrap border border-primary/10">
                                  {ticket.aiDraft.split(/(\*\*.*?\*\*)/).map((part, i) =>
                                    part.startsWith("**") && part.endsWith("**") ? (
                                      <strong key={i}>{part.slice(2, -2)}</strong>
                                    ) : (
                                      <span key={i}>{part}</span>
                                    )
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {!ticket.assignedTo && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAssignToMe(ticket.id);
                                    }}
                                  >
                                    <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                                    Assign to me
                                  </Button>
                                )}
                                {isAssignedToMe && ticket.status !== "resolved" && (
                                  <>
                                    {ticket.status !== "in_review" && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleStatusChange(ticket.id, "in_review");
                                        }}
                                      >
                                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                                        Start Review
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusChange(ticket.id, "resolved");
                                      }}
                                    >
                                      <Send className="h-3.5 w-3.5 mr-1.5" />
                                      Send to Employee
                                    </Button>
                                  </>
                                )}
                                {ticket.status === "resolved" && (
                                  <span className="text-xs text-success font-medium flex items-center gap-1">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Response sent
                                  </span>
                                )}
                              </div>
                            </motion.div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      <MyRequestsPanel isOpen={requestsOpen} onClose={() => setRequestsOpen(false)} requests={assignedRequests} />
    </div>
  );
}
