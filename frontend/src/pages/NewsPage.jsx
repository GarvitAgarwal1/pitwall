import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../api/client';
import {
  Newspaper,
  ExternalLink,
  Clock,
  Bookmark,
  BookmarkCheck,
  Search,
  Filter,
  Sparkles,
} from 'lucide-react';

const FALLBACK_NEWS = [
  {
    title: 'Norris admits McLaren "didn\'t execute" in chaotic rain-hit São Paulo GP',
    link: 'https://www.autosport.com/f1/news/norris-admits-mclaren-didnt-execute-in-chaotic-brazil-gp/',
    description: 'Lando Norris concedes McLaren made strategic errors during the rain-affected São Paulo Grand Prix that dealt a blow to his 2024 F1 championship aspirations.',
    pub_date: '2024-11-04T10:15:00Z',
    source: 'Autosport',
    category: 'Race Reports',
    thumbnail_url: null,
  },
  {
    title: 'Verstappen\'s masterclass from 17th to victory: How the Brazilian GP was won',
    link: 'https://www.motorsport.com/f1/news/verstappen-masterclass-brazil-gp-win/',
    description: 'A deep tactical dive into Max Verstappen\'s extraordinary drive from 17th on the grid to win in Interlagos, setting 17 fastest laps along the way.',
    pub_date: '2024-11-04T08:30:00Z',
    source: 'Motorsport.com',
    category: 'Race Reports',
    thumbnail_url: null,
  },
  {
    title: 'Alpine\'s double podium delivers massive €30m boost in constructors\' battle',
    link: 'https://www.autosport.com/f1/news/alpines-double-podium-financial-boost/',
    description: 'Esteban Ocon and Pierre Gasly finished second and third in Brazil, lifting Alpine from ninth to sixth place in the World Constructors\' Championship standings.',
    pub_date: '2024-11-04T14:20:00Z',
    source: 'Autosport',
    category: 'Technical',
    thumbnail_url: null,
  },
  {
    title: 'Ferrari introduces upgraded floor modifications ahead of Las Vegas GP',
    link: 'https://www.motorsport.com/f1/news/ferrari-upgraded-floor-las-vegas/',
    description: 'Scuderia Ferrari readies its final aerodynamic development package of 2024 targeted at the long high-speed straights of the Las Vegas Strip Circuit.',
    pub_date: '2024-11-05T09:00:00Z',
    source: 'BBC Sport F1',
    category: 'Technical',
    thumbnail_url: null,
  },
  {
    title: 'FIA confirms 2026 Engine Regulations clarification regarding active aerodynamics',
    link: 'https://www.autosport.com/f1/news/fia-2026-active-aero-rules/',
    description: 'The World Motor Sport Council ratifies technical directives defining the baseline deployment modes for front and rear active aero wings.',
    pub_date: '2024-11-05T12:00:00Z',
    source: 'Motorsport.com',
    category: 'Regulations',
    thumbnail_url: null,
  },
  {
    title: 'Sauber confirms Gabriel Bortoleto to partner Nico Hulkenberg for 2025 season',
    link: 'https://www.autosport.com/f1/news/sauber-confirms-bortoleto-2025/',
    description: 'Formula 2 championship leader Gabriel Bortoleto will step up to Formula 1 with Kick Sauber on a multi-year deal ahead of Audi\'s 2026 entry.',
    pub_date: '2024-11-06T09:30:00Z',
    source: 'Autosport',
    category: 'Transfers',
    thumbnail_url: null,
  },
];

export default function NewsPage() {
  const [articles, setArticles] = useState(FALLBACK_NEWS);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedUrls, setBookmarkedUrls] = useState(() => {
    try {
      const saved = localStorage.getItem('pitwall_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Fetch live RSS news from FastAPI endpoint
  useEffect(() => {
    let isMounted = true;
    async function loadNews() {
      try {
        const res = await apiClient.get('/news?limit=25');
        if (isMounted && res?.articles?.length > 0) {
          setArticles(res.articles);
        }
      } catch (err) {
        // Fallback maintained
      }
    }
    loadNews();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleBookmark = (url) => {
    setBookmarkedUrls((prev) => {
      const next = prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url];
      try {
        localStorage.setItem('pitwall_bookmarks', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const filteredArticles = useMemo(() => {
    return articles.filter((item) => {
      if (selectedCategory === 'BOOKMARKS') {
        return bookmarkedUrls.includes(item.link);
      }
      if (selectedCategory !== 'ALL' && item.category && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          item.title?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.source?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [articles, selectedCategory, searchQuery, bookmarkedUrls]);

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="bg-[#12161F] border border-[#2A3245] rounded-xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E10600]/20 text-[#E10600] border border-[#E10600]/40 uppercase tracking-wider">
                Live RSS Feeds
              </span>
              <span className="text-xs font-mono text-[#64748B]">Autosport • Motorsport.com • BBC F1</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-display font-black text-white tracking-wide uppercase">
              Aggregated Formula 1 News & Technical Feeds
            </h2>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search news & reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1C2230] border border-[#2A3245] rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-white placeholder-[#64748B] focus:outline-none focus:border-[#E10600]"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#2A3245]">
          {['ALL', 'Race Reports', 'Technical', 'Regulations', 'Transfers', 'BOOKMARKS'].map((cat) => {
            const isBookmarks = cat === 'BOOKMARKS';
            const count = isBookmarks ? bookmarkedUrls.length : null;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#E10600] text-white shadow-md'
                    : 'bg-[#1C2230] text-[#94A3B8] hover:text-white'
                }`}
              >
                {isBookmarks && <Bookmark className="w-3.5 h-3.5" />}
                <span>{cat}</span>
                {count !== null && <span className="opacity-80">({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Responsive 3-Column News Card Grid */}
      {filteredArticles.length === 0 ? (
        <div className="h-48 flex flex-col items-center justify-center p-6 bg-[#12161F] border border-[#2A3245] rounded-xl text-center">
          <p className="font-mono text-sm text-[#64748B]">No articles found matching the current filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArticles.map((article, idx) => {
            const isBookmarked = bookmarkedUrls.includes(article.link);

            return (
              <div
                key={article.link || idx}
                className="bg-[#12161F] border border-[#2A3245] rounded-xl overflow-hidden shadow-lg flex flex-col justify-between hover:border-[#64748B] transition-all group"
              >
                {/* Article Header & Thumbnail Placeholder */}
                <div className="space-y-3 p-4">
                  <div className="h-32 bg-gradient-to-br from-[#1C2230] to-[#151922] rounded-lg border border-[#2A3245]/50 flex items-center justify-center relative overflow-hidden">
                    {article.thumbnail_url ? (
                      <img
                        src={article.thumbnail_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-[#64748B]">
                        <Newspaper className="w-8 h-8 opacity-40" />
                        <span className="text-[10px] font-mono uppercase tracking-widest">PITWALL FEED</span>
                      </div>
                    )}

                    {/* Source Pill */}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/75 text-white backdrop-blur-sm border border-white/10">
                      {article.source}
                    </span>

                    {/* Bookmark Star Button */}
                    <button
                      onClick={() => toggleBookmark(article.link)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/75 text-white backdrop-blur-sm hover:text-amber-400 transition-colors"
                      title={isBookmarked ? 'Remove Bookmark' : 'Save Article'}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <h3 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-xs text-[#94A3B8] font-mono line-clamp-3 leading-relaxed">
                    {article.description}
                  </p>
                </div>

                {/* Footer Link & Timestamp */}
                <div className="p-4 pt-2 border-t border-[#2A3245]/50 flex items-center justify-between text-xs font-mono text-[#64748B]">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(article.pub_date).toLocaleDateString()}</span>
                  </span>

                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#E10600] hover:text-[#FF1801] font-bold flex items-center gap-1 text-xs"
                  >
                    <span>Read Full</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
