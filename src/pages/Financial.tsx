import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import FinancialReports from '@/components/FinancialReports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FinancialReport } from '@/types';
import { getFinancialReport } from '@/services/dataService';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  PieChart,
  Calendar,
  Package,
  FileText
} from 'lucide-react';

const Financial = () => {
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFinancialReport();
  }, []);

  const loadFinancialReport = async () => {
    try {
      setLoading(true);
      const data = await getFinancialReport();
      setReport(data);
    } catch (error) {
      console.error('Erro ao carregar relatório financeiro:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  const metrics = report ? [
    {
      title: 'Receita Total',
      value: `R$ ${report.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pró-Labore Total',
      value: `R$ ${report.totalProLabore.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Comissão Juninho',
      value: `R$ ${report.totalJuninhoCommission.toFixed(2)}`,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Comissão Natália',
      value: `R$ ${report.totalNataliaCommission.toFixed(2)}`,
      icon: Users,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      title: 'Custo Engajamento',
      value: `R$ ${report.totalEngagementCost.toFixed(2)}`,
      icon: PieChart,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Lucro Líquido',
      value: `R$ ${report.netProfit.toFixed(2)}`,
      icon: TrendingUp,
      color: report.netProfit >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: report.netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'
    }
  ] : [];

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Controle Financeiro</h1>
          <p className="mt-1 text-sm text-gray-600">
            Acompanhe receitas, comissões e relatórios detalhados.
          </p>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {metric.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${metric.color}`}>
                    {metric.value}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Resumo de Atividades */}
        {report && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Pacotes</CardTitle>
                <Package className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{report.packagesCount}</div>
                <p className="text-xs text-gray-600 mt-1">Pacotes fechados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Posts</CardTitle>
                <FileText className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{report.postsCount}</div>
                <p className="text-xs text-gray-600 mt-1">Posts individuais</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Período do Relatório</CardTitle>
                <Calendar className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium text-purple-600">{report.period}</div>
                <p className="text-xs text-gray-600 mt-1">Último relatório</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Componente de Relatórios Detalhados */}
        <FinancialReports />
      </div>
    </Layout>
  );
};

export default Financial;