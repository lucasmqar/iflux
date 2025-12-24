import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Perfil from "./pages/Perfil";
import Creditos from "./pages/Creditos";
import MinhasEntregas from "./pages/MinhasEntregas";

// Admin pages
import GerenciarUsuarios from "./pages/admin/GerenciarUsuarios";
import MonitorarEntregas from "./pages/admin/MonitorarEntregas";
import GerenciarCreditos from "./pages/admin/GerenciarCreditos";

// Empresa pages
import NovaEntrega from "./pages/empresa/NovaEntrega";

// Entregador pages
import EntregasDisponiveis from "./pages/entregador/EntregasDisponiveis";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Login />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/creditos" element={<Creditos />} />
            <Route path="/minhas-entregas" element={<MinhasEntregas />} />

            {/* Admin routes */}
            <Route path="/usuarios" element={<GerenciarUsuarios />} />
            <Route path="/entregas" element={<MonitorarEntregas />} />
            <Route path="/gerenciar-creditos" element={<GerenciarCreditos />} />

            {/* Empresa routes */}
            <Route path="/nova-entrega" element={<NovaEntrega />} />

            {/* Entregador routes */}
            <Route path="/disponiveis" element={<EntregasDisponiveis />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
