
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import PackageForm from '@/components/PackageForm';
import PackageList from '@/components/PackageList';
import VideoManager from '@/components/VideoManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package } from '@/types';
import { getPackages } from '@/services/dataService';
import { useAuth } from '@/contexts/AuthContext';
import { Plus } from 'lucide-react';

const Packages = () => {
  const { user } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showVideoManager, setShowVideoManager] = useState(false);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const data = await getPackages();
      const filteredData = data.filter(pkg => pkg.type === 'package');
      setPackages(filteredData);
    } catch (error) {
      console.error('Erro ao carregar pacotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePackageCreated = () => {
    setShowForm(false);
    loadPackages();
  };

  const handleManageVideos = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowVideoManager(true);
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

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestão de Pacotes</h1>
              <p className="mt-1 text-sm text-gray-600">
                Gerencie seus pacotes musicais e acompanhe o progresso dos vídeos.
              </p>
            </div>
            {(user?.role === 'admin') && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Pacote
              </Button>
            )}
          </div>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Criar Novo Pacote</CardTitle>
            </CardHeader>
            <CardContent>
              <PackageForm
                type="package"
                onSuccess={handlePackageCreated}
                onCancel={() => setShowForm(false)}
              />
            </CardContent>
          </Card>
        )}

        {showVideoManager && selectedPackage && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Gerenciar Vídeos - {selectedPackage.clientName}</CardTitle>
            </CardHeader>
            <CardContent>
              <VideoManager
                package={selectedPackage}
                onClose={() => setShowVideoManager(false)}
              />
            </CardContent>
          </Card>
        )}

        <PackageList
          packages={packages}
          onManageVideos={handleManageVideos}
          onRefresh={loadPackages}
        />
      </div>
    </Layout>
  );
};

export default Packages;
