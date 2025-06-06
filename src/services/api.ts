import axios from 'axios';
import { Package, Video, FinancialReport, Client, PaymentStatus } from '@/types';

import { Console } from 'console';

// const api = axios.create({
//   baseURL: 'http://localhost:5219',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

const api = axios.create({
  baseURL: 'https://www.divulga-ai.net.br',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    if (!config.headers) {
      config.headers = {};
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}


export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/api/Usuario/Login', {
        login: credentials.email,
        senha: credentials.password,
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao fazer login');
    }
  },

  logout() {
    localStorage.removeItem('auth_token');
  },
};

export const getMetrics = async () => {
  try {
    const response = await api.get('/api/Dashboard/metrics');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao buscar métricas');
  }
};

export const getPackages = async () => {
  try {
    const response = await api.get('/api/Pacote/BuscarPacotes');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao buscar métricas');
  }
};


export const getPosts = async () => {
  try {
    const response = await api.get('/api/Post/BuscarPost');
    console.log('resposta da api getPosts: ', response.data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao buscar métricas');
  }
};

export const createPackage = async (packageData: Package): Promise<any> => {
  try {
    console.log('dados pacote para cadastro ', packageData);

    // Monta o DTO conforme a API espera
    const pacoteDTO = {
      totalValue: packageData.totalValue,
      juninhoCommission: packageData.juninhoCommission,
      nataliaCommission: packageData.nataliaCommission,
      engagementCost: packageData.engagementCost,
      proLabore: packageData.proLabore,
      netProfit: packageData.netProfit,
      clientId: packageData.clientId,
      clientName: packageData.clientName,  // PRECISA ter isso
      type: packageData.type,              // PRECISA ter isso
      status: packageData.status,          // PRECISA ter isso
      listaPacoteItem: [] as { numeroVideo: number; }[]
    };

    let endpoint = '/api/Pacote/Inserir';

    // Se for pacote, cria os 5 itens
    if (packageData.type === 'package') {
      for (let i = 1; i <= 5; i++) {
        pacoteDTO.listaPacoteItem.push({
          numeroVideo: i
        });
      }
    } else if (packageData.type === 'post') {
      console.log('criando post');
      endpoint = '/api/Post/Inserir';
    }

    console.log('dados pacote para cadastro ', pacoteDTO);
    const response = await api.post(endpoint, pacoteDTO);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao criar pacote');
  }
}

export const updatePackageStatus = async (codigo: number, status: string): Promise<any> => {
  try {
    console.log('Atualizando status do pacote', { codigo, status });
    const response = await api.put('/api/Pacote/AlterarStatus', { codigo, status });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao atualizar status do pacote');
  }
};

export const createClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
  try {
    console.log('dados cliente para cadastro ', clientData);
    const response = await api.post('/api/Cliente/Inserir', clientData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao criar cliente');
  }
}

export const updateClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
  try {
    console.log('dados cliente para alterar ', clientData);
    const response = await api.put('/api/Cliente/Alterar', clientData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao atualizar cliente');
  }
}


export const getClients = async () => {
  try {
    const response = await api.get('/api/Cliente/BuscarClientes');
    console.log('resposta da api getClients: ', response.data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao buscar clientes');
  }
}

export const getClientPackages = async (codigoCliente: number) => {
  try {
    const response = await api.get(`/api/Cliente/BuscarPacotesCliente/${codigoCliente}`);
    console.log('resposta da api getClientPackages: ', response.data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao buscar pacotes do cliente');
  }
}

export const getPackagePaymentSummary = async (codigopacote: number, type: string) => {
  try {
    console.log('cheguei aqui no getPackagePaymentSummary');

    // Define o endpoint conforme o tipo
    const endpoint =
      type === 'post'
        ? `/api/Post/BuscarSituacaoPagamentoPost/${codigopacote}`
        : `/api/Pacote/BuscarSituacaoPagamentoPacote/${codigopacote}`;

    const response = await api.get(endpoint);

    console.log('resposta da api getPackagePaymentSummary: ', response.data);
    const pkg = response.data;

    const payments = [
      { name: 'Valor Total', amount: pkg.totalValue, paid: pkg.paymentStatusDTO?.totalValuePaid ?? 0, field: 'totalValuePaid' as keyof PaymentStatus },
      { name: 'Comissão Juninho', amount: pkg.juninhoCommission, paid: pkg.paymentStatusDTO?.juninhoCommissionPaid ?? 0, field: 'juninhoCommissionPaid' as keyof PaymentStatus },
      { name: 'Comissão Natália', amount: pkg.nataliaCommission, paid: pkg.paymentStatusDTO?.nataliaCommissionPaid ?? 0, field: 'nataliaCommissionPaid' as keyof PaymentStatus },
      { name: 'Custo Engajamento', amount: pkg.engagementCost, paid: pkg.paymentStatusDTO?.engagementCostPaid ?? 0, field: 'engagementCostPaid' as keyof PaymentStatus },
      { name: 'Pró-Labore', amount: pkg.proLabore, paid: pkg.paymentStatusDTO?.proLaborePaid ?? 0, field: 'proLaborePaid' as keyof PaymentStatus }
    ];

    const totalPaid = payments.reduce((sum, p) => sum + (p.paid ?? 0), 0);
    const totalPending = payments.reduce((sum, p) => sum + ((p.amount ?? 0) - (p.paid ?? 0)), 0);

    console.log('payments ', payments);
    console.log('totalPaid ', totalPaid);
    console.log('totalPending ', totalPending);
    
    return {
      payments,
      totalPaid,
      totalPending,
      allPaid: payments.every(p => p.paid)
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao buscar resumo de pagamento do pacote');
  }
};

// export const updatePaymentStatus = async (
//   packageId: string,  // id é string conforme interface Package
//   updatedPaymentStatus: PaymentStatus
// ) => {
//   try {
//     console.log('cheguei aqui no updatePaymentStatus');

//     // Monta o objeto parcial para envio (somente os campos que quer atualizar)
//     const pacoteDTO = {
//       id: packageId,
//       paymentStatusDTO: updatedPaymentStatus,
//     };

//     console.log('pacoteDTO ', pacoteDTO);

//     const response = await api.patch(`/api/Pacote/AtualizarPacote?id=${packageId}`, pacoteDTO, {
//       headers: { 'Content-Type': 'application/json' }
//     });

//     console.log('Resposta da API updatePaymentStatus: ', response.data);
//     return response.data;

//   } catch (error: any) {
//     console.error('Erro ao atualizar pagamento:', error.response?.data || error.message);
//     throw error;
//   }
// };

interface UpdatePaymentPayload {
  id: number;
  paymentField: keyof PaymentStatus;
  paid: boolean;
}

export const updatePaymentStatus = async (
  id: number,
  paymentField: keyof PaymentStatus,
  paid: boolean,
  type: string
) => {
  const payload: UpdatePaymentPayload = { id, paymentField, paid };

  const endpoint =
    type === 'post'
      ? `/api/Post/AtualizarPost?id=${id}`
      : `/api/Pacote/AtualizarPacote?id=${id}`;

  return await api.patch(endpoint, payload);
};

export const getFinancialReport = async (startDate?: Date, endDate?: Date): Promise<FinancialReport> => {
  try {
    const response = await api.get('/api/Financeiro/getFinancialReport');
    const packages = response.data as Package[]; // adapte o tipo se necessário

    // Filtra por data, se for o caso
    let filteredPackages = packages;
    if (startDate || endDate) {
      filteredPackages = packages.filter(pkg => {
        const pkgDate = new Date(pkg.createdAt);
        if (startDate && pkgDate < startDate) return false;
        if (endDate && pkgDate > endDate) return false;
        return true;
      });
    }

    // Faz os cálculos como no exemplo anterior
    const totalRevenue = filteredPackages.reduce((sum, pkg) => sum + pkg.totalValue, 0);
    const totalJuninhoCommission = filteredPackages.reduce((sum, pkg) => sum + pkg.juninhoCommission, 0);
    const totalNataliaCommission = filteredPackages.reduce((sum, pkg) => sum + pkg.nataliaCommission, 0);
    const totalEngagementCost = filteredPackages.reduce((sum, pkg) => sum + pkg.engagementCost, 0);
    const totalProLabore = filteredPackages.reduce((sum, pkg) => sum + pkg.proLabore, 0);
    const netProfit = filteredPackages.reduce((sum, pkg) => sum + pkg.netProfit, 0);

    const packagesCount = filteredPackages.filter(pkg => pkg.type === 'package').length;
    const postsCount = filteredPackages.filter(pkg => pkg.type === 'post').length;

    return {
      totalRevenue,
      totalJuninhoCommission,
      totalNataliaCommission,
      totalEngagementCost,
      totalProLabore,
      netProfit,
      packagesCount,
      postsCount,
      period: startDate && endDate 
        ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
        : 'Todos os períodos'
    };

  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao buscar relatório');
  }
};

export const getClientRevenue = async (codigoCliente: number) => {
  console.log('cheguei aqui no getClienteRevenue');
  const ClientePackages = await getClientPackages(codigoCliente);
  return ClientePackages.reduce((sum, pkg) => sum + pkg.totalValue, 0);
}

export const deleteClient = async (codigoCliente: number) => {
  try {
    const response = await api.get(`/api/Cliente/Excluir/${codigoCliente}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao excluir cliente');
  }
}

export const getVideosByPackageId = async (codigoPacote: number) => {
  try {
    const response = await api.get(`/api/Pacote/BuscarVideosPacote/${codigoPacote}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao buscar vídeos');
  }
};

export const updateVideoStatus = async (codigoVideo: number, novoStatus: string) => {
  try {
    console.log('chegamos aqui no updateVideoStatus ' + novoStatus);

    const response = await api.patch(
      `/api/Pacote/AtualizarStatusVideo/${codigoVideo}`,
      { Status: novoStatus },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    console.log('resposta da api updateVideoStatus: ', response.data);
    return response.data;

  } catch (error: any) {
    const statusCode = error.response?.status;
    console.error('Erro na primeira tentativa:', error.response?.data);

    // Se for erro 404, tenta na rota alternativa
    if (statusCode === 404) {
      try {
        console.log('Tentando na rota alternativa /api/Post/AtualizarStatusVideo');

        const fallbackResponse = await api.patch(
          `/api/Post/AtualizarStatusVideo/${codigoVideo}`,
          { Status: novoStatus },
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );

        console.log('resposta da api fallback updateVideoStatus: ', fallbackResponse.data);
        return fallbackResponse.data;

      } catch (fallbackError: any) {
        console.error('Erro na rota alternativa:', fallbackError.response?.data);
        throw new Error(fallbackError.response?.data?.message || 'Erro ao atualizar status do vídeo na rota alternativa');
      }
    }

    throw new Error(error.response?.data?.message || 'Erro ao atualizar status do vídeo');
  }
};



export default api;