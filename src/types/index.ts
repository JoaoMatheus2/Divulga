
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'video_manager' | 'financial';
}

export interface Client {
  id: string;
  name: string;
  agencyName?: string | null;
  isFrequent: boolean;
  createdAt: Date;
  updatedAt: Date;
}


export interface Package {
  id: string;
  clientId?: string;
  clientName: string;
  totalValue: number;
  juninhoCommission: number;
  nataliaCommission: number;
  engagementCost: number;
  proLabore: number;
  netProfit: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  type: 'package' | 'post';
}

export interface Video {
  id: string;
  packageId: string;
  videoNumber: number;
  status: 'Briefing Enviado' | 'Vídeo Postado' | 'Enviado no Grupo' | 'Vídeo Engajado';
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialReport {
  totalRevenue: number;
  totalJuninhoCommission: number;
  totalNataliaCommission: number;
  totalEngagementCost: number;
  totalProLabore: number;
  netProfit: number;
  packagesCount: number;
  postsCount: number;
  period: string;
}

export const PACKAGE_TYPE_LABELS = {
  package: 'Pacote Musical',
  post: 'Post Individual'
};

export const VIDEO_STATUS_LABELS = {
  briefing_sent: 'Briefing Enviado',
  video_posted: 'Vídeo Postado',
  sent_to_group: 'Enviado no Grupo',
  engaged: 'Vídeo Engajado'
};