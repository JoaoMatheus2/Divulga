
import { Package, Video, FinancialReport, Client, PaymentStatus } from '@/types';

// Mock data storage
let packages: Package[] = [];
let videos: Video[] = [];
let clients: Client[] = [];

// Helper function to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Financial calculation function
export const calculateFinancials = (totalValue: number, type: 'package' | 'post') => {
  const juninhoCommission = 20; // Fixed R$20
  const nataliaCommission = totalValue * 0.05; // 5% of total
  const engagementCost = type === 'package' ? 10 : 2; // R$10 for packages, R$2 for posts
  const proLabore = totalValue * 0.7; // 70% of total
  const netProfit = totalValue - juninhoCommission - nataliaCommission - engagementCost - proLabore;

  return {
    juninhoCommission,
    nataliaCommission,
    engagementCost,
    proLabore,
    netProfit
  };
};

// Client functions
export const createClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
  const newClient: Client = {
    ...clientData,
    id: generateId(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  clients.push(newClient);
  return newClient;
};

export const getClients = async (): Promise<Client[]> => {
  return clients;
};

export const getClientById = async (id: string): Promise<Client | null> => {
  return clients.find(client => client.id === id) || null;
};

export const updateClient = async (id: string, updates: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Client | null> => {
  const clientIndex = clients.findIndex(client => client.id === id);
  
  if (clientIndex !== -1) {
    clients[clientIndex] = {
      ...clients[clientIndex],
      ...updates,
      updatedAt: new Date()
    };
    return clients[clientIndex];
  }
  
  return null;
};

export const deleteClient = async (id: string): Promise<boolean> => {
  const clientIndex = clients.findIndex(client => client.id === id);
  
  if (clientIndex !== -1) {
    clients.splice(clientIndex, 1);
    return true;
  }
  
  return false;
};

export const getClientPackages = async (clientId: string): Promise<Package[]> => {
  return packages.filter(pkg => pkg.clientId === clientId);
};

export const getClientRevenue = async (clientId: string): Promise<number> => {
  const clientPackages = await getClientPackages(clientId);
  return clientPackages.reduce((sum, pkg) => sum + pkg.totalValue, 0);
};

// Create a new package
export const createPackage = async (packageData: Omit<Package, 'id' | 'createdAt' | 'updatedAt' | 'paymentStatus'>): Promise<Package> => {
  const newPackage: Package = {
    ...packageData,
    id: generateId(),
    paymentStatus: {
      totalValuePaid: false,
      juninhoCommissionPaid: false,
      nataliaCommissionPaid: false,
      engagementCostPaid: false,
      proLaborePaid: false
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  packages.push(newPackage);

  // Create videos automatically for both packages and posts
  if (packageData.type === 'package') {
        // Packages have 5 videos
    for (let i = 1; i <= 5; i++) {
      const video: Video = {
        id: generateId(),
        packageId: newPackage.id,
        videoNumber: i,
        status: 'briefing_sent',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      videos.push(video);
    }
  }else if (packageData.type === 'post') {
    // Posts have 1 video
    const video: Video = {
      id: generateId(),
      packageId: newPackage.id,
      videoNumber: 1,
      status: 'briefing_sent',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    videos.push(video);

  }
  return newPackage;
};

// Update package status
export const updatePackageStatus = async (packageId: string, status: Package['status']): Promise<Package | null> => {
  const packageIndex = packages.findIndex(pkg => pkg.id === packageId);
  
  if (packageIndex !== -1) {
    packages[packageIndex] = {
      ...packages[packageIndex],
      status,
      updatedAt: new Date()
    };
    return packages[packageIndex];
  }
  
  return null;
};

// Get videos by package ID


// Update video status
// export const updateVideoStatus = async (videoId: string, status: Video['status']): Promise<Video | null> => {
//   const videoIndex = videos.findIndex(video => video.id === videoId);
  
//   if (videoIndex !== -1) {
//     videos[videoIndex] = {
//       ...videos[videoIndex],
//       status,
//       updatedAt: new Date()
//     };
//     return videos[videoIndex];
//   }
  
//   return null;
// };

// Update payment status
export const updatePaymentStatus = async (packageId: string, paymentField: keyof PaymentStatus, paid: boolean): Promise<Package | null> => {
  const packageIndex = packages.findIndex(pkg => pkg.id === packageId);
  
  if (packageIndex !== -1) {
    packages[packageIndex] = {
      ...packages[packageIndex],
      paymentStatus: {
        ...packages[packageIndex].paymentStatus,
        [paymentField]: paid
      },
      updatedAt: new Date()
    };
    return packages[packageIndex];
  }
  
  return null;
};

// Get package payment summary
export const getPackagePaymentSummary = async (packageId: string) => {
  const pkg = packages.find(p => p.id === packageId);
  if (!pkg) return null;

  const payments = [
    { name: 'Valor Total', amount: pkg.totalValue, paid: pkg.paymentStatus.totalValuePaid, field: 'totalValuePaid' as keyof PaymentStatus },
    { name: 'Comissão Juninho', amount: pkg.juninhoCommission, paid: pkg.paymentStatus.juninhoCommissionPaid, field: 'juninhoCommissionPaid' as keyof PaymentStatus },
    { name: 'Comissão Natália', amount: pkg.nataliaCommission, paid: pkg.paymentStatus.nataliaCommissionPaid, field: 'nataliaCommissionPaid' as keyof PaymentStatus },
    { name: 'Custo Engajamento', amount: pkg.engagementCost, paid: pkg.paymentStatus.engagementCostPaid, field: 'engagementCostPaid' as keyof PaymentStatus },
    { name: 'Pró-Labore', amount: pkg.proLabore, paid: pkg.paymentStatus.proLaborePaid, field: 'proLaborePaid' as keyof PaymentStatus }
  ];

  const totalPaid = payments.filter(p => p.paid).reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => !p.paid).reduce((sum, p) => sum + p.amount, 0);

  return {
    payments,
    totalPaid,
    totalPending,
    allPaid: payments.every(p => p.paid)
  };
};

// Get financial report
export const getFinancialReport = async (startDate?: Date, endDate?: Date): Promise<FinancialReport> => {
  let filteredPackages = packages;
  
  if (startDate || endDate) {
    filteredPackages = packages.filter(pkg => {
      const pkgDate = pkg.createdAt;
      if (startDate && pkgDate < startDate) return false;
      if (endDate && pkgDate > endDate) return false;
      return true;
    });
  }

  const totalRevenue = filteredPackages.reduce((sum, pkg) => sum + pkg.totalValue, 0);
  const totalJuninhoCommission = filteredPackages.reduce((sum, pkg) => sum + pkg.juninhoCommission, 0);
  const totalNataliaCommission = filteredPackages.reduce((sum, pkg) => sum + pkg.nataliaCommission, 0);
  const totalEngagementCost = filteredPackages.reduce((sum, pkg) => sum + pkg.engagementCost, 0);
  const totalProLabore = filteredPackages.reduce((sum, pkg) => sum + pkg.proLabore, 0);
  const netProfit = filteredPackages.reduce((sum, pkg) => sum + pkg.netProfit, 0);
  
  const packagesCount = filteredPackages.filter(pkg => pkg.type === 'package').length;
  const postsCount = filteredPackages.filter(pkg => pkg.type === 'post').length;

  return {
    totalRevenue,
    totalJuninhoCommission,
    totalNataliaCommission,
    totalEngagementCost,
    totalProLabore,
    netProfit,
    packagesCount,
    postsCount,
    period: startDate && endDate 
      ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
      : 'Todos os períodos'
  };
};
