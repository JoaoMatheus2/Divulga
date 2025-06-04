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
import { getPackages } from '@/services/api';
import { Client } from '@/types';
import {getClients } from '../services/dataService';

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

  const generateMockData = () => {
    const currentDate = new Date();
    const data = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      
      data.push({
        month: monthName,
        receita: Math.floor(Math.random() * 50000) + 20000,
        despesas: Math.floor(Math.random() * 30000) + 10000,
        lucro: 0,
      });
    }
    
    data.forEach(item => {
      item.lucro = item.receita - item.despesas;
    });
    
    return data;
  };

  const data = useMemo(() => generateMockData(), []);

  const filteredData = useMemo(() => {
    let filtered = [...data];
    
    switch (selectedPeriod) {
      case 'thisMonth':
        filtered = filtered.slice(-1);
        break;
      case 'lastMonth':
        filtered = filtered.slice(-2, -1);
        break;
      case 'last3Months':
        filtered = filtered.slice(-3);
        break;
      case 'last6Months':
        filtered = filtered.slice(-6);
        break;
      case 'thisYear':
        filtered = filtered.slice(-12);
        break;
    }
    
    return filtered;
  }, [data, selectedPeriod]);

  const totalRevenue = filteredData.reduce((sum, item) => sum + item.receita, 0);
  const totalExpenses = filteredData.reduce((sum, item) => sum + item.despesas, 0);
  const totalProfit = totalRevenue - totalExpenses;

  const expenseData = [
    { name: 'Marketing', value: totalExpenses * 0.4, color: '#8884d8' },
    { name: 'Produção', value: totalExpenses * 0.3, color: '#82ca9d' },
    { name: 'Operacional', value: totalExpenses * 0.2, color: '#ffc658' },
    { name: 'Outros', value: totalExpenses * 0.1, color: '#ff7300' },
  ];

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
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Receita vs Despesas</CardTitle>
            <CardDescription>Comparativo mensal de receitas e despesas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData}>
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Despesas</CardTitle>
            <CardDescription>Categorias de despesas por percentual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialReports;
