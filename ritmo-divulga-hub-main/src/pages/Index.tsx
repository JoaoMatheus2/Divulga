
import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Package, FileText, DollarSign, Users, Bell } from 'lucide-react';

const Index = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: Package,
      title: 'Gestão de Pacotes',
      description: 'Controle completo de pacotes musicais com acompanhamento de processos.'
    },
    {
      icon: FileText,
      title: 'Posts Individuais',
      description: 'Gerenciamento de posts únicos com controle financeiro detalhado.'
    },
    {
      icon: DollarSign,
      title: 'Controle Financeiro',
      description: 'Relatórios completos de receita, comissões e lucro líquido.'
    },
    {
      icon: Users,
      title: 'Acesso Multiusuário',
      description: 'Diferentes perfis de acesso para cada membro da equipe.'
    },
    {
      icon: Bell,
      title: 'Notificações',
      description: 'Alertas automáticos para atualizações de status dos vídeos.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start mb-6">
                  <Music className="h-16 w-16 text-blue-600" />
                </div>
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">MusicManager</span>
                  <span className="block text-blue-600 xl:inline"> Sistema de Gestão</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Plataforma completa para gestão de divulgação musical com controle financeiro, 
                  acompanhamento de processos e acesso multiusuário.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link to="/login">
                      <Button size="lg" className="w-full">
                        Acessar Sistema
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
              Funcionalidades
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Tudo que você precisa em um só lugar
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Gerencie seus pacotes musicais, acompanhe processos e tenha controle total 
              sobre suas finanças.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Icon className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <CardTitle className="text-lg">{feature.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-500">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Pronto para começar?</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-blue-200">
            Acesse o sistema e comece a gerenciar suas divulgações musicais de forma profissional.
          </p>
          <Link to="/login">
            <Button variant="secondary" size="lg" className="mt-8">
              Fazer Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
