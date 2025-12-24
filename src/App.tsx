import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Perfil from "./pages/Perfil";
import Creditos from "./pages/Creditos";
import MeusPedidos from "./pages/MeusPedidos";
import PedidoDetalhes from "./pages/PedidoDetalhes";
import Notificacoes from "./pages/Notificacoes";

// Empresa pages
import NovoPedido from "./pages/empresa/NovoPedido";

// Entregador pages
import PedidosDisponiveis from "./pages/entregador/PedidosDisponiveis";

// Admin pages
import GerenciarUsuarios from "./pages/admin/GerenciarUsuarios";
import GerenciarPedidos from "./pages/admin/GerenciarPedidos";
import GerenciarCreditos from "./pages/admin/GerenciarCreditos";
import GerenciarAlertas from "./pages/admin/GerenciarAlertas";

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
            <Route path="/meus-pedidos" element={<MeusPedidos />} />
            <Route path="/pedido/:id" element={<PedidoDetalhes />} />
            <Route path="/notificacoes" element={<Notificacoes />} />

            {/* Empresa routes */}
            <Route path="/novo-pedido" element={<NovoPedido />} />

            {/* Entregador routes */}
            <Route path="/disponiveis" element={<PedidosDisponiveis />} />

            {/* Admin routes */}
            <Route path="/admin/usuarios" element={<GerenciarUsuarios />} />
            <Route path="/admin/pedidos" element={<GerenciarPedidos />} />
            <Route path="/admin/creditos" element={<GerenciarCreditos />} />
            <Route path="/admin/alertas" element={<GerenciarAlertas />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
