import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import DashboardCards from "@/components/DashboardCards";
import ChatPanel from "@/components/ChatPanel";

export default function Index() {
  const [chatOpen, setChatOpen] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>();

  const handleQuickAction = (prompt: string) => {
    setInitialPrompt(prompt);
    setChatOpen(true);
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"} 👋
              </h1>
              <p className="text-muted-foreground">
                How can PingHR help you today? Click a topic or start chatting.
              </p>
            </div>
            <Button
              onClick={() => {
                setInitialPrompt(undefined);
                setChatOpen(true);
              }}
              className="gap-2 rounded-xl shadow-soft"
            >
              <Sparkles className="h-4 w-4" />
              Ask PingHR
            </Button>
          </div>
        </motion.div>

        {/* Use case cards */}
        <DashboardCards onQuickAction={handleQuickAction} />
      </div>

      {/* Slide-out chat */}
      <ChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        initialPrompt={initialPrompt}
      />
    </AppLayout>
  );
}
