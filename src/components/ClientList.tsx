import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Client } from '@/types';
import { getClientRevenue, deleteClient } from '@/services/api';
import { useNotifications } from '@/contexts/NotificationContext';
import { 
  Edit, 
  Trash2, 
  Users,
  Eye,
  DollarSign,
  Building,
  Star
} from 'lucide-react';

interface ClientListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onRefresh: () => void;
  onViewDetails: (client: Client) => void;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onEdit, onRefresh, onViewDetails }) => {
  const { addNotification } = useNotifications();
  const [clientRevenues, setClientRevenues] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadClientRevenues = async () => {
      const revenues: Record<string, number> = {};
      for (const client of clients) {
        revenues[client.id] = await getClientRevenue(client.id);
      }
      setClientRevenues(revenues);
    };

    if (clients.length > 0) {
      loadClientRevenues();
    }
  }, [clients]);

  const handleDelete = async (client: Client) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente "${client.name}"?`)) {
      try {
        await deleteClient(client.id);
        addNotification({
          title: 'Cliente Excluído',
          message: 'Cliente excluído com sucesso!',
          type: 'success'
        });
        onRefresh();
      } catch (error) {
        addNotification({
          title: 'Erro',
          message: 'Erro ao excluir cliente. Tente novamente.',
          type: 'error'
        });
      }
    }
  };

  if (clients.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente encontrado</h3>
          <p className="text-gray-500">Cadastre seu primeiro cliente para começar.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5" />
          Clientes Cadastrados ({clients.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Agência</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Receita Total</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <div className="flex items-center">
                    {client.isFrequent && (
                      <Star className="h-4 w-4 text-yellow-500 mr-2" />
                    )}
                    <span className="font-medium">{client.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {client.agencyName ? (
                    <div className="flex items-center">
                      <Building className="h-4 w-4 text-gray-400 mr-1" />
                      {client.agencyName}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={client.isFrequent ? "default" : "secondary"}>
                    {client.isFrequent ? 'Frequente' : 'Regular'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                    <span className="font-medium">
                      R$ {(clientRevenues[client.id] || 0).toFixed(2)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewDetails(client)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onEdit(client)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(client)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ClientList;
