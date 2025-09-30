import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Eye, Heart, Clock, BarChart3, Activity, Calendar, Newspaper } from 'lucide-react';
interface RadarStatsProps {
  totalNews: number;
  readNews: number;
  favoriteNews: number;
  lastUpdate: Date | null;
}
export const RadarStats = ({
  totalNews,
  readNews,
  favoriteNews,
  lastUpdate
}: RadarStatsProps) => {
  const readPercentage = totalNews > 0 ? Math.round(readNews / totalNews * 100) : 0;
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
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-primary" />
            Total de Notícias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{totalNews}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {unreadNews} não lidas
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Eye className="h-4 w-4 text-blue-500" />
            Lidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-500">{readNews}</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${readPercentage}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{readPercentage}%</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-pink-500/5 to-pink-500/10 border-pink-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Heart className="h-4 w-4 text-pink-500" />
            Favoritas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-pink-500">{favoriteNews}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Salvas para revisão
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-500" />
            Última Atualização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold text-green-500">
            {lastUpdate ? formatLastUpdate(lastUpdate) : 'Nunca'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Sistema atualizado
          </p>
        </CardContent>
      </Card>
    </div>
  );
};