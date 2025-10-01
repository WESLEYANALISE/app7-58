import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Eye, 
  Heart, 
  Clock, 
  BarChart3, 
  Activity,
  Calendar,
  Newspaper
} from 'lucide-react';

interface RadarStatsProps {
  totalNews: number;
  readNews: number;
  favoriteNews: number;
  lastUpdate: Date | null;
}

export const RadarStats = ({ totalNews, readNews, favoriteNews, lastUpdate }: RadarStatsProps) => {
  const readPercentage = totalNews > 0 ? Math.round((readNews / totalNews) * 100) : 0;
  const unreadNews = totalNews - readNews;
  
  const formatLastUpdate = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-yellow-400">
            Total de Notícias
          </CardTitle>
          <Newspaper className="h-4 w-4 text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-400">{totalNews}</div>
          <div className="flex items-center gap-1 mt-1">
            <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-400">
              {unreadNews} novas
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-400">
            Leituras
          </CardTitle>
          <Eye className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-400">{readNews}</div>
          <div className="flex items-center gap-1 mt-1">
            <BarChart3 className="h-3 w-3 text-blue-400" />
            <span className="text-xs text-blue-400">{readPercentage}% lidas</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-400">
            Favoritas
          </CardTitle>
          <Heart className="h-4 w-4 text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-400">{favoriteNews}</div>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-red-400" />
            <span className="text-xs text-red-400">Salvas</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-400">
            Última Atualização
          </CardTitle>
          <Activity className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-sm font-bold text-green-400">
            {lastUpdate ? formatLastUpdate(lastUpdate) : 'Nunca'}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Clock className="h-3 w-3 text-green-400" />
            <span className="text-xs text-green-400">Auto-sync 30min</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};