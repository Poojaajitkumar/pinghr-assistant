import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { HRTicketsProvider } from "@/contexts/HRTicketsContext";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import HRChat from "./pages/HRChat";
import HROps from "./pages/HROps";
import HRQueue from "./pages/HRQueue";
import AuditLog from "./pages/AuditLog";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <HRTicketsProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Index />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/hr-chat" element={<HRChat />} />
              <Route path="/hr-ops" element={<HROps />} />
              <Route path="/hr-queue" element={<HRQueue />} />
              <Route path="/audit-log" element={<AuditLog />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HRTicketsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
