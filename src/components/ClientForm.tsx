import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Client } from '@/types';
import { createClient, updateClient } from '@/services/api'
import { useNotifications } from '@/contexts/NotificationContext';
import { Save, X } from 'lucide-react';

interface ClientFormProps {
  client?: Client | null;
  onSave: () => void;
  onCancel: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ client, onSave, onCancel }) => {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    agencyName: '',
    isFrequent: false
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        agencyName: client.agencyName || '',
        isFrequent: client.isFrequent
      });
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const clientData = {
        name: formData.name,
        agencyName: formData.agencyName || null,
        isFrequent: formData.isFrequent
      };

      if (client) {
        const clientData = {
          ...formData,
          id: client.id,
          createdAt: client.createdAt
        };
        console.log('clientData:', clientData);

        await updateClient(clientData);
        addNotification({
          title: 'Cliente Atualizado',
          message: 'Cliente atualizado com sucesso!',
          type: 'success'
        });
      } else {
        await createClient(clientData);
        addNotification({
          title: 'Cliente Criado',
          message: 'Cliente criado com sucesso!',
          type: 'success'
        });
      }

      onSave();
    } catch (error) {
      addNotification({
        title: 'Erro',
        message: 'Erro ao salvar cliente. Tente novamente.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{client ? 'Editar Cliente' : 'Novo Cliente'}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Cliente *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="agencyName">Nome da Agência</Label>
            <Input
              id="agencyName"
              value={formData.agencyName}
              onChange={(e) => setFormData(prev => ({ ...prev, agencyName: e.target.value }))}
              placeholder="Opcional"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isFrequent"
              checked={formData.isFrequent}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFrequent: checked }))}
            />
            <Label htmlFor="isFrequent">Cliente Frequente</Label>
          </div>

          <div className="flex space-x-3">
            <Button type="submit" disabled={loading} className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClientForm;
