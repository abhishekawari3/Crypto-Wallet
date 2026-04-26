import "./App.css";

import Home from "./components/Home";
import { BrowserRouter as Router, Navigate, Routes, Route } from "react-router-dom";
import GenMnemonic from "./components/GenMnemonic";
import Form from "./components/Form";
import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "./auth";
import ProtectedRoute from "./ProtectedRoute";

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
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
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
