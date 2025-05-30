
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FinancialReport } from '@/types';
import { getFinancialReport } from '@/services/dataService';
import { useNotifications } from '@/contexts/NotificationContext';
import { CalendarDays, Download, Search } from 'lucide-react';

interface FinancialReportsProps {
  onReportGenerated: (report: FinancialReport) => void;
}

const FinancialReports: React.FC<FinancialReportsProps> = ({ onReportGenerated }) => {
  const { addNotification } = useNotifications();
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [currentReport, setCurrentReport] = useState<FinancialReport | null>(null);

  const handleGenerateReport = async () => {
    setLoading(true);
    
    try {
      const startDate = dateRange.startDate ? new Date(dateRange.startDate) : undefined;
      const endDate = dateRange.endDate ? new Date(dateRange.endDate) : undefined;
      
      const report = await getFinancialReport(startDate, endDate);
      setCurrentReport(report);
      onReportGenerated(report);
      
      addNotification({
        title: 'Relatório Gerado',
        message: 'Relatório financeiro atualizado com sucesso!',
        type: 'success'
      });
    } catch (error) {
      addNotification({
        title: 'Erro',
        message: 'Erro ao gerar relatório. Tente novamente.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    if (!currentReport) {
      addNotification({
        title: 'Erro',
        message: 'Gere um relatório primeiro antes de exportar.',
        type: 'error'
      });
      return;
    }

    // Criar dados CSV
    const csvData = [
      ['Relatório Financeiro - MusicManager'],
      ['Período', currentReport.period],
      [''],
      ['Métrica', 'Valor (R$)'],
      ['Receita Total', currentReport.totalRevenue.toFixed(2)],
      ['Pró-Labore Total', currentReport.totalProLabore.toFixed(2)],
      ['Comissão Juninho', currentReport.totalJuninhoCommission.toFixed(2)],
      ['Comissão Natália', currentReport.totalNataliaCommission.toFixed(2)],
      ['Custo Engajamento', currentReport.totalEngagementCost.toFixed(2)],
      ['Lucro Líquido', currentReport.netProfit.toFixed(2)],
      [''],
      ['Resumo de Atividades'],
      ['Total de Pacotes', currentReport.packagesCount.toString()],
      ['Total de Posts', currentReport.postsCount.toString()],
    ];

    // Converter para string CSV
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    // Criar blob e download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addNotification({
        title: 'Download Concluído',
        message: 'Relatório exportado com sucesso!',
        type: 'success'
      });
    } else {
      addNotification({
        title: 'Erro',
        message: 'Seu navegador não suporta download automático.',
        type: 'error'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarDays className="mr-2 h-5 w-5" />
          Relatórios Personalizados
        </CardTitle>
        <CardDescription>
          Gere relatórios por período específico e exporte dados
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Data Inicial</Label>
            <Input
              id="startDate"
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="endDate">Data Final</Label>
            <Input
              id="endDate"
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleGenerateReport}
            disabled={loading}
            className="flex-1"
          >
            <Search className="mr-2 h-4 w-4" />
            {loading ? 'Gerando...' : 'Gerar Relatório'}
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleExportReport}
            disabled={!currentReport}
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar Dados
          </Button>
        </div>

        {currentReport && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">✓ Relatório Pronto para Exportação</h4>
            <p className="text-sm text-green-700">
              Período: {currentReport.period} | 
              Receita: R$ {currentReport.totalRevenue.toFixed(2)} | 
              Lucro: R$ {currentReport.netProfit.toFixed(2)}
            </p>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Dados do Relatório:</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Receita total por período</p>
            <p>• Comissões detalhadas por colaborador</p>
            <p>• Custos de engajamento</p>
            <p>• Pró-labore e lucro líquido</p>
            <p>• Número de pacotes e posts</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialReports;
