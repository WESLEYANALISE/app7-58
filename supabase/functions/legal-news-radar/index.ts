import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NewsItem {
  portal: string
  title: string
  preview?: string
  full_content?: string
  image_url?: string
  news_url: string
  published_at?: string
}

const LEGAL_PORTALS = {
  conjur: {
    rss: ['https://www.conjur.com.br/rss'],
    baseUrl: 'https://www.conjur.com.br'
  },
  jusbrasil: {
    rss: ['https://blog.jusbrasil.com.br/feed'],
    baseUrl: 'https://blog.jusbrasil.com.br'
  },
  jota: {
    rss: ['https://www.jota.info/feed'],
    baseUrl: 'https://www.jota.info'
  },
  migalhas: {
    rss: ['https://www.migalhas.com.br/rss'],
    htmlList: ['https://www.migalhas.com.br/quentes'],
    baseUrl: 'https://www.migalhas.com.br'
  },
  amodireito: {
    rss: [
      'https://www.amodireito.com.br/feeds/posts/default?alt=rss',
      'https://www.amodireito.com.br/feed'
    ],
    baseUrl: 'https://www.amodireito.com.br'
  },
  stf: {
    htmlList: ['https://noticias.stf.jus.br/'],
    baseUrl: 'https://noticias.stf.jus.br'
  }
}

async function parseRSSFeed(url: string, portalName: string): Promise<NewsItem[]> {
  try {
    console.log(`Fetching RSS from ${url}`)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DireitoPremium/1.0)',
      }
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch RSS: ${response.status}`)
      return []
    }
    
    const rssText = await response.text()
    console.log(`RSS fetched successfully from ${portalName}`)
    
    // Parse RSS XML manually (basic implementation)
    const items: NewsItem[] = []
    const itemMatches = rssText.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || []
    
    for (const itemXml of itemMatches.slice(0, 10)) { // Limit to 10 items per portal
      const title = extractXmlContent(itemXml, 'title')
      const link = extractXmlContent(itemXml, 'link')
      const description = extractXmlContent(itemXml, 'description')
      const pubDate = extractXmlContent(itemXml, 'pubDate')
      
      // Extract image from RSS
      let imageUrl = null
      
      // Try enclosure tag first (any type)
      let enclosureMatch = itemXml.match(/<enclosure[^>]*url=["']([^"']+)["'][^>]*>/i)
      if (enclosureMatch) {
        const url = enclosureMatch[1]
        if (url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)) {
          imageUrl = url
        }
      }
      
      // Try media:content tag
      if (!imageUrl) {
        const mediaMatch = itemXml.match(/<media:content[^>]*url=["']([^"']+)["'][^>]*>/i)
        if (mediaMatch) {
          const url = mediaMatch[1]
          if (url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)) {
            imageUrl = url
          }
        }
      }
      
      // Try to extract image from description (more flexible)
      if (!imageUrl && description) {
        const imgMatch = description.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i)
        if (imgMatch) {
          let url = imgMatch[1]
          // Handle relative URLs
          if (url.startsWith('/') && !url.startsWith('//')) {
            const baseUrls: Record<string, string> = {
              'migalhas': 'https://www.migalhas.com.br',
              'amodireito': 'https://www.amodireito.com.br'
            }
            url = baseUrls[portalName] + url
          }
          if (url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)) {
            imageUrl = url
          }
        }
      }
      
      // Log for debugging
      if (imageUrl) {
        console.log(`Found image for ${portalName}: ${imageUrl}`)
      } else {
        console.log(`No image found for ${portalName} article: ${title}`)
      }
      
      if (title && link) {
        items.push({
          portal: portalName,
          title: cleanHtml(title) || '',
          preview: cleanHtml(description)?.substring(0, 300),
          image_url: imageUrl || undefined,
          news_url: link,
          published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString()
        })
      }
    }
    
    return items
  } catch (error) {
    console.error(`Error parsing RSS for ${portalName}:`, error)
    return []
  }
}

function extractXmlContent(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const match = xml.match(regex)
  return match ? match[1].trim() : null
}

function cleanHtml(text: string | null): string | null {
  if (!text) return null
  return text
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&[^;]+;/g, ' ')
    .trim()
}

async function parseHTMLList(url: string, portalName: string): Promise<NewsItem[]> {
  try {
    console.log(`Fetching HTML from ${url}`)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DireitoPremium/1.0)'
      }
    })
    if (!response.ok) {
      console.error(`Failed to fetch HTML: ${response.status}`)
      return []
    }
    const html = await response.text()

    const items: NewsItem[] = []
    let regex: RegExp

    if (portalName === 'migalhas') {
      regex = /<a[^>]+href=["'](https?:\/\/www\.migalhas\.com\.br\/quentes\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
    } else if (portalName === 'stf') {
      regex = /<a[^>]+href=["'](https?:\/\/noticias\.stf\.jus\.br\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
    } else if (portalName === 'amodireito') {
      regex = /<a[^>]+href=["'](https?:\/\/www\.amodireito\.com\.br\/[0-9]{4}\/[0-9]{2}\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
    } else {
      regex = /<a[^>]+href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
    }

    const seen = new Set<string>()
    let match
    while ((match = regex.exec(html)) && items.length < 10) {
      const articleUrl = match[1]
      if (seen.has(articleUrl)) continue
      seen.add(articleUrl)
      const title = cleanHtml(match[2]) || articleUrl
      if (!title || title.length < 10) continue
      items.push({
        portal: portalName,
        title,
        preview: undefined,
        image_url: undefined,
        news_url: articleUrl,
        published_at: new Date().toISOString()
      })
    }

    console.log(`Parsed ${items.length} items from HTML for ${portalName}`)
    return items
  } catch (error) {
    console.error(`Error parsing HTML for ${portalName}:`, error)
    return []
  }
}

async function fetchLegalNews(): Promise<NewsItem[]> {
  const allNews: NewsItem[] = []
  
  for (const [portalKey, portalConfig] of Object.entries(LEGAL_PORTALS) as any) {
    console.log(`Fetching news from ${portalKey}`)
    try {
      let collected: NewsItem[] = []

      // Try multiple RSS endpoints if available
      if (portalConfig.rss && Array.isArray(portalConfig.rss)) {
        for (const rssUrl of portalConfig.rss) {
          const news = await parseRSSFeed(rssUrl, portalKey)
          collected.push(...news)
        }
      }

      // Fallback to HTML list parsing when RSS fails or returns empty
      if (collected.length === 0 && portalConfig.htmlList && Array.isArray(portalConfig.htmlList)) {
        for (const htmlUrl of portalConfig.htmlList) {
          const news = await parseHTMLList(htmlUrl, portalKey)
          collected.push(...news)
        }
      }

      allNews.push(...collected)
      console.log(`Found ${collected.length} news items from ${portalKey}`)
    } catch (error) {
      console.error(`Error fetching from ${portalKey}:`, error)
    }
  }
  
  // Sort by published date (newest first)
  return allNews.sort((a, b) => 
    new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime()
   )
}

// Attempt to enrich items missing image_url by fetching og:image from the article page
async function tryFetchOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DireitoPremium/1.0)'
      }
    })
    if (!res.ok) return null
    const html = await res.text()

    const metaMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i)
    let image = metaMatch ? metaMatch[1].trim() : null

    // Fallback: first <img src>
    if (!image) {
      const imgMatch = html.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i)
      image = imgMatch ? imgMatch[1].trim() : null
    }

    if (!image) return null

    // Make absolute if needed
    try {
      const base = new URL(url)
      if (image.startsWith('//')) image = `${base.protocol}${image}`
      else if (image.startsWith('/')) image = `${base.protocol}//${base.host}${image}`
    } catch (_) { /* ignore */ }

    return image
  } catch (_) {
    return null
  }
}

async function enrichImages(items: NewsItem[], limit = 20, concurrency = 5): Promise<NewsItem[]> {
  const result = [...items]
  const targets = result
    .map((item, idx) => ({ item, idx }))
    .filter(x => !x.item.image_url)
    .slice(0, limit)

  let i = 0
  async function worker() {
    while (i < targets.length) {
      const cur = i++
      const { item, idx } = targets[cur]
      const img = await tryFetchOgImage(item.news_url)
      if (img) {
        result[idx] = { ...item, image_url: img }
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, targets.length) }, () => worker())
  await Promise.all(workers)
  return result
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check for cached news first (valid for 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: cachedNews, error: cacheError } = await supabase
      .from('legal_news_cache')
      .select('*')
      .gt('created_at', thirtyMinutesAgo)
      .order('published_at', { ascending: false })
      .limit(50)

    if (cacheError) {
      console.error('Cache error:', cacheError)
    }

    // If we have recent cached news, return it
    if (cachedNews && cachedNews.length > 0) {
      console.log(`Returning ${cachedNews.length} cached news items`)
      return new Response(JSON.stringify({
        success: true,
        data: cachedNews,
        cached: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Fetch fresh news
    console.log('Fetching fresh legal news...')
    let newsItems = await fetchLegalNews()

    // Enrich missing images using og:image (limited for performance)
    newsItems = await enrichImages(newsItems)
    
    if (newsItems.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Nenhuma notícia encontrada'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Cache the news (only insert known columns)
    const { error: insertError } = await supabase
      .from('legal_news_cache')
      .insert(newsItems.map(item => ({
        portal: item.portal,
        title: item.title,
        preview: item.preview,
        image_url: item.image_url,
        news_url: item.news_url,
        published_at: item.published_at
      })))

    if (insertError) {
      console.error('Error caching news:', insertError)
    }

    console.log(`Successfully fetched and cached ${newsItems.length} news items`)

    return new Response(JSON.stringify({
      success: true,
      data: newsItems,
      cached: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error('Error in legal-news-radar:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error?.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})