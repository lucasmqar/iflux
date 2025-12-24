import { User, Delivery, CreditHistory, UserRole, DeliveryStatus } from '@/types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin Master',
    email: 'admin@flux.com',
    role: 'admin',
    credits: 999,
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Loja Express',
    email: 'loja@express.com',
    role: 'empresa',
    credits: 10,
    validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    phone: '64999999999',
    createdAt: new Date('2024-06-15'),
  },
  {
    id: '3',
    name: 'Mercado Central',
    email: 'contato@mercado.com',
    role: 'empresa',
    credits: 0,
    validUntil: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date('2024-08-20'),
  },
  {
    id: '4',
    name: 'João Entregador',
    email: 'joao@entregador.com',
    role: 'entregador',
    credits: 5,
    validUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    phone: '64988888888',
    createdAt: new Date('2024-07-10'),
  },
  {
    id: '5',
    name: 'Maria Entregas',
    email: 'maria@entregas.com',
    role: 'entregador',
    credits: 3,
    validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date('2024-09-01'),
  },
];

// Mock Deliveries
export const mockDeliveries: Delivery[] = [
  {
    id: '1',
    code: 'FLX-001',
    companyId: '2',
    companyName: 'Loja Express',
    pickupAddress: 'Rua das Flores, 123 - Centro',
    deliveryAddress: 'Av. Brasil, 456 - Jardim América',
    itemDescription: 'Caixa pequena com documentos',
    status: 'ABERTA',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    estimatedDistance: '3.2 km',
  },
  {
    id: '2',
    code: 'FLX-002',
    companyId: '2',
    companyName: 'Loja Express',
    deliveryPersonId: '4',
    deliveryPersonName: 'João Entregador',
    pickupAddress: 'Shopping Center, Loja 45',
    deliveryAddress: 'Rua Goiás, 789 - Setor Central',
    itemDescription: 'Pacote médio - Eletrônicos',
    notes: 'Frágil - Manusear com cuidado',
    status: 'ACEITA',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    acceptedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    estimatedDistance: '5.8 km',
  },
  {
    id: '3',
    code: 'FLX-003',
    companyId: '2',
    companyName: 'Loja Express',
    deliveryPersonId: '5',
    deliveryPersonName: 'Maria Entregas',
    pickupAddress: 'Distribuidora ABC, Setor Industrial',
    deliveryAddress: 'Condomínio Residencial, Bloco B, Apt 302',
    itemDescription: 'Encomenda grande - Móveis',
    status: 'COLETADA',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    acceptedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    collectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    estimatedDistance: '8.1 km',
  },
  {
    id: '4',
    code: 'FLX-004',
    companyId: '2',
    companyName: 'Loja Express',
    deliveryPersonId: '4',
    deliveryPersonName: 'João Entregador',
    pickupAddress: 'Farmácia Popular, Centro',
    deliveryAddress: 'Rua Minas Gerais, 321',
    itemDescription: 'Medicamentos',
    status: 'CONCLUIDA',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    acceptedAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
    collectedAt: new Date(Date.now() - 22 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 21 * 60 * 60 * 1000),
    estimatedDistance: '2.5 km',
  },
  {
    id: '5',
    code: 'FLX-005',
    companyId: '3',
    companyName: 'Mercado Central',
    pickupAddress: 'Mercado Central, Setor 5',
    deliveryAddress: 'Rua Paraná, 555',
    itemDescription: 'Compras de supermercado',
    status: 'CANCELADA',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    cancelledAt: new Date(Date.now() - 47 * 60 * 60 * 1000),
    estimatedDistance: '4.0 km',
  },
];

// Mock Credit History
export const mockCreditHistory: CreditHistory[] = [
  {
    id: '1',
    userId: '2',
    amount: 5,
    addedBy: 'Admin Master',
    addedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    previousValidUntil: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    newValidUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    userId: '2',
    amount: 5,
    addedBy: 'Admin Master',
    addedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    previousValidUntil: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    newValidUntil: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

// Helper function to check if user has valid credits
export const hasValidCredits = (user: User): boolean => {
  return new Date() < new Date(user.validUntil);
};

// Get deliveries by status
export const getDeliveriesByStatus = (status: DeliveryStatus): Delivery[] => {
  return mockDeliveries.filter(d => d.status === status);
};

// Get user deliveries (for company)
export const getCompanyDeliveries = (companyId: string): Delivery[] => {
  return mockDeliveries.filter(d => d.companyId === companyId);
};

// Get deliverer deliveries
export const getDelivererDeliveries = (delivererId: string): Delivery[] => {
  return mockDeliveries.filter(d => d.deliveryPersonId === delivererId);
};

// Get available deliveries for deliverers
export const getAvailableDeliveries = (): Delivery[] => {
  return mockDeliveries.filter(d => d.status === 'ABERTA');
};

// Stats helpers
export const getStats = () => ({
  totalUsers: mockUsers.length,
  totalCompanies: mockUsers.filter(u => u.role === 'empresa').length,
  totalDeliverers: mockUsers.filter(u => u.role === 'entregador').length,
  activeUsers: mockUsers.filter(u => hasValidCredits(u)).length,
  totalDeliveries: mockDeliveries.length,
  openDeliveries: mockDeliveries.filter(d => d.status === 'ABERTA').length,
  completedDeliveries: mockDeliveries.filter(d => d.status === 'CONCLUIDA').length,
  cancelledDeliveries: mockDeliveries.filter(d => d.status === 'CANCELADA').length,
});
