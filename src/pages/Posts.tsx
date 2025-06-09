
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import PackageForm from '@/components/PackageForm';
import VideoManager from '@/components/VideoManager';
import PaymentManager from '@/components/PaymentManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, PACKAGE_TYPE_LABELS } from '@/types';
import { getPosts } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { ptBR } from 'date-fns/locale'
import { format } from 'date-fns'

import { Plus, FileText, DollarSign, Calendar, User, Play, CreditCard } from 'lucide-react';

const Posts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Package | null>(null);
  const [showVideoManager, setShowVideoManager] = useState(false);
  const [showPaymentManager, setShowPaymentManager] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await getPosts();
      const filteredData = data.filter(pkg => pkg.type === 'post');
      setPosts(filteredData);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = () => {
    setShowForm(false);
    loadPosts();
  };


  const handleManageVideos = (post: Package) => {
    setSelectedPost(post);
    setShowVideoManager(true);
    setShowPaymentManager(false);
  };

  const handleManagePayments = (post: Package) => {
    setSelectedPost(post);
    setShowPaymentManager(true);
    setShowVideoManager(false);
  };

  const getStatusColor = (status: Package['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'briefing_sent' : return 'Briefing Enviado';
      case 'video_posted' : return 'Vídeo Postado';
      case 'sent_to_group' : return 'Enviado no Grupo';
      case 'engaged' : return 'Vídeo Engajado';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Package['status']) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      case 'briefing_sent' : return 'Briefing Enviado';
      case 'video_posted' : return 'Vídeo Postado';
      case 'sent_to_group' : return 'Enviado no Grupo';
      case 'engaged' : return 'Vídeo Engajado';
      default: return status;
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

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestão de Posts</h1>
              <p className="mt-1 text-sm text-gray-600">
                Gerencie seus posts individuais de divulgação musical e acompanhe o progresso dos vídeos.
              </p>
            </div>
            {user?.role === 'admin' && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Post
              </Button>
            )}
          </div>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Criar Novo Post</CardTitle>
            </CardHeader>
            <CardContent>
              <PackageForm
                type="post"
                onSuccess={handlePostCreated}
                onCancel={() => setShowForm(false)}
              />
            </CardContent>
          </Card>
        )}

{showVideoManager && selectedPost && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Gerenciar Vídeo - {selectedPost.clientName}</CardTitle>
            </CardHeader>
            <CardContent>
              <VideoManager
                package={selectedPost}
                onClose={() => setShowVideoManager(false)}
              />
            </CardContent>
          </Card>
        )}
        
      {showPaymentManager && selectedPost && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Gerenciar Pagamentos - {selectedPost.clientName}</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentManager
                package={selectedPost}
                onClose={() => setShowPaymentManager(false)}
                onUpdate={loadPosts}
              />
            </CardContent>
          </Card>
        )}


        {posts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum post encontrado</h3>
              <p className="text-gray-500">Crie seu primeiro post para começar.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{post.clientName}</CardTitle>
                    <Badge className={getStatusColor(post.status)}>
                      {getStatusLabel(post.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-1" />
                    {PACKAGE_TYPE_LABELS[post.type]}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center text-gray-600 mb-1">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Valor Total
                      </div>
                      <div className="font-semibold">R$ {post.totalValue.toFixed(2)}</div>
                    </div>
                    
                    <div>
                      <div className="flex items-center text-gray-600 mb-1">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Lucro Líquido
                      </div>
                      <div className={`font-semibold ${post.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        R$ {(post.netProfit ?? 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Comissão Juninho: R$ {(post.juninhoCommission ?? 0).toFixed(2)}</div>
                    <div>Comissão Natália: R$ {(post.nataliaCommission ?? 0).toFixed(2)}</div>
                    <div>Pró-Labore: R$ {(post.proLabore ?? 0).toFixed(2)}</div>
                    <div>Custo Engajamento: R$ {(post.engagementCost ?? 0).toFixed(2)}</div>
                  </div>

                  <div className="pt-3 border-t">
                  <div className="flex items-center text-xs text-gray-500 mb-3">
                <Calendar className="h-3 w-3 mr-1" />
                Criado em {format(new Date(post.createdAt), "dd/MM/yyyy", { locale: ptBR })}
              </div>
              <div className="space-y-2">
                      {(user?.role === 'admin' || user?.role === 'video_manager') && (
                        <Button 
                          onClick={() => handleManageVideos(post)}
                          className="w-full"
                          size="sm"
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Gerenciar Vídeo
                        </Button>
                      )}
                      
                      {(user?.role === 'admin' || user?.role === 'financial') && (
                        <Button 
                          onClick={() => handleManagePayments(post)}
                          className="w-full"
                          size="sm"
                          variant="outline"
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Gerenciar Pagamentos
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Posts;