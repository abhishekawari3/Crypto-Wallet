import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--app-bg)] text-[var(--muted)]">
        Loading NexaWallet...
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/user/sign_in" replace />;
}
