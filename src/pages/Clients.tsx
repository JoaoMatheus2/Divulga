import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Client } from '@/types';
import { getClients } from '@/services/api';
import Layout from '@/components/Layout';
import ClientForm from '@/components/ClientForm';
import ClientList from '@/components/ClientList';
import ClientDetails from '@/components/ClientDetails';
import { Plus, ArrowLeft } from 'lucide-react';

type ViewMode = 'list' | 'form' | 'details';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  const loadClients = async () => {
    try {
      setLoading(true);
      const clientsData = await getClients();
      setClients(clientsData);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleNewClient = () => {
    setSelectedClient(null);
    setViewMode('form');
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setViewMode('form');
  };

  const handleViewDetails = (client: Client) => {
    setSelectedClient(client);
    setViewMode('details');
  };

  const handleFormSave = () => {
    loadClients();
    setViewMode('list');
    setSelectedClient(null);
  };

  const handleFormCancel = () => {
    setViewMode('list');
    setSelectedClient(null);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedClient(null);
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando clientes...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            {viewMode !== 'list' && (
              <Button variant="outline" onClick={handleBackToList} className="mr-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {viewMode === 'list' && 'Clientes'}
              {viewMode === 'form' && (selectedClient ? 'Editar Cliente' : 'Novo Cliente')}
              {viewMode === 'details' && selectedClient?.name}
            </h1>
          </div>
          
          {viewMode === 'list' && (
            <Button onClick={handleNewClient}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          )}
        </div>

        {viewMode === 'list' && (
          <ClientList
            clients={clients}
            onEdit={handleEditClient}
            onRefresh={loadClients}
            onViewDetails={handleViewDetails}
          />
        )}

        {viewMode === 'form' && (
          <ClientForm
            client={selectedClient}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        )}

        {viewMode === 'details' && selectedClient && (
          <ClientDetails client={selectedClient} />
        )}
      </div>
    </Layout>
  );
};

export default Clients;
