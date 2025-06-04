import axios from 'axios';
import { Package, Video, FinancialReport, Client } from '@/types';

import { Console } from 'console';

const api = axios.create({
  baseURL: 'http://localhost:5219',
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
      endpoint = '/api/Post/Inserir';
    }

    console.log('dados pacote para cadastro ', pacoteDTO);
    const response = await api.post(endpoint, pacoteDTO);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Erro ao criar pacote');
  }
}


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
    console.error('Erro:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Erro ao atualizar status do vídeo');
  }
};



export default api;