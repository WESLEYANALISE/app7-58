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
  return;
};