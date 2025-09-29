import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const YOUTUBE_API_KEY = 'AIzaSyARKbLg6juoX5gOnDdsZgAt217z20s08GA';

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  publishedAt: string;
  channelTitle: string;
}

interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoCount: number;
  videos: YouTubeVideo[];
}

serve(async (req): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const requestBody = await req.json();
    const { action, videoId, playlistId, areaFilter, query } = requestBody;

    console.log('YouTube API request:', { action, videoId, playlistId, areaFilter, query });

    switch (action) {
      case 'searchVideos':
        const searchResults = await searchVideos(query);
        return new Response(
          JSON.stringify(searchResults),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'getVideosByArea':
        return await getVideosByArea(supabase, areaFilter);
      
      case 'getVideoDetails':
        const videoDetails = await getVideoDetails(videoId);
        return new Response(
          JSON.stringify(videoDetails),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      
      case 'getPlaylistDetails':
        const playlistDetails = await getPlaylistDetails(playlistId);
        return new Response(
          JSON.stringify(playlistDetails),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      
      case 'getVideosFromDatabase':
        return await getVideosFromDatabase(supabase, areaFilter);
      
      default:
        throw new Error('Ação não suportada');
    }
  } catch (error: any) {
    console.error('Erro na YouTube API:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Erro desconhecido' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function getVideosFromDatabase(supabase: any, areaFilter?: string) {
  console.log('Buscando vídeos do banco de dados:', areaFilter);
  
  let query = supabase.from('VIDEOS').select('*');
  
  if (areaFilter) {
    query = query.eq('area', areaFilter);
  }
  
  const { data: videos, error } = await query;
  
  if (error) {
    throw new Error(`Erro ao buscar vídeos: ${error.message}`);
  }

  // Enriquecer dados com informações do YouTube
  const enrichedVideos = await Promise.all(
    videos.map(async (video: any) => {
      try {
        const videoId = extractVideoId(video.link);
        if (videoId) {
          const youtubeData = await getVideoDetails(videoId);
          return {
            ...video,
            youtube: youtubeData
          };
        }
        return video;
      } catch (error) {
        console.error(`Erro ao enriquecer vídeo ${video.id}:`, error);
        return video;
      }
    })
  );

  return new Response(
    JSON.stringify({ videos: enrichedVideos }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getVideosByArea(supabase: any, area: string) {
  console.log('Buscando vídeos por área:', area);
  
  const { data: videos, error } = await supabase
    .from('VIDEOS')
    .select('*')
    .eq('area', area);
  
  if (error) {
    throw new Error(`Erro ao buscar vídeos: ${error.message}`);
  }

  // Agrupar vídeos e buscar detalhes do YouTube
  const videoGroups: { [key: string]: any[] } = {};
  
  for (const video of videos) {
    if (!videoGroups[video.area]) {
      videoGroups[video.area] = [];
    }
    
    try {
      const videoId = extractVideoId(video.link);
      if (videoId) {
        const youtubeData = await getVideoDetails(videoId);
        videoGroups[video.area].push({
          ...video,
          youtube: youtubeData
        });
      } else {
        videoGroups[video.area].push(video);
      }
    } catch (error) {
      console.error(`Erro ao buscar detalhes do vídeo ${video.id}:`, error);
      videoGroups[video.area].push(video);
    }
  }

  return new Response(
    JSON.stringify({ videoGroups }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getVideoDetails(videoId: string): Promise<YouTubeVideo> {
  const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails,statistics&key=${YOUTUBE_API_KEY}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`YouTube API erro: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data.items || data.items.length === 0) {
    throw new Error('Vídeo não encontrado');
  }
  
  const video = data.items[0];
  
  return {
    id: video.id,
    title: video.snippet.title,
    description: video.snippet.description,
    thumbnail: video.snippet.thumbnails.maxresdefault?.url || video.snippet.thumbnails.high?.url,
    duration: formatDuration(video.contentDetails.duration),
    publishedAt: video.snippet.publishedAt,
    channelTitle: video.snippet.channelTitle
  };
}

async function getPlaylistDetails(playlistId: string): Promise<YouTubePlaylist> {
  // Buscar detalhes da playlist
  const playlistUrl = `https://www.googleapis.com/youtube/v3/playlists?id=${playlistId}&part=snippet,contentDetails&key=${YOUTUBE_API_KEY}`;
  
  const playlistResponse = await fetch(playlistUrl);
  if (!playlistResponse.ok) {
    throw new Error(`YouTube API erro: ${playlistResponse.status}`);
  }
  
  const playlistData = await playlistResponse.json();
  
  if (!playlistData.items || playlistData.items.length === 0) {
    throw new Error('Playlist não encontrada');
  }
  
  const playlist = playlistData.items[0];
  
  // Buscar vídeos da playlist
  const videosUrl = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&part=snippet&maxResults=50&key=${YOUTUBE_API_KEY}`;
  
  const videosResponse = await fetch(videosUrl);
  if (!videosResponse.ok) {
    throw new Error(`YouTube API erro ao buscar vídeos: ${videosResponse.status}`);
  }
  
  const videosData = await videosResponse.json();
  
  const videos: YouTubeVideo[] = videosData.items.map((item: any) => ({
    id: item.snippet.resourceId.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.maxresdefault?.url || item.snippet.thumbnails.high?.url,
    duration: '', // Precisaria de outra chamada para obter duração
    publishedAt: item.snippet.publishedAt,
    channelTitle: item.snippet.channelTitle
  }));
  
  return {
    id: playlist.id,
    title: playlist.snippet.title,
    description: playlist.snippet.description,
    thumbnail: playlist.snippet.thumbnails.maxresdefault?.url || playlist.snippet.thumbnails.high?.url,
    videoCount: playlist.contentDetails.itemCount,
    videos
  };
}

function extractVideoId(url: string): string | null {
  if (!url) return null;
  
  // Diferentes padrões de URL do YouTube
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/ // ID direto
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

function extractPlaylistId(url: string): string | null {
  const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function formatDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return '';
  
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

async function searchVideos(query: string) {
  const API_KEY = Deno.env.get('YOUTUBE_API_KEY');
  
  if (!API_KEY) {
    throw new Error('YouTube API key not configured');
  }

  try {
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10&key=${API_KEY}`
    );
    
    if (!searchResponse.ok) {
      throw new Error(`YouTube API error: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    
    const videos = searchData.items?.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
    })) || [];
    
    return { videos };
  } catch (error) {
    console.error('Error searching videos:', error);
    throw error;
  }
}