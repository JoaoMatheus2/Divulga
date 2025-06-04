
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Package, Client } from '@/types';
import {  calculateFinancials } from '@/services/dataService';
import {  getClients, createPackage } from '@/services/api';
import { useNotifications } from '@/contexts/NotificationContext';
import { DollarSign, Calculator, ChevronDown } from 'lucide-react';

interface PackageFormProps {
  type: 'package' | 'post';
  onSuccess: () => void;
  onCancel: () => void;
}

const PackageForm: React.FC<PackageFormProps> = ({ type, onSuccess, onCancel }) => {
  const { addNotification } = useNotifications();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    clientName: '',
    totalValue: 0
  });
  const [financials, setFinancials] = useState({
    juninhoCommission: 20,
    nataliaCommission: 0,
    engagementCost: type === 'package' ? 10 : 2,
    proLabore: 0,
    netProfit: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const clientsData = await getClients();
      setClients(clientsData);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const updateFinancials = (totalValue: number) => {
    const calculated = calculateFinancials(totalValue, type);
    setFinancials(calculated);
  };

  const handleClientNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, clientName: value }));
    
    if (value.length > 0) {
      const filtered = clients.filter(client => 
        client.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredClients(filtered);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
      setSelectedClient(null);
    }
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setFormData(prev => ({ ...prev, clientName: client.name }));
    setShowDropdown(false);
  };

  const handleTotalValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setFormData(prev => ({ ...prev, totalValue: value }));
    updateFinancials(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientName || formData.totalValue <= 0) {
      addNotification({
        title: 'Erro',
        message: 'Por favor, preencha todos os campos obrigatórios.',
        type: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      const packageData: Omit<Package, 'id' | 'createdAt' | 'updatedAt'> = {
        clientId: selectedClient?.id,
        clientName: formData.clientName,
        type,
        totalValue: formData.totalValue,
        juninhoCommission: financials.juninhoCommission,
        nataliaCommission: financials.nataliaCommission,
        engagementCost: financials.engagementCost,
        proLabore: financials.proLabore,
        netProfit: financials.netProfit,
        status: 'active'
      };

      await createPackage(packageData);

      addNotification({
        title: 'Sucesso',
        message: `${type === 'package' ? 'Pacote' : 'Post'} criado com sucesso!`,
        type: 'success'
      });

      onSuccess();
    } catch (error) {
      addNotification({
        title: 'Erro',
        message: 'Erro ao criar o registro. Tente novamente.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="relative">
            <Label htmlFor="clientName">Nome do Cliente *</Label>
            <div className="relative">
              <Input
                id="clientName"
                type="text"
                value={formData.clientName}
                onChange={handleClientNameChange}
                onFocus={() => {
                  if (formData.clientName.length > 0 && filteredClients.length > 0) {
                    setShowDropdown(true);
                  }
                }}
                onBlur={() => {
                  // Delay hiding dropdown to allow for click
                  setTimeout(() => setShowDropdown(false), 200);
                }}
                placeholder="Digite o nome do cliente"
                required
                className="pr-8"
              />
              <ChevronDown className="absolute right-2 top-3 h-4 w-4 text-gray-400" />
            </div>
            
            {showDropdown && filteredClients.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleClientSelect(client)}
                  >
                    <div className="font-medium">{client.name}</div>
                    {client.agencyName && (
                      <div className="text-sm text-gray-500">{client.agencyName}</div>
                    )}
                    {client.isFrequent && (
                      <div className="text-xs text-blue-600">Cliente Frequente</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="totalValue">Valor Total (R$) *</Label>
            <Input
              id="totalValue"
              type="number"
              step="0.01"
              min="0"
              value={formData.totalValue || ''}
              onChange={handleTotalValueChange}
              placeholder="0,00"
              required
            />
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <Calculator className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold">Cálculos Automáticos</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Comissão Juninho:</span>
                <span className="font-medium">R$ {financials.juninhoCommission.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Comissão Natália (5%):</span>
                <span className="font-medium">R$ {financials.nataliaCommission.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Custo Engajamento:</span>
                <span className="font-medium">R$ {financials.engagementCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pró-Labore (70%):</span>
                <span className="font-medium">R$ {financials.proLabore.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Lucro Líquido:</span>
                <span className={financials.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                  R$ {financials.netProfit.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex space-x-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'Criando...' : `Criar ${type === 'package' ? 'Pacote' : 'Post'}`}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default PackageForm;