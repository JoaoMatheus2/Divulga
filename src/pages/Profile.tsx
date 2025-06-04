
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar,
  Settings
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'video_manager': return 'Gerente de Vídeos';
      case 'financial': return 'Financeiro';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'video_manager': return 'bg-blue-100 text-blue-800';
      case 'financial': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPermissions = (role: string) => {
    switch (role) {
      case 'admin':
        return [
          'Criar e editar pacotes/posts',
          'Gerenciar status de vídeos', 
          'Visualizar relatórios financeiros',
          'Acesso total ao sistema'
        ];
      case 'video_manager':
        return [
          'Atualizar status de vídeos',
          'Visualizar pacotes e posts',
          'Receber notificações de vídeos postados'
        ];
      case 'financial':
        return [
          'Visualizar relatórios financeiros',
          'Gerar relatórios por período',
          'Exportar dados financeiros'
        ];
      default:
        return [];
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-500">Usuário não encontrado.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="mt-1 text-sm text-gray-600">
            Informações da sua conta e permissões no sistema.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações Principais */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-blue-600 text-white text-xl">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <Badge className={getRoleColor(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span className="text-sm">Email</span>
                  </div>
                  <p className="font-medium">{user.email}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Shield className="h-4 w-4 mr-2" />
                    <span className="text-sm">Nível de Acesso</span>
                  </div>
                  <p className="font-medium">{getRoleLabel(user.role)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Notificações</span>
                  <Badge variant="outline">Ativas</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tema</span>
                  <Badge variant="outline">Claro</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Idioma</span>
                  <Badge variant="outline">Português</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissões */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Permissões do Sistema
              </CardTitle>
              <CardDescription>
                Funcionalidades disponíveis para o seu perfil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getPermissions(user.role).map((permission, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">{permission}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;