
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Package } from '@/types';
import { createPackage, calculateFinancials } from '@/services/dataService';
import { useNotifications } from '@/contexts/NotificationContext';
import { DollarSign, Calculator } from 'lucide-react';

interface PackageFormProps {
  type: 'package' | 'post';
  onSuccess: () => void;
  onCancel: () => void;
}

const PackageForm: React.FC<PackageFormProps> = ({ type, onSuccess, onCancel }) => {
  const { addNotification } = useNotifications();
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

  const updateFinancials = (totalValue: number) => {
    const calculated = calculateFinancials(totalValue, type);
    setFinancials(calculated);
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
          <div>
            <Label htmlFor="clientName">Nome do Cliente *</Label>
            <Input
              id="clientName"
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
              placeholder="Digite o nome do cliente"
              required
            />
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
