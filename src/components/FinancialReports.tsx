
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getPackages, getClients } from '@/services/api';
import { Client, Package } from '@/types';

const FinancialReports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [clientsOpen, setClientsOpen] = useState(false);

  const { data: packages = [] } = useQuery({
    queryKey: ['packages'],
    queryFn: getPackages,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  const filteredPackages = useMemo(() => {
    let filtered = [...packages];
    
    // Filtrar por clientes selecionados
    if (selectedClients.length > 0) {
      filtered = filtered.filter(pkg => selectedClients.includes(pkg.clientId || ''));
    }
    
    // Filtrar por período
    const currentDate = new Date();
    
    switch (selectedPeriod) {
      case 'thisMonth':
        filtered = filtered.filter(pkg => {
          const pkgDate = new Date(pkg.createdAt);
          return pkgDate.getMonth() === currentDate.getMonth() && 
                 pkgDate.getFullYear() === currentDate.getFullYear();
        });
        break;
      case 'lastMonth':
        const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        filtered = filtered.filter(pkg => {
          const pkgDate = new Date(pkg.createdAt);
          return pkgDate.getMonth() === lastMonth.getMonth() && 
                 pkgDate.getFullYear() === lastMonth.getFullYear();
        });
        break;
      case 'last3Months':
        const threeMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1);
        filtered = filtered.filter(pkg => new Date(pkg.createdAt) >= threeMonthsAgo);
        break;
      case 'last6Months':
        const sixMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1);
        filtered = filtered.filter(pkg => new Date(pkg.createdAt) >= sixMonthsAgo);
        break;
      case 'thisYear':
        filtered = filtered.filter(pkg => {
          const pkgDate = new Date(pkg.createdAt);
          return pkgDate.getFullYear() === currentDate.getFullYear();
        });
        break;
    }
    
    return filtered;
  }, [packages, selectedClients, selectedPeriod]);

  const monthlyData = useMemo(() => {
    const monthsMap = new Map();
    
    filteredPackages.forEach(pkg => {
      const date = new Date(pkg.createdAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      
      if (!monthsMap.has(monthKey)) {
        monthsMap.set(monthKey, {
          month: monthName,
          receita: 0,
          despesas: 0,
          lucro: 0,
        });
      }
      
      const monthData = monthsMap.get(monthKey);
      monthData.receita += pkg.totalValue;
      monthData.despesas += pkg.juninhoCommission + pkg.nataliaCommission + pkg.engagementCost + pkg.proLabore;
      monthData.lucro = monthData.receita - monthData.despesas;
    });
    
    return Array.from(monthsMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredPackages]);

  const totalRevenue = filteredPackages.reduce((sum, pkg) => sum + pkg.totalValue, 0);
  const totalExpenses = filteredPackages.reduce((sum, pkg) => 
    sum + pkg.juninhoCommission + pkg.nataliaCommission + pkg.engagementCost + pkg.proLabore, 0
  );
  const totalProfit = totalRevenue - totalExpenses;

  const expenseData = useMemo(() => {
    const totalJuninho = filteredPackages.reduce((sum, pkg) => sum + pkg.juninhoCommission, 0);
    const totalNatalia = filteredPackages.reduce((sum, pkg) => sum + pkg.nataliaCommission, 0);
    const totalEngagement = filteredPackages.reduce((sum, pkg) => sum + pkg.engagementCost, 0);
    const totalProLabore = filteredPackages.reduce((sum, pkg) => sum + pkg.proLabore, 0);
    
    return [
      { name: 'Comissão Juninho', value: totalJuninho, color: '#8884d8' },
      { name: 'Comissão Natália', value: totalNatalia, color: '#82ca9d' },
      { name: 'Custo Engajamento', value: totalEngagement, color: '#ffc658' },
      { name: 'Pró-Labore', value: totalProLabore, color: '#ff7300' },
    ].filter(item => item.value > 0);
  }, [filteredPackages]);

  const handleClientSelect = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const removeClient = (clientId: string) => {
    setSelectedClients(prev => prev.filter(id => id !== clientId));
  };

  const clearAllClients = () => {
    setSelectedClients([]);
  };

  const getSelectedClientsText = () => {
    if (selectedClients.length === 0) return "Selecionar clientes...";
    if (selectedClients.length === 1) {
      const client = (clients as Client[]).find(c => c.id === selectedClients[0]);
      return client?.name || "Cliente não encontrado";
    }
    return `${selectedClients.length} clientes selecionados`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Selecionar período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="thisMonth">Este mês</SelectItem>
            <SelectItem value="lastMonth">Mês passado</SelectItem>
            <SelectItem value="last3Months">Últimos 3 meses</SelectItem>
            <SelectItem value="last6Months">Últimos 6 meses</SelectItem>
            <SelectItem value="thisYear">Este ano</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-full sm:w-[300px]">
          <Popover open={clientsOpen} onOpenChange={setClientsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={clientsOpen}
                className="w-full justify-between"
              >
                {getSelectedClientsText()}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Buscar clientes..." />
                <CommandList>
                  <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                  <CommandGroup>
                    {(clients as Client[]).map((client) => (
                      <CommandItem
                        key={client.id}
                        value={client.name}
                        onSelect={() => handleClientSelect(client.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedClients.includes(client.id) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {client.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          
          {selectedClients.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedClients.map(clientId => {
                const client = (clients as Client[]).find(c => c.id === clientId);
                return client ? (
                  <Badge key={clientId} variant="secondary" className="text-xs">
                    {client.name}
                    <X 
                      className="ml-1 h-3 w-3 cursor-pointer" 
                      onClick={() => removeClient(clientId)}
                    />
                  </Badge>
                ) : null;
              })}
              {selectedClients.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllClients}
                  className="h-6 px-2 text-xs"
                >
                  Limpar todos
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(totalRevenue)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {filteredPackages.length} {filteredPackages.length === 1 ? 'pacote/post' : 'pacotes/posts'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(totalExpenses)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Comissões + Engajamento + Pró-Labore
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(totalProfit)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {totalProfit >= 0 ? 'Lucro positivo' : 'Prejuízo'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Receita vs Despesas</CardTitle>
            <CardDescription>
              {monthlyData.length === 0 ? 'Nenhum dado disponível para o período selecionado' : 'Comparativo mensal de receitas e despesas'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {monthlyData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Nenhum dado disponível
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [
                        new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(value),
                        ''
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="receita" fill="#8884d8" name="Receita" />
                    <Bar dataKey="despesas" fill="#82ca9d" name="Despesas" />
                    <Bar dataKey="lucro" fill="#ffc658" name="Lucro" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Despesas</CardTitle>
            <CardDescription>
              {expenseData.length === 0 ? 'Nenhuma despesa registrada' : 'Categorias de despesas por valor'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {expenseData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Nenhuma despesa registrada
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [
                        new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(value),
                        ''
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialReports;