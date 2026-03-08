import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type RequestStatus = "pending" | "in_review" | "resolved";

interface EscalatedRequest {
  id: string;
  summary: string;
  status: RequestStatus;
  priority: "critical" | "high" | "medium";
  category: string;
  timestamp: Date;
}

const mockRequests: EscalatedRequest[] = [
  {
    id: "1",
    summary: "Employee asked about the benefits package provided...",
    status: "pending",
    priority: "medium",
    category: "Benefits",
    timestamp: new Date(Date.now() - 19 * 3600000),
  },
  {
    id: "2",
    summary: "Employee asked about annual leave policy. Agent...",
    status: "pending",
    priority: "medium",
    category: "Leave & Time Off",
    timestamp: new Date(Date.now() - 86400000),
  },
  {
    id: "3",
    summary: "Employee asked about the company's hybrid work...",
    status: "pending",
    priority: "medium",
    category: "Company Policy",
    timestamp: new Date(Date.now() - 86400000),
  },
  {
    id: "4",
    summary: "Employee asked about leave policies. Agent outlined the...",
    status: "pending",
    priority: "medium",
    category: "Leave & Time Off",
    timestamp: new Date(Date.now() - 2 * 86400000),
  },
  {
    id: "5",
    summary: "Employee asked about payroll schedule and direct deposit...",
    status: "pending",
    priority: "high",
    category: "Payroll & Pay",
    timestamp: new Date(Date.now() - 3 * 86400000),
  },
];

function timeAgo(date: Date): string {
  const hours = Math.floor((Date.now() - date.getTime()) / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `about ${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

const statusColors: Record<RequestStatus, string> = {
  pending: "text-warning",
  in_review: "text-info",
  resolved: "text-success",
};

const priorityColors: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  high: "bg-warning/10 text-warning border-warning/20",
  medium: "bg-warning/10 text-warning border-warning/20",
};

type FilterTab = "all" | "pending" | "in_review" | "resolved";

interface MyRequestsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MyRequestsPanel({ isOpen, onClose }: MyRequestsPanelProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const pendingCount = mockRequests.filter((r) => r.status === "pending").length;
  const inReviewCount = mockRequests.filter((r) => r.status === "in_review").length;
  const resolvedCount = mockRequests.filter((r) => r.status === "resolved").length;

  const filtered = activeTab === "all"
    ? mockRequests
    : mockRequests.filter((r) => r.status === activeTab);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "in_review", label: "In Review" },
    { key: "resolved", label: "Resolved" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="w-96 border-l bg-card flex flex-col h-full flex-shrink-0"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div>
              <h2 className="text-lg font-semibold">My Requests</h2>
              <p className="text-xs text-muted-foreground">{mockRequests.length} escalated queries</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Stats */}
          <div className="px-5 pb-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="py-2">
                <p className="text-2xl font-bold text-warning">{pendingCount}</p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pending</p>
              </div>
              <div className="py-2">
                <p className="text-2xl font-bold text-info">{inReviewCount}</p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">In Review</p>
              </div>
              <div className="py-2">
                <p className="text-2xl font-bold text-success">{resolvedCount}</p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Resolved</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-5 pb-3 flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Request Cards */}
          <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-3">
            {filtered.map((req) => (
              <div
                key={req.id}
                className="border border-warning/30 rounded-xl p-4 bg-card"
              >
                <div className="flex items-start gap-2.5">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug mb-2">{req.summary}</p>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 border-warning/30 text-warning bg-warning/5"
                      >
                        ● Pending Review
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 ${priorityColors[req.priority]}`}
                      >
                        ● {req.priority.charAt(0).toUpperCase() + req.priority.slice(1)}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {req.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{timeAgo(req.timestamp)}</p>
                  </div>
                  <button
                    onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                    className="p-1 rounded hover:bg-muted transition-colors flex-shrink-0"
                  >
                    <ChevronDown
                      className={`h-4 w-4 text-muted-foreground transition-transform ${
                        expandedId === req.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
