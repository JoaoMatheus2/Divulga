
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Package, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Play,
  Clock,
  CheckCircle,
  Plus
} from 'lucide-react';

interface MetricCard {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  trend?: string;
  color: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<MetricCard[]>([]);

  useEffect(() => {
    const mockMetrics: MetricCard[] = [
      {
        title: 'Pacotes Ativos',
        value: '12',
        icon: Package,
        trend: '+2 este mês',
        color: 'text-blue-600'
      },
      {
        title: 'Posts Publicados',
        value: '48',
        icon: FileText,
        trend: '+8 esta semana',
        color: 'text-green-600'
      },
      {
        title: 'Receita Total',
        value: 'R$ 15.240',
        icon: DollarSign,
        trend: '+15% este mês',
        color: 'text-yellow-600'
      },
      {
        title: 'Vídeos Pendentes',
        value: '7',
        icon: Clock,
        color: 'text-orange-600'
      }
    ];

    setMetrics(mockMetrics);
  }, []);

  const recentActivities = [
    {
      id: 1,
      type: 'package',
      title: 'Novo pacote criado - João Silva',
      time: '2 horas atrás',
      status: 'created'
    },
    {
      id: 2,
      type: 'video',
      title: 'Vídeo postado - Pacote Maria Santos',
      time: '4 horas atrás',
      status: 'posted'
    },
    {
      id: 3,
      type: 'engagement',
      title: 'Vídeo engajado - Post Individual',
      time: '6 horas atrás',
      status: 'engaged'
    },
    {
      id: 4,
      type: 'financial',
      title: 'Pagamento recebido - R$ 850',
      time: '1 dia atrás',
      status: 'paid'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'package': return Package;
      case 'video': return Play;
      case 'engagement': return TrendingUp;
      case 'financial': return DollarSign;
      default: return FileText;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created': return 'bg-blue-100 text-blue-800';
      case 'posted': return 'bg-green-100 text-green-800';
      case 'engaged': return 'bg-purple-100 text-purple-800';
      case 'paid': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Bem-vindo, {user?.name}!
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Aqui está um resumo das suas atividades recentes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {metric.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  {metric.trend && (
                    <p className="text-xs text-gray-600 mt-1">
                      {metric.trend}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>
                Últimas atualizações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Icon className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {activity.time}
                        </p>
                      </div>
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesso rápido às funcionalidades principais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user?.role === 'admin' && (
                <>
                  <Link to="/packages">
                    <Button className="w-full justify-start" variant="outline">
                      <Package className="mr-2 h-4 w-4" />
                      Criar Novo Pacote
                    </Button>
                  </Link>
                  <Link to="/posts">
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      Criar Novo Post
                    </Button>
                  </Link>
                </>
              )}
              {(user?.role === 'admin' || user?.role === 'financial') && (
                <Link to="/financial">
                  <Button className="w-full justify-start" variant="outline">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Ver Relatórios Financeiros
                  </Button>
                </Link>
              )}
              {(user?.role === 'admin' || user?.role === 'video_manager') && (
                <Button className="w-full justify-start" variant="outline">
                  <Clock className="mr-2 h-4 w-4" />
                  Atualizar Status de Vídeos
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
