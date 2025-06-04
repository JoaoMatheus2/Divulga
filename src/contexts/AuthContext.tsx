// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/services/api';

interface User {
  id: number;
  login: string;
  tokenOmnesApi: string;
  nome: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Começa como true!

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/api/Usuario/Login', {
        login: email,
        senha: password,
      });
  
      if (response.data && response.data.tokenOmnesApi) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem('auth_token', response.data.tokenOmnesApi);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro no login:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {isLoading ? <div>Carregando...</div> : children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);
