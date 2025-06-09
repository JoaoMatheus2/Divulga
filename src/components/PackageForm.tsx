
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Package, Client } from '@/types';
import {  calculateFinancials } from '@/services/dataService';
import {  getClients, createPackage } from '@/services/api';
import { useNotifications } from '@/contexts/NotificationContext';
import { DollarSign, Calculator, ChevronDown, Video } from 'lucide-react';

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
      totalValue: 0,
    videoCount: type === 'package' ? 5 : 1
  });
  
  const [costSettings, setCostSettings] = useState({
    includeJuninhoCommission: true,
    juninhoCommissionValue: 20,
    includeNataliaCommission: true,
    nataliaCommissionPercentage: 5,
    includeEngagementCost: true,
    engagementCostPerVideo: 2,
    includeProLabore: true,
    proLaborePercentage: 70
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

  useEffect(() => {
    updateFinancials();
  }, [formData.totalValue, formData.videoCount, costSettings]);

  const loadClients = async () => {
    try {
      const clientsData = await getClients();
      setClients(clientsData);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

const updateFinancials = () => {
    const totalValue = formData.totalValue;
    
    const juninhoCommission = costSettings.includeJuninhoCommission ? costSettings.juninhoCommissionValue : 0;
    const nataliaCommission = costSettings.includeNataliaCommission ? (totalValue * costSettings.nataliaCommissionPercentage / 100) : 0;
    const engagementCost = costSettings.includeEngagementCost ? (costSettings.engagementCostPerVideo * formData.videoCount) : 0;
    const proLabore = costSettings.includeProLabore ? (totalValue * costSettings.proLaborePercentage / 100) : 0;
    const netProfit = totalValue - juninhoCommission - nataliaCommission - engagementCost - proLabore;

    setFinancials({
      juninhoCommission,
      nataliaCommission,
      engagementCost,
      proLabore,
      netProfit
    });
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
  };

 const handleVideoCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setFormData(prev => ({ ...prev, videoCount: Math.max(1, value) }));
  };

  const handleCostSettingChange = (field: keyof typeof costSettings, value: any) => {
    setCostSettings(prev => ({ ...prev, [field]: value }));
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
      const packageData: Omit<Package, 'id' | 'createdAt' | 'updatedAt' | 'paymentStatus'> = {
        clientId: selectedClient?.id,
        clientName: formData.clientName,
        type,
        totalValue: formData.totalValue,
        juninhoCommission: financials.juninhoCommission,
        nataliaCommission: financials.nataliaCommission,
        engagementCost: financials.engagementCost,
        proLabore: financials.proLabore,
        netProfit: financials.netProfit,
        status: 'active',
      };

await createPackage({
  ...packageData, videoCount: formData.videoCount,
  id: '',
  createdAt: undefined,
  updatedAt: undefined
});

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Básicas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Informações Básicas</h3>
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
  <div>
            <Label htmlFor="videoCount">Quantidade de Vídeos</Label>
            <div className="flex items-center space-x-2">
              <Video className="h-4 w-4 text-gray-400" />
              <Input
                id="videoCount"
                type="number"
                min="1"
                value={formData.videoCount}
                onChange={handleVideoCountChange}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Configurações de Custos */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Configurações de Custos</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Comissão Juninho</Label>
                  <p className="text-sm text-gray-500">Valor fixo</p>
                </div>
                <Switch
                  checked={costSettings.includeJuninhoCommission}
                  onCheckedChange={(checked) => handleCostSettingChange('includeJuninhoCommission', checked)}
                />
              </div>
              {costSettings.includeJuninhoCommission && (
                <Input
                  type="number"
                  step="0.01"
                  value={costSettings.juninhoCommissionValue}
                  onChange={(e) => handleCostSettingChange('juninhoCommissionValue', parseFloat(e.target.value) || 0)}
                  placeholder="R$ 20,00"
                />
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Comissão Natália</Label>
                  <p className="text-sm text-gray-500">Percentual do valor total</p>
                </div>
                <Switch
                  checked={costSettings.includeNataliaCommission}
                  onCheckedChange={(checked) => handleCostSettingChange('includeNataliaCommission', checked)}
                />
              </div>
              {costSettings.includeNataliaCommission && (
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={costSettings.nataliaCommissionPercentage}
                    onChange={(e) => handleCostSettingChange('nataliaCommissionPercentage', parseFloat(e.target.value) || 0)}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Custo Engajamento</Label>
                  <p className="text-sm text-gray-500">Por vídeo × quantidade</p>
                </div>
                <Switch
                  checked={costSettings.includeEngagementCost}
                  onCheckedChange={(checked) => handleCostSettingChange('includeEngagementCost', checked)}
                />
              </div>
              {costSettings.includeEngagementCost && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">R$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={costSettings.engagementCostPerVideo}
                    onChange={(e) => handleCostSettingChange('engagementCostPerVideo', parseFloat(e.target.value) || 0)}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-500">× {formData.videoCount}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Pró-Labore</Label>
                  <p className="text-sm text-gray-500">Percentual do valor total</p>
                </div>
                <Switch
                  checked={costSettings.includeProLabore}
                  onCheckedChange={(checked) => handleCostSettingChange('includeProLabore', checked)}
                />
              </div>
              {costSettings.includeProLabore && (
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={costSettings.proLaborePercentage}
                    onChange={(e) => handleCostSettingChange('proLaborePercentage', parseFloat(e.target.value) || 0)}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cálculos Automáticos */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center mb-4">
              <Calculator className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold">Cálculos Automáticos</h3>
            </div>
            
            <div className="space-y-3 text-sm">
               {costSettings.includeJuninhoCommission && (
                <div className="flex justify-between">
                  <span>Comissão Juninho:</span>
                  <span className="font-medium">R$ {(financials.juninhoCommission ?? 0).toFixed(2)}</span>
                </div>
              )}
              
              {costSettings.includeNataliaCommission && (
                <div className="flex justify-between">
                  <span>Comissão Natália ({costSettings.nataliaCommissionPercentage}%):</span>
                  <span className="font-medium">R$ {(financials.nataliaCommission ?? 0).toFixed(2)}</span>
                </div>
              )}
              
              {costSettings.includeEngagementCost && (
                <div className="flex justify-between">
                  <span>Custo Engajamento ({formData.videoCount}x):</span>
                  <span className="font-medium">R$ {(financials.engagementCost ?? 0).toFixed(2)}</span>
                </div>
              )}
              
              {costSettings.includeProLabore && (
                <div className="flex justify-between">
                  <span>Pró-Labore ({costSettings.proLaborePercentage}%):</span>
                  <span className="font-medium">R$ {(financials.proLabore ?? 0).toFixed(2)}</span>
                </div>
              )}
              
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Lucro Líquido:</span>
                <span className={financials.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                  R$ {(financials.netProfit?? 0).toFixed(2)}
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