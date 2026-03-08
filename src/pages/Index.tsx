import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { role, loading } = useAuth();

  if (loading) return null;

  // HR users go to HR Chat, employees go to regular Chat
  if (role === "hr") {
    return <Navigate to="/hr-chat" replace />;
  }

  return <Navigate to="/chat" replace />;
}
