export type UserRole = 'admin' | 'empresa' | 'entregador';

export type DeliveryStatus = 'ABERTA' | 'ACEITA' | 'COLETADA' | 'CONCLUIDA' | 'CANCELADA';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  credits: number;
  validUntil: Date;
  avatarUrl?: string;
  phone?: string;
  createdAt: Date;
  isBanned?: boolean;
}

export interface Delivery {
  id: string;
  code: string;
  companyId: string;
  companyName: string;
  deliveryPersonId?: string;
  deliveryPersonName?: string;
  pickupAddress: string;
  deliveryAddress: string;
  itemDescription: string;
  notes?: string;
  status: DeliveryStatus;
  pickupPhoto?: string;
  deliveryPhoto?: string;
  createdAt: Date;
  acceptedAt?: Date;
  collectedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  estimatedDistance?: string;
}

export interface CreditHistory {
  id: string;
  userId: string;
  amount: number;
  addedBy: string;
  addedAt: Date;
  previousValidUntil: Date;
  newValidUntil: Date;
}

export const WHATSAPP_SUPPORT = 'https://wa.me/5564981068393';

export const STATUS_LABELS: Record<DeliveryStatus, string> = {
  ABERTA: 'Aberta',
  ACEITA: 'Aceita',
  COLETADA: 'Coletada',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
};
