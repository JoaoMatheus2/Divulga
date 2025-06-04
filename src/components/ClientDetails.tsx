import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Client, Package, PACKAGE_TYPE_LABELS } from '@/types';
import { getClientPackages, getClientRevenue } from '@/services/api';
import { 
  User, 
  Building, 
  Star, 
  DollarSign, 
  Calendar,
  Package as PackageIcon,
  FileText,
  TrendingUp
} from 'lucide-react';

interface ClientDetailsProps {
  client: Client;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ client }) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClientData = async () => {
      try {
        const [clientPackages, revenue] = await Promise.all([
          getClientPackages(client.id),
          getClientRevenue(client.id)
        ]);
        
        setPackages(clientPackages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setTotalRevenue(revenue);
      } catch (error) {
        console.error('Erro ao carregar dados do cliente:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClientData();
  }, [client.id]);

  const recentPackages = packages.filter(pkg => pkg.type === 'package').slice(0, 5);
  const recentPosts = packages.filter(pkg => pkg.type === 'post').slice(0, 5);

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
      case 'briefing_sent' : return 'Briefing Enviado';
      case 'video_posted' : return 'Vídeo Postado';
      case 'sent_to_group' : return 'Enviado no Grupo';
      case 'engaged' : return 'Vídeo Engajado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando dados do cliente...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Informações do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Informações do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center mb-2">
                {client.isFrequent && <Star className="h-4 w-4 text-yellow-500 mr-2" />}
                <h3 className="text-lg font-semibold">{client.name}</h3>
              </div>
              <Badge variant={client.isFrequent ? "default" : "secondary"}>
                {client.isFrequent ? 'Cliente Frequente' : 'Cliente Regular'}
              </Badge>
            </div>

            {client.agencyName && (
              <div>
                <div className="flex items-center text-gray-600 mb-1">
                  <Building className="h-4 w-4 mr-1" />
                  Agência
                </div>
                <p className="font-medium">{client.agencyName}</p>
              </div>
            )}

            <div>
              <div className="flex items-center text-gray-600 mb-1">
                <Calendar className="h-4 w-4 mr-1" />
                Cliente desde
              </div>
              <p className="font-medium">{ new Date(client.createdAt).toLocaleString() }</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="mr-2 h-5 w-5" />
            Resumo Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                R$ {totalRevenue.toFixed(2)}
              </div>
              <p className="text-gray-600">Receita Total</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {packages.length}
              </div>
              <p className="text-gray-600">Total de Trabalhos</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                R$ {packages.length > 0 ? (totalRevenue / packages.length).toFixed(2) : '0.00'}
              </div>
              <p className="text-gray-600">Ticket Médio</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Últimos Pacotes */}
      {recentPackages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PackageIcon className="mr-2 h-5 w-5" />
              Últimos Pacotes ({recentPackages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Lucro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPackages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell>{ new Date(pkg.createdAt).toLocaleString() }</TableCell>
                    <TableCell>R$ {pkg.totalValue.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(pkg.status)}>
                        {getStatusLabel(pkg.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className={pkg.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      R$ {pkg.netProfit.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Últimos Posts */}
      {recentPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Últimos Posts ({recentPosts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Lucro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPosts.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell>{ new Date(pkg.createdAt).toLocaleString() }</TableCell>
                    <TableCell>R$ {pkg.totalValue.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(pkg.status)}>
                        {getStatusLabel(pkg.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className={pkg.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      R$ {pkg.netProfit.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {packages.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum trabalho realizado</h3>
            <p className="text-gray-500">Este cliente ainda não possui pacotes ou posts cadastrados.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientDetails;
