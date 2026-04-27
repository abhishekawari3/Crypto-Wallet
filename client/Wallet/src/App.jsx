import "./App.css";
import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Navigate, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "./auth";
import ProtectedRoute from "./ProtectedRoute";

const Home = lazy(() => import("./components/Home"));
const GenMnemonic = lazy(() => import("./components/GenMnemonic"));
const Form = lazy(() => import("./components/Form"));

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Suspense fallback={<div className="min-h-screen grid place-items-center text-sm text-[var(--muted)]">Loading…</div>}>
            <Routes>
              <Route path="/" element={<Navigate to="/user/sign_in" replace />} />
              <Route path="/user/sign_in" element={<Form isSigninPage={true} />} />
              <Route path="/user/sign_up" element={<Form isSigninPage={false} />} />
              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/generate-mnemonic" element={<ProtectedRoute><GenMnemonic isSolana={true} /></ProtectedRoute>} />
              <Route path="/solana" element={<ProtectedRoute><GenMnemonic isSolana={true} /></ProtectedRoute>} />
              <Route path="/ethereum" element={<ProtectedRoute><GenMnemonic isSolana={false} /></ProtectedRoute>} />
              <Route path="/eth" element={<Navigate to="/ethereum" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
