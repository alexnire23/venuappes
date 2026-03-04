import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Auth from "./pages/Auth";
import SupermarketSelect from "./pages/SupermarketSelect";

import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Write from "./pages/Write";
import Confirm from "./pages/Confirm";
import Results from "./pages/Results";
import SearchPage from "./pages/Search";
import Paywall from "./pages/Paywall";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
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
            <Route path="/" element={<Navigate to="/select" replace />} />
            <Route path="/select" element={<SupermarketSelect />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/write" element={<Write />} />
            <Route path="/confirm" element={<Confirm />} />
            <Route path="/results" element={<Results />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/paywall" element={<Paywall />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
