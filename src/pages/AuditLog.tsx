import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ConversationSidebar from "@/components/ConversationSidebar";

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
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex w-full">
      <ConversationSidebar
        activeConversationId={activeConversation}
        conversations={[]}
        onSelectConversation={setActiveConversation}
        onNewConversation={() => setActiveConversation(null)}
        onDeleteConversation={() => {}}
        onClearAll={() => {}}
      />
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-auto">
        <header className="flex items-center px-6 py-3 border-b bg-card">
          <span className="font-semibold text-base text-primary">PingHR</span>
          <span className="text-muted-foreground text-sm ml-3">/ Audit Log</span>
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
    </div>
  );
}
