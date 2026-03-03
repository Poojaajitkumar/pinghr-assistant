import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Clock, Bot, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/AppLayout";

const logs = [
  { id: "1", timestamp: "2026-03-03 09:15", employee: "Jordan Lee", query: "Unpaid leave for family care", action: "Escalated to HR", confidence: "low", respondedBy: "—", resolution: "Pending" },
  { id: "2", timestamp: "2026-03-03 08:42", employee: "Sam Patel", query: "Stock options vesting discrepancy", action: "Escalated to HR", confidence: "low", respondedBy: "—", resolution: "Pending" },
  { id: "3", timestamp: "2026-03-02 14:30", employee: "Alex Kim", query: "Internal transfer process", action: "Answered by AI → Reviewed by HR", confidence: "low", respondedBy: "Lisa Wong", resolution: "45 min" },
  { id: "4", timestamp: "2026-03-01 11:20", employee: "Morgan Chen", query: "Tuition reimbursement for MBA", action: "Answered by AI → Approved & Sent", confidence: "low", respondedBy: "Lisa Wong", resolution: "30 min" },
  { id: "5", timestamp: "2026-03-01 10:05", employee: "Riley Park", query: "WFH policy details", action: "Answered by AI (auto)", confidence: "high", respondedBy: "PingHR Bot", resolution: "Instant" },
  { id: "6", timestamp: "2026-02-28 16:45", employee: "Casey Liu", query: "PTO balance check", action: "Answered by AI (auto)", confidence: "high", respondedBy: "PingHR Bot", resolution: "Instant" },
  { id: "7", timestamp: "2026-02-28 09:30", employee: "Taylor Singh", query: "Performance review timeline", action: "Answered by AI (auto)", confidence: "high", respondedBy: "PingHR Bot", resolution: "Instant" },
];

export default function AuditLog() {
  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Audit Log</h1>
          <p className="text-muted-foreground">Complete record of all PingHR interactions and resolutions</p>
        </div>

        <div className="bg-card border rounded-xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">Time</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Employee</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Query</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Action</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Confidence</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Resolution</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="p-3 text-muted-foreground whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-3 font-medium">{log.employee}</td>
                    <td className="p-3 max-w-[200px] truncate">{log.query}</td>
                    <td className="p-3 text-muted-foreground text-xs">{log.action}</td>
                    <td className="p-3">
                      <Badge variant={log.confidence === "high" ? "default" : "outline"} className="text-xs">
                        {log.confidence === "high" ? (
                          <CheckCircle2 className="h-3 w-3 mr-1 text-success" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 mr-1 text-warning" />
                        )}
                        {log.confidence}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <span className={log.resolution === "Instant" ? "text-success font-medium" : log.resolution === "Pending" ? "text-warning" : ""}>
                        {log.resolution}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
