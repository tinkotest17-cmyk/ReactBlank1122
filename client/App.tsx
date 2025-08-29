import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Context Providers
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { TradingProvider } from "./contexts/TradingContext";
import { ThemeProvider } from "./contexts/ThemeContext";

// Pages
import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import History from "./pages/History";
import Admin from "./pages/Admin";
import TradingPair from "./pages/TradingPair";
import Convert from "./pages/Convert";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";

// Components
import Layout from "./components/Layout";

const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <Layout>{children}</Layout>;
}

// Auth Route Component (redirects to dashboard if already logged in)
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Welcome Route Component (shows welcome page if not authenticated)
function WelcomeRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// App Router Component
function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Welcome Route */}
        <Route path="/" element={
          <WelcomeRoute>
            <Welcome />
          </WelcomeRoute>
        } />

        {/* Auth Routes */}
        <Route path="/auth" element={
          <AuthRoute>
            <Auth />
          </AuthRoute>
        } />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/deposit" element={
          <ProtectedRoute>
            <Deposit />
          </ProtectedRoute>
        } />

        <Route path="/withdraw" element={
          <ProtectedRoute>
            <Withdraw />
          </ProtectedRoute>
        } />

        <Route path="/history" element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />

        <Route path="/convert" element={
          <ProtectedRoute>
            <Convert />
          </ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute>
            <UserManagement />
          </ProtectedRoute>
        } />

        <Route path="/pair/:symbol" element={
          <ProtectedRoute>
            <TradingPair />
          </ProtectedRoute>
        } />

        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <TradingProvider>
            <Toaster />
            <Sonner />
            <AppRouter />
          </TradingProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
