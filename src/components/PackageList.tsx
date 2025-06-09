
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, PACKAGE_TYPE_LABELS } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { 
  Play, 
  DollarSign, 
  Calendar,
  User,
  TrendingUp,
  CreditCard
} from 'lucide-react';

interface PackageListProps {
  packages: Package[];
  onManageVideos: (pkg: Package) => void;
  onManagePayments?: (pkg: Package) => void;
  onRefresh: () => void;
}

const PackageList: React.FC<PackageListProps> = ({ packages, onManageVideos, onManagePayments, onRefresh }) => {
  const { user } = useAuth();

  const getStatusColor = (status: Package['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusLabel = (status: Package['status']) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  if (packages.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pacote encontrado</h3>
          <p className="text-gray-500">Crie seu primeiro pacote para começar.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {packages.map((pkg) => (
        <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{pkg.clientName}</CardTitle>
              <Badge className={getStatusColor(pkg.status)}>
                {getStatusLabel(pkg.status)}
              </Badge>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <User className="h-4 w-4 mr-1" />
              {PACKAGE_TYPE_LABELS[pkg.type]}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex items-center text-gray-600 mb-1">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Valor Total
                </div>
                <div className="font-semibold">R$ {pkg.totalValue.toFixed(2)}</div>
              </div>
              
              <div>
                <div className="flex items-center text-gray-600 mb-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Lucro Líquido
                </div>
                <div className={`font-semibold ${pkg.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {pkg.netProfit.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t">
              <div className="flex items-center text-xs text-gray-500 mb-3">
                <Calendar className="h-3 w-3 mr-1" />
                Criado em {format(new Date(pkg.createdAt), "dd/MM/yyyy", { locale: ptBR })}
              </div>
              
              <div className="space-y-2">
                {(user?.role === 'admin' || user?.role === 'video_manager') && pkg.type === 'package' && (
                  <Button 
                    onClick={() => onManageVideos(pkg)}
                    className="w-full"
                    size="sm"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Gerenciar Vídeos
                  </Button>
                )}

                {(user?.role === 'admin' || user?.role === 'financial') && onManagePayments && (
                  <Button 
                    onClick={() => onManagePayments(pkg)}
                    className="w-full"
                    size="sm"
                    variant="outline"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Gerenciar Pagamentos
                  </Button>
                )}
              </div>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <div>Comissão Juninho: R$ {(pkg.juninhoCommission ?? 0).toFixed(2)}</div>
              <div>Comissão Natália: R$ {(pkg.nataliaCommission ?? 0).toFixed(2)}</div>
              <div>Custo Engajamento: R$ {(pkg.engagementCost ?? 0).toFixed(2)}</div>
              <div>Pró-Labore: R$ {(pkg.proLabore ?? 0).toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PackageList;
