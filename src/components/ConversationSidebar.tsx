import { useState } from "react";
import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export interface Conversation {
  id: string;
  preview: string;
  timestamp: Date;
  isActive?: boolean;
}

const mockConversations: Conversation[] = [
  { id: "1", preview: "What is the annual leave poli...", timestamp: new Date(Date.now() - 4 * 86400000) },
  { id: "2", preview: "What mental health resource...", timestamp: new Date(Date.now() - 4 * 86400000) },
  { id: "3", preview: "When is payday and how do ...", timestamp: new Date(Date.now() - 4 * 86400000) },
  { id: "4", preview: "When is payday and how do ...", timestamp: new Date(Date.now() - 4 * 86400000) },
  { id: "5", preview: "What health insurance benef...", timestamp: new Date(Date.now() - 4 * 86400000) },
  { id: "6", preview: "When is payday and how do ...", timestamp: new Date(Date.now() - 3 * 86400000) },
  { id: "7", preview: "Can you explain Acme's payr...", timestamp: new Date(Date.now() - 3 * 86400000) },
  { id: "8", preview: "What leave policies does Ac...", timestamp: new Date(Date.now() - 3 * 86400000) },
  { id: "9", preview: "What are Acme's key compa...", timestamp: new Date(Date.now() - 3 * 86400000) },
];

function timeAgo(date: Date): string {
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

interface ConversationSidebarProps {
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
}

export default function ConversationSidebar({
  activeConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationSidebarProps) {
  const { user, signOut } = useAuth();
  const displayName = user?.email?.split("@")[0] ?? "User";
  const displayEmail = user?.email ?? "";

  return (
    <aside className="w-72 border-r bg-card flex flex-col h-full">
      {/* Branding */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-sm font-bold text-primary-foreground">P</span>
        </div>
        <span className="font-semibold text-base tracking-tight">PingHR</span>
      </div>

      {/* New Conversation */}
      <div className="px-4 pb-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 text-sm font-normal h-10"
          onClick={onNewConversation}
        >
          <Plus className="h-4 w-4" />
          New conversation
        </Button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-0.5">
        {mockConversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelectConversation(conv.id)}
            className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors ${
              activeConversationId === conv.id
                ? "bg-accent text-accent-foreground"
                : "hover:bg-muted/60"
            }`}
          >
            <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="text-sm truncate">{conv.preview}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">{timeAgo(conv.timestamp)}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* User Profile */}
      <div className="border-t px-4 py-3">
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-muted/60 transition-colors"
        >
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-primary-foreground">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm font-medium truncate capitalize">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
          </div>
        </button>
      </div>
    </aside>
  );
}
