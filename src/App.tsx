import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Chat from "./pages/Chat";
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
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute allowedRoles={["employee"]}><Index /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute allowedRoles={["employee"]}><Chat /></ProtectedRoute>} />
            <Route path="/hr-queue" element={<ProtectedRoute allowedRoles={["hr"]}><HRQueue /></ProtectedRoute>} />
            <Route path="/audit-log" element={<ProtectedRoute allowedRoles={["hr"]}><AuditLog /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
