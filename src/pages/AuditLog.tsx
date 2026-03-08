import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import HRConversationSidebar from "@/components/HRConversationSidebar";
import MyRequestsPanel from "@/components/MyRequestsPanel";
import type { Conversation } from "@/components/ConversationSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useHRTickets } from "@/contexts/HRTicketsContext";

const logs = [
  { id: "1", timestamp: "2026-03-03 09:15", employee: "Jordan Lee", query: "Unpaid leave for family care", action: "Escalated to HR", confidence: "low" as const, resolution: "Pending" },
  { id: "2", timestamp: "2026-03-03 08:42", employee: "Sam Patel", query: "Stock options vesting discrepancy", action: "Escalated to HR", confidence: "low" as const, resolution: "Pending" },
  { id: "3", timestamp: "2026-03-02 14:30", employee: "Alex Kim", query: "Internal transfer process", action: "Answered by AI → Reviewed by HR", confidence: "low" as const, resolution: "45 min" },
  { id: "4", timestamp: "2026-03-01 11:20", employee: "Morgan Chen", query: "Tuition reimbursement for MBA", action: "Answered by AI → Approved", confidence: "low" as const, resolution: "30 min" },
  { id: "5", timestamp: "2026-03-01 10:05", employee: "Riley Park", query: "WFH policy details", action: "Answered by AI (auto)", confidence: "high" as const, resolution: "Instant" },
  { id: "6", timestamp: "2026-02-28 16:45", employee: "Casey Liu", query: "PTO balance check", action: "Answered by AI (auto)", confidence: "high" as const, resolution: "Instant" },
  { id: "7", timestamp: "2026-02-28 09:30", employee: "Taylor Singh", query: "Performance review timeline", action: "Answered by AI (auto)", confidence: "high" as const, resolution: "Instant" },
];

export default function AuditLog() {
  const { user } = useAuth();
  const { getAssignedTickets, getAssignedRequests } = useHRTickets();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [requestsOpen, setRequestsOpen] = useState(false);

  const displayName = user?.email?.split("@")[0] ?? "HR User";
  const assignedTickets = getAssignedTickets(displayName);
  const assignedRequests = getAssignedRequests(displayName);

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
            <span className="text-muted-foreground text-sm ml-1">/ Audit Log</span>
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1">Audit Log</h1>
            <p className="text-muted-foreground text-sm">Complete record of all PingHR interactions and resolutions</p>
          </div>

          <div className="bg-card border rounded-xl shadow-soft overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Time</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Query</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Resolution</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log, i) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="text-muted-foreground whitespace-nowrap text-sm">{log.timestamp}</TableCell>
                    <TableCell className="font-medium text-sm">{log.employee}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">{log.query}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{log.action}</TableCell>
                    <TableCell>
                      <Badge variant={log.confidence === "high" ? "default" : "outline"} className="text-xs">
                        {log.confidence === "high" ? (
                          <CheckCircle2 className="h-3 w-3 mr-1 text-success" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 mr-1 text-warning" />
                        )}
                        {log.confidence}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={log.resolution === "Instant" ? "text-success font-medium text-sm" : log.resolution === "Pending" ? "text-warning text-sm" : "text-sm"}>
                        {log.resolution}
                      </span>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      <MyRequestsPanel isOpen={requestsOpen} onClose={() => setRequestsOpen(false)} requests={assignedRequests} />
    </div>
  );
}
