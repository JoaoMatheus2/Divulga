
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Package, PaymentStatus } from '@/types';
import { getPackagePaymentSummary, updatePaymentStatus } from '@/services/api';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { DollarSign, Check, X, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';

interface PaymentManagerProps {
  package: Package;
  onClose: () => void;
  onUpdate?: () => void;
}

interface PaymentItem {
  name: string;
  amount: number;
  paid: boolean;
  field: keyof PaymentStatus;
}

const PaymentManager: React.FC<PaymentManagerProps> = ({ package: pkg, onClose, onUpdate }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [contasAReceber, setContasAReceber] = useState<PaymentItem[]>([]);
  const [contasAPagar, setContasAPagar] = useState<PaymentItem[]>([]);
  const [totalRecebido, setTotalRecebido] = useState(0);
  const [totalPago, setTotalPago] = useState(0);
  const [totalPendenteReceber, setTotalPendenteReceber] = useState(0);
  const [totalPendentePagar, setTotalPendentePagar] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPaymentData();
  }, [pkg.id]);

  const loadPaymentData = async () => {
    try {
      console.log('carregando dados de pagamento...');
      const summary = await getPackagePaymentSummary(pkg.id, pkg.type);
      if (summary) {
        // Separar contas a receber (valor total) das contas a pagar (custos)
        const receber = summary.payments.filter(p => p.field === 'totalValuePaid');
        const pagar = summary.payments.filter(p => p.field !== 'totalValuePaid');
        
        setContasAReceber(receber);
        setContasAPagar(pagar);
        
        const totalRecebidoCalc = receber.filter(p => p.paid).reduce((sum, p) => sum + p.amount, 0);
        const totalPagoCalc = pagar.filter(p => p.paid).reduce((sum, p) => sum + p.amount, 0);
        const totalPendenteReceberCalc = receber.filter(p => !p.paid).reduce((sum, p) => sum + p.amount, 0);
        const totalPendentePagarCalc = pagar.filter(p => !p.paid).reduce((sum, p) => sum + p.amount, 0);
        console.log('total pendente a pagar ', totalPendentePagar);

        setTotalRecebido(totalRecebidoCalc);
        setTotalPago(totalPagoCalc);
        setTotalPendenteReceber(totalPendenteReceberCalc);
        setTotalPendentePagar(totalPendentePagarCalc);

      }
    } catch (error) {
      console.error('Erro ao carregar dados de pagamento:', error);
    }
  };

  const handlePaymentToggle = async (field: keyof PaymentStatus, paid: boolean) => {
    if (user?.role !== 'admin' && user?.role !== 'financial') {
      addNotification({
        title: 'Acesso Negado',
        message: 'Você não tem permissão para alterar status de pagamentos.',
        type: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      await updatePaymentStatus(pkg.id, field, paid, pkg.type);
      
      addNotification({
        title: 'Pagamento Atualizado',
        message: `Status de pagamento ${paid ? 'marcado como pago' : 'desmarcado'} com sucesso!`,
        type: 'success'
      });

      loadPaymentData();
      onUpdate?.();
    } catch (error) {
      addNotification({
        title: 'Erro',
        message: 'Erro ao atualizar status de pagamento.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const allReceived = contasAReceber.every(p => p.paid);
  const allPaid = contasAPagar.every(p => p.paid);

  if (user?.role !== 'admin' && user?.role !== 'financial') {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Acesso Restrito</h3>
          <p className="text-gray-500">Você não tem permissão para visualizar informações financeiras.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Controle de Pagamentos</h2>
          <p className="text-sm text-gray-600">{pkg.clientName} - {pkg.type === 'package' ? 'Pacote' : 'Post'}</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          <X className="mr-2 h-4 w-4" />
          Fechar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Recebido</p>
                <p className="text-2xl font-bold text-green-600">R$ {totalRecebido.toFixed(2)}</p>
                </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendente a Receber</p>
                <p className="text-2xl font-bold text-orange-600">R$ {totalPendenteReceber.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pago</p>
                <p className="text-2xl font-bold text-red-600">R$ {(totalPago ?? 0).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendente a Pagar</p>
                <p className="text-2xl font-bold text-yellow-600">R$ {(totalPendentePagar ?? 0).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contas a Receber */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                Contas a Receber
              </CardTitle>
              <Badge className={allReceived ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                {allReceived ? 'Recebido' : 'Pendente'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contasAReceber.map((payment) => (
                <div key={payment.field} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={payment.paid}
                      onCheckedChange={(checked) => handlePaymentToggle(payment.field, checked as boolean)}
                      disabled={loading}
                    />
                    <div>
                      <p className="font-medium">{payment.name}</p>
                      <p className="text-sm text-gray-600">R$ {(payment.amount ?? 0).toFixed(2)}</p>
                    </div>
                  </div>
                  <Badge className={payment.paid ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                    {payment.paid ? 'Recebido' : 'Pendente'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contas a Pagar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <TrendingDown className="mr-2 h-5 w-5 text-red-600" />
                Contas a Pagar
              </CardTitle>
              <Badge className={allPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {allPaid ? 'Tudo Pago' : 'Pendente'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contasAPagar.map((payment) => (
                <div key={payment.field} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={payment.paid}
                      onCheckedChange={(checked) => handlePaymentToggle(payment.field, checked as boolean)}
                      disabled={loading}
                    />
                    <div>
                      <p className="font-medium">{payment.name}</p>
                      <p className="text-sm text-gray-600">R$ {(payment.amount ?? 0).toFixed(2)}</p>
                    </div>
                  </div>
                  <Badge className={payment.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {payment.paid ? 'Pago' : 'Pendente'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentManager;