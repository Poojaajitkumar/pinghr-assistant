import { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/AppLayout";

interface EscalatedQuery {
  id: string;
  employee: string;
  question: string;
  aiDraft: string;
  status: "pending" | "reviewed" | "sent";
  category: string;
  timestamp: Date;
  timeToResolve?: number; // minutes
}

const mockQueries: EscalatedQuery[] = [
  {
    id: "1",
    employee: "Jordan Lee",
    question: "Can I take unpaid leave for 3 months to care for a family member abroad? What are my options?",
    aiDraft: "Hi Jordan,\n\nGreat question. Under our Extended Leave Policy, you have a few options:\n\n1. **FMLA Leave** — If your family member qualifies, you may be eligible for up to 12 weeks of protected leave (unpaid).\n2. **Personal Leave of Absence** — We offer unpaid personal leave for up to 6 months with manager and HR VP approval.\n3. **Remote Work Arrangement** — Depending on your role, we may be able to accommodate remote work from abroad temporarily.\n\nI'd recommend scheduling a call with your HR Business Partner to discuss the best option for your situation.\n\nBest,\nHR Team",
    status: "pending",
    category: "Leave",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "2",
    employee: "Sam Patel",
    question: "I noticed my stock options vesting schedule seems different from what was in my offer letter. Can someone review this?",
    aiDraft: "Hi Sam,\n\nThank you for flagging this. Stock option vesting is managed by our Equity Administration team. I've created a ticket for them to review your vesting schedule against your original offer letter.\n\nExpected response time: 2–3 business days.\n\nIn the meantime, you can view your current vesting schedule in the Equity Portal under 'My Grants.'\n\nBest,\nHR Team",
    status: "pending",
    category: "Compensation",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: "3",
    employee: "Alex Kim",
    question: "What's the process for transferring to another team internally?",
    aiDraft: "Hi Alex,\n\nInternal transfers follow this process:\n\n1. Express interest to your current manager\n2. Apply via the Internal Job Board\n3. Interview with the receiving team\n4. Both managers approve the transfer\n5. HR facilitates the transition (typically 2–4 week notice)\n\nYou can browse open internal positions on the HR Portal → Careers → Internal Openings.\n\nBest,\nHR Team",
    status: "reviewed",
    category: "Career Development",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    timeToResolve: 45,
  },
  {
    id: "4",
    employee: "Morgan Chen",
    question: "Is the company contributing to education/tuition reimbursement for part-time MBA programs?",
    aiDraft: "Hi Morgan,\n\nYes! Our Tuition Reimbursement Program covers up to $10,000/year for approved degree programs, including part-time MBAs. Requirements:\n\n- Must be enrolled at an accredited institution\n- Minimum 1 year of employment\n- Manager approval required\n- Must maintain a B average or higher\n\nSubmit your application via HR Portal → Learning → Tuition Reimbursement.\n\nBest,\nHR Team",
    status: "sent",
    category: "Benefits",
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
    timeToResolve: 30,
  },
];

const statusConfig = {
  pending: { label: "Pending Review", icon: AlertTriangle, variant: "outline" as const, color: "text-warning" },
  reviewed: { label: "Reviewed", icon: Clock, variant: "secondary" as const, color: "text-info" },
  sent: { label: "Sent", icon: CheckCircle2, variant: "default" as const, color: "text-success" },
};

export default function HRQueue() {
  const [queries, setQueries] = useState(mockQueries);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleStatusChange = (id: string, newStatus: "reviewed" | "sent") => {
    setQueries((prev) =>
      prev.map((q) =>
        q.id === id
          ? { ...q, status: newStatus, timeToResolve: newStatus === "sent" ? Math.floor(Math.random() * 60 + 15) : undefined }
          : q
      )
    );
  };

  const pendingCount = queries.filter((q) => q.status === "pending").length;
  const avgResolution = queries
    .filter((q) => q.timeToResolve)
    .reduce((sum, q) => sum + (q.timeToResolve || 0), 0) / (queries.filter((q) => q.timeToResolve).length || 1);

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">HR Ops Queue</h1>
          <p className="text-muted-foreground">Review AI-drafted responses for escalated employee queries</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border rounded-xl p-4 shadow-soft"
          >
            <p className="text-xs text-muted-foreground mb-1">Pending Review</p>
            <p className="text-2xl font-bold text-warning">{pendingCount}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-card border rounded-xl p-4 shadow-soft"
          >
            <p className="text-xs text-muted-foreground mb-1">Total Escalations</p>
            <p className="text-2xl font-bold">{queries.length}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border rounded-xl p-4 shadow-soft"
          >
            <p className="text-xs text-muted-foreground mb-1">Avg. Resolution Time</p>
            <p className="text-2xl font-bold text-success">{Math.round(avgResolution)} min</p>
          </motion.div>
        </div>

        {/* Queue */}
        <div className="space-y-3">
          {queries.map((query, i) => {
            const config = statusConfig[query.status];
            const isExpanded = expandedId === query.id;

            return (
              <motion.div
                key={query.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border rounded-xl shadow-soft overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : query.id)}
                  className="w-full p-4 flex items-start gap-3 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="h-4 w-4 text-secondary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{query.employee}</span>
                      <Badge variant={config.variant} className="text-xs">
                        <config.icon className={`h-3 w-3 mr-1 ${config.color}`} />
                        {config.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{query.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{query.question}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {query.timestamp.toLocaleString()}
                      {query.timeToResolve && ` · Resolved in ${query.timeToResolve} min`}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground mt-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground mt-1" />
                  )}
                </button>

                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="border-t px-4 py-4"
                  >
                    <div className="mb-3">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Employee Question
                      </h4>
                      <p className="text-sm bg-muted/50 rounded-lg p-3">{query.question}</p>
                    </div>
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        AI-Drafted Response
                      </h4>
                      <div className="text-sm bg-accent/30 rounded-lg p-3 whitespace-pre-wrap border border-primary/10">
                        {query.aiDraft.split(/(\*\*.*?\*\*)/).map((part, i) =>
                          part.startsWith("**") && part.endsWith("**") ? (
                            <strong key={i}>{part.slice(2, -2)}</strong>
                          ) : (
                            <span key={i}>{part}</span>
                          )
                        )}
                      </div>
                    </div>
                    {query.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(query.id, "reviewed")}
                        >
                          Mark as Reviewed
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(query.id, "sent")}
                        >
                          <Send className="h-3.5 w-3.5 mr-1.5" />
                          Approve & Send
                        </Button>
                      </div>
                    )}
                    {query.status === "reviewed" && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(query.id, "sent")}
                      >
                        <Send className="h-3.5 w-3.5 mr-1.5" />
                        Send to Employee
                      </Button>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
