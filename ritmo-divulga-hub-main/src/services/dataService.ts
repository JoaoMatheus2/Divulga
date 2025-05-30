
import { Package, Video, FinancialReport } from '@/types';

// Mock data storage
let packages: Package[] = [];
let videos: Video[] = [];

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

// Create a new package
export const createPackage = async (packageData: Omit<Package, 'id' | 'createdAt' | 'updatedAt'>): Promise<Package> => {
  const newPackage: Package = {
    ...packageData,
    id: generateId(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  packages.push(newPackage);

  // If it's a package type, create 5 videos automatically
  if (packageData.type === 'package') {
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
  }

  return newPackage;
};

// Get all packages
export const getPackages = async (): Promise<Package[]> => {
  return packages;
};

// Get videos by package ID
export const getVideosByPackageId = async (packageId: string): Promise<Video[]> => {
  return videos.filter(video => video.packageId === packageId);
};

// Update video status
export const updateVideoStatus = async (videoId: string, status: Video['status']): Promise<Video | null> => {
  const videoIndex = videos.findIndex(video => video.id === videoId);
  
  if (videoIndex !== -1) {
    videos[videoIndex] = {
      ...videos[videoIndex],
      status,
      updatedAt: new Date()
    };
    return videos[videoIndex];
  }
  
  return null;
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
