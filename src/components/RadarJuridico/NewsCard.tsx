import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Clock, Eye, Calendar, ExternalLink, Newspaper } from 'lucide-react';
import { OptimizedImage } from '@/components/OptimizedImage';
interface LegalNews {
  id: string;
  portal: string;
  title: string;
  preview?: string;
  image_url?: string;
  news_url: string;
  published_at?: string;
  cached_at: string;
}
interface NewsCardProps {
  news: LegalNews;
  isRead: boolean;
  isFavorite: boolean;
  onRead: (news: LegalNews) => void;
  onToggleFavorite: (id: string) => void;
}
const PORTAL_COLORS = {
  migalhas: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  conjur: 'bg-green-500/20 text-green-300 border-green-500/30',
  amodireito: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  jota: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  jusbrasil: 'bg-red-500/20 text-red-300 border-red-500/30',
  dizerodireito: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  espacovital: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
};
export const NewsCard = ({
  news,
  isRead,
  isFavorite,
  onRead,
  onToggleFavorite
}: NewsCardProps) => {
  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const publishedDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours === 1) return '1 hora atrás';
    if (diffInHours < 24) return `${diffInHours} horas atrás`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 dia atrás';
    if (diffInDays < 7) return `${diffInDays} dias atrás`;
    return publishedDate.toLocaleDateString('pt-BR');
  };
  return <Card className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-l-4 ${isRead ? 'opacity-70 border-l-muted' : 'border-l-yellow-500'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`${PORTAL_COLORS[news.portal as keyof typeof PORTAL_COLORS] || 'bg-gray-500/20 text-gray-300'} text-xs`}>
              {news.portal.toUpperCase()}
            </Badge>
            
            {news.published_at && <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatTimeAgo(news.published_at)}
              </div>}
            
            {!isRead && <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-400">
                Novo
              </Badge>}
          </div>
          
          <div className="flex items-center gap-1">
            
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0" onClick={() => onRead(news)}>
        <div className="space-y-3">
          {news.image_url && <div className="relative overflow-hidden rounded-lg aspect-video">
              <OptimizedImage src={news.image_url} alt={news.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>}
          
          <h3 className={`font-semibold leading-tight line-clamp-3 group-hover:text-yellow-400 transition-colors ${isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
            {news.title}
          </h3>
          
          {news.preview && <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {news.preview}
            </p>}
          
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {isRead && <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Lida
                </div>}
            </div>
            
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => onRead(news)} className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30 text-xs" variant="outline">
                <Newspaper className="h-3 w-3 mr-1" />
                Ler Agora
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
};