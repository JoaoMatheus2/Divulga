
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Video, VIDEO_STATUS_LABELS } from '@/types';
import { getVideosByPackageId, updateVideoStatus } from '@/services/api';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Play, 
  Send, 
  Users, 
  TrendingUp, 
  Clock,
  CheckCircle,
  X
} from 'lucide-react';

interface VideoManagerProps {
  package: Package;
  onClose: () => void;
}

const VideoManager: React.FC<VideoManagerProps> = ({ package: pkg, onClose }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    loadVideos();
  }, [pkg.id]);

  const loadVideos = async () => {
    try {
      const data = await getVideosByPackageId(pkg.id);
      console.log('Dados recebidos:', data);
      setVideos(data);
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (videoId: number, newStatus: Video['status']) => {
    setUpdating(videoId);
    
    try {
      const updatedVideo = await updateVideoStatus(videoId, newStatus);
      
      if (updatedVideo) {
        setVideos(prev => 
          prev.map(video => 
            video.id === videoId ? updatedVideo : video
          )
        );

        // Se o status foi alterado para "video_posted", enviar notificação
        if (newStatus === 'video_posted') {
          console.log(`Video Number: ${updatedVideo.videoNumber}`);
          addNotification({
            title: 'Vídeo Postado',
            message: `Vídeo ${updatedVideo.videoNumber} do pacote ${pkg.clientName} foi postado. Aguardando envio para o grupo.`,
            type: 'info',
            userId: '2' // ID do irmão
          });
        }

        addNotification({
          title: 'Status Atualizado',
          message: `Status do vídeo ${updatedVideo.videoNumber} atualizado para: ${VIDEO_STATUS_LABELS[newStatus]}`,
          type: 'success'
        });
      }
    } catch (error) {
      addNotification({
        title: 'Erro',
        message: 'Erro ao atualizar status do vídeo.',
        type: 'error'
      });
    } finally {
      setUpdating(null);
    }
  };

  const getStatusIcon = (status: Video['status']) => {
    switch (status) {
      case 'briefing_sent': return Clock;
      case 'video_posted': return Play;
      case 'sent_to_group': return Send;
      case 'engaged': return TrendingUp;
      default: return Clock;
    }
  };

  const getStatusColor = (status: Video['status']) => {
    switch (status) {
      case 'briefing_sent': return 'bg-yellow-100 text-yellow-800';
      case 'video_posted': return 'bg-blue-100 text-blue-800';
      case 'sent_to_group': return 'bg-purple-100 text-purple-800';
      case 'engaged': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (currentStatus: Video['status']): Video['status'] | null => {
    switch (currentStatus) {
      case 'briefing_sent': return 'video_posted';
      case 'video_posted': return 'sent_to_group';
      case 'sent_to_group': return 'engaged';
      default: return null;
    }
  };

  const canUpdateStatus = (status: Video['status']) => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'video_manager') {
      return status === 'video_posted'; // Só pode atualizar de "postado" para "enviado no grupo"
    }
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Vídeos do Pacote: {pkg.clientName}
        </h3>
        <Button variant="outline" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => {
          const StatusIcon = getStatusIcon(video.status);
          const nextStatus = getNextStatus(video.status);
          const canUpdate = canUpdateStatus(video.status);

          return (
            <Card key={video.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Vídeo {video.videoNumber}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(video.status)}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {VIDEO_STATUS_LABELS[video.status]} 
                  </Badge>
                </div>

                <div className="text-xs text-gray-500">
                  Última atualização: {new Date(video.updatedAt).toLocaleString()}
                </div>

                {nextStatus && canUpdate && (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleStatusUpdate(video.id, nextStatus)}
                    disabled={updating === video.id}
                  >
                    {updating === video.id ? (
                      'Atualizando...'
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-3 w-3" />
                        {VIDEO_STATUS_LABELS[nextStatus]}
                      </>
                    )}
                  </Button>
                )}

                {video.status === 'engaged' && (
                  <div className="text-center py-2">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-1" />
                    <div className="text-xs text-green-600 font-medium">
                      Concluído
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">Progresso do Pacote</h4>
        <div className="flex space-x-4 text-sm">
          <div>
            <span className="text-gray-600">Total de vídeos:</span>
            <span className="ml-1 font-medium">{videos.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Concluídos:</span>
            <span className="ml-1 font-medium text-green-600">
              {videos.filter(v => v.status === 'engaged').length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Pendentes:</span>
            <span className="ml-1 font-medium text-orange-600">
              {videos.filter(v => v.status !== 'engaged').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoManager;