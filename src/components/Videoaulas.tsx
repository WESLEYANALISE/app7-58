import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Search, NotebookPen, Film, Book, Palette } from 'lucide-react';
import { useNavigation } from '@/context/NavigationContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { VideoPlayerEnhanced } from '@/components/VideoPlayerEnhanced';
import type { YouTubePlaylist } from '@/hooks/useYouTube';
interface DBVideoRow {
  id: number;
  area: string;
  link: string;
}
interface PlaylistCard extends DBVideoRow {
  playlistId?: string | null;
  meta?: YouTubePlaylist;
}
interface VideoStats {
  totalVideos: number;
  totalAreas: number;
}
export const Videoaulas = () => {
  const {
    setCurrentFunction
  } = useNavigation();
  const [items, setItems] = useState<PlaylistCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<{
    area: string;
    playlist: YouTubePlaylist;
  } | null>(null);
  const [stats, setStats] = useState<VideoStats>({
    totalVideos: 0,
    totalAreas: 0
  });
  const [searchResults, setSearchResults] = useState<any[]>([]);
  useEffect(() => {
    loadPlaylists();
  }, []);
  const handleBack = () => {
    if (selected) {
      setSelected(null);
      return;
    }
    setCurrentFunction(null);
  };
  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const {
        data,
        error
      } = await supabase.from('VIDEOS').select('id, area, link').order('area');
      if (error) throw error;
      const base: PlaylistCard[] = (data || []).map(row => ({
        ...row,
        playlistId: extractPlaylistId(row.link)
      }));

      // Buscar metadados no YouTube (playlist ou vídeo único)
      const enriched = await Promise.all(base.map(async row => {
        try {
          if (row.playlistId) {
            const {
              data: payload,
              error: fnError
            } = await supabase.functions.invoke('youtube-api', {
              body: {
                action: 'getPlaylistDetails',
                playlistId: row.playlistId
              }
            });
            if (fnError) throw fnError;
            return {
              ...row,
              meta: payload as YouTubePlaylist
            };
          } else {
            // Link pode ser vídeo único - criar playlist com 1 item
            const videoId = extractVideoId(row.link);
            if (!videoId) return row; // sem como enriquecer
            const {
              data: videoData,
              error: fnError
            } = await supabase.functions.invoke('youtube-api', {
              body: {
                action: 'getVideoDetails',
                videoId
              }
            });
            if (fnError) throw fnError;
            const v = videoData as any;
            const playlistLike: YouTubePlaylist = {
              id: v.id,
              title: v.title,
              description: v.description || '',
              thumbnail: v.thumbnail,
              videos: [v],
              itemCount: 1
            } as YouTubePlaylist;
            return {
              ...row,
              meta: playlistLike
            };
          }
        } catch (e) {
          console.error('Falha ao enriquecer item', row.id, e);
          return row;
        }
      }));
      setItems(enriched);

      // Calculate stats
      const totalVideos = enriched.reduce((acc, item) => acc + (item.meta?.videos?.length || 0), 0);
      const uniqueAreas = new Set(enriched.map(item => item.area));
      setStats({
        totalVideos,
        totalAreas: uniqueAreas.size
      });
    } catch (e) {
      console.error('Erro ao carregar playlists:', e);
    } finally {
      setLoading(false);
    }
  };

  // Search for individual videos when user types
  const searchVideos = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('youtube-api', {
        body: {
          action: 'searchVideos',
          query: searchTerm
        }
      });
      if (error) throw error;
      setSearchResults(data?.videos || []);
    } catch (e) {
      console.error('Erro ao buscar vídeos:', e);
      setSearchResults([]);
    }
  };
  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return items;

    // Trigger video search when user types
    searchVideos(term);
    return items.filter(it => it.area?.toLowerCase().includes(term) || it.meta?.title?.toLowerCase().includes(term));
  }, [items, search]);

  // Player dentro do app
  if (selected) {
    return <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
          <div className="flex items-center h-full px-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <h1 className="ml-4 text-lg font-semibold">{selected.area}</h1>
          </div>
        </div>

        <VideoPlayerEnhanced video={{
        area: selected.area
      }} playlist={selected.playlist} onBack={() => setSelected(null)} />
      </div>;
  }
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30 h-14">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2 hover:bg-accent/80">
              <ArrowLeft className="h-5 w-5" strokeWidth={3} />
              Voltar
            </Button>
            <h1 className="ml-4 text-lg font-semibold">Videoaulas</h1>
          </div>
          
          {/* Notes button in header */}
          <Button variant="ghost" size="sm" onClick={() => setCurrentFunction('Minhas Anotações')} className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-600 border border-amber-200">
            <NotebookPen className="h-4 w-4" />
            Anotações
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="flex gap-4 mb-4">
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            {stats.totalVideos} vídeos totais
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            {stats.totalAreas} áreas
          </Badge>
        </div>

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Buscar vídeos específicos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>

        {/* Search Results */}
        {search && searchResults.length > 0 && <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Resultados da busca:</h3>
            <div className="grid grid-cols-1 gap-2">
              {searchResults.slice(0, 5).map((video: any) => <Card key={video.id} className="cursor-pointer hover:bg-accent/50" onClick={() => {
            // Open individual video
            const videoPlaylist: YouTubePlaylist = {
              id: video.id,
              title: video.title,
              description: video.description || '',
              thumbnail: video.thumbnail,
              videos: [video],
              itemCount: 1
            };
            setSelected({
              area: 'Busca',
              playlist: videoPlaylist
            });
          }}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <img src={video.thumbnail} alt={video.title} className="w-16 h-12 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium line-clamp-1">{video.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{video.channelTitle}</p>
                    </div>
                    <Play className="h-4 w-4 text-red-600" />
                  </CardContent>
                </Card>)}
            </div>
          </div>}

        {/* Playlists Grid - 2 por linha */}
        {!search && <>
            <h3 className="text-sm font-medium text-muted-foreground mt-6">Playlists por área:</h3>
            {loading ? <div className="grid grid-cols-2 gap-3">
                {Array.from({
            length: 6
          }).map((_, i) => <Card key={i} className="animate-pulse">
                    <div className="aspect-video bg-muted rounded-t-lg" />
                    <CardContent className="p-3">
                      <div className="h-4 bg-muted rounded w-3/4" />
                    </CardContent>
                  </Card>)}
              </div> : <div className="grid grid-cols-2 gap-3">
                {filtered.map(item => {
            const thumb = item.meta?.thumbnail || '/placeholder.svg';
            const count = item.meta?.videos?.length || 0;
            return <Card key={item.id} className="group cursor-pointer overflow-hidden border-2 hover:border-primary/50 transition-all duration-300" onClick={() => item.meta && setSelected({
              area: item.area,
              playlist: item.meta
            })}>
                      <div className="relative aspect-video bg-muted overflow-hidden">
                        <img src={thumb} alt={item.meta?.title || item.area} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }} />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

                        <div className="absolute top-2 left-2">
                          <Badge className="bg-black/80 text-white text-xs">{count} vídeos</Badge>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-red-600/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform backdrop-blur-sm">
                            <Play className="h-6 w-6 text-white ml-0.5" />
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-3">
                        <h3 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                          {item.meta?.title || item.area}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">{item.area}</p>
                      </CardContent>
                    </Card>;
          })}
              </div>}
          </>}

        {/* Vazio */}
        {!loading && !search && filtered.length === 0 && <Card className="text-center p-8">
            <h3 className="font-semibold mb-2">Nenhum resultado encontrado</h3>
            <p className="text-muted-foreground text-sm">Não há vídeos disponíveis no momento.</p>
          </Card>}
      </div>

      {/* Floating Footer Menu */}
      <FloatingFooterMenu />
    </div>;
};

// Helpers
function extractVideoId(url: string): string | null {
  if (!url) return null;
  const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/, /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/, /^([a-zA-Z0-9_-]{11})$/];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}
function extractPlaylistId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

// Floating Footer Menu Component
const FloatingFooterMenu = () => {
  const {
    setCurrentFunction
  } = useNavigation();
  const menuItems = [{
    id: 'juriflix',
    title: 'Juriflix',
    icon: Film,
    function: 'Juriflix',
    color: 'from-red-500 to-red-600'
  }, {
    id: 'biblioteca',
    title: 'Biblioteca',
    icon: Book,
    function: 'Biblioteca de Estudos',
    color: 'from-blue-500 to-blue-600'
  }, {
    id: 'mapas',
    title: 'Mapas Mentais',
    icon: Palette,
    function: 'Mapas Mentais',
    color: 'from-green-500 to-green-600'
  }];
  return <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden mx-auto max-w-md">
        
      </div>
    </div>;
};