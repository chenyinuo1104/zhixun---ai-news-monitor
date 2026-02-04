import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { NewsItem } from '../types';
import { supabase } from '../lib/supabase';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'high-risk' | 'tech' | 'finance' | 'policy' | 'culture'>('all');

  // 计算各分类的新闻数量
  const getCategoryCount = (category: string): number => {
    if (category === 'all') return news.length;
    if (category === 'high-risk') return news.filter(item => item.isHighRisk === true).length;
    return news.filter(item => item.category === category).length;
  };

  // Time formatting utility
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return '刚刚';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  // Keep static chart data for now as per plan focus
  const data = [
    { time: '00:00', value: 30 },
    { time: '04:00', value: 45 },
    { time: '08:00', value: 65 },
    { time: '12:00', value: 50 },
    { time: '16:00', value: 85 },
    { time: '20:00', value: 70 },
    { time: '24:00', value: 40 },
  ];

  const pieData = [
    { name: 'Positive', value: 35, color: '#10B981' }, // Green
    { name: 'Neutral', value: 50, color: '#8B5CF6' }, // Purple
    { name: 'Negative', value: 15, color: '#F97316' }, // Orange
  ];

  // Fetch news from Supabase
  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching news:', error);
      } else if (data) {
        const formattedNews = data.map((item: any) => ({
          id: item.id,
          source: item.source,
          time: formatTimeAgo(item.created_at),
          title: item.title,
          tags: item.tags || [],
          sentiment: item.sentiment,
          imageUrl: item.image_url,
          category: item.category,
          isHighRisk: item.is_high_risk,
          summary: item.summary
        }));
        setNews(formattedNews);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchNews();

    // Set up real-time subscription
    const channel = supabase
      .channel('news-changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'news' },
        (payload) => {
          console.log('New news item:', payload.new);
          const newItem: NewsItem = {
            id: payload.new.id,
            source: payload.new.source,
            time: formatTimeAgo(payload.new.created_at),
            title: payload.new.title,
            tags: payload.new.tags || [],
            sentiment: payload.new.sentiment,
            imageUrl: payload.new.image_url,
            category: payload.new.category,
            isHighRisk: payload.new.is_high_risk,
            summary: payload.new.summary
          };
          setNews(prev => [newItem, ...prev]);
        }
      )
      .subscribe();

    // Set up periodic refresh (every 30 seconds)
    const intervalId = setInterval(() => {
      fetchNews();
    }, 30000);

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-32">
      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              舆情看板 <span className="text-yellow-400 text-3xl">✨</span>
            </h1>
            <p className="text-[10px] tracking-[0.2em] text-primary font-bold uppercase mt-1">News Monitor</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-400">account_circle</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative shadow-sm rounded-2xl group focus-within:ring-2 ring-primary/20 transition-all">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
          </div>
          <input
            type="text"
            placeholder="✨ 问问 AI 现在的流行趋势..."
            className="w-full h-14 pl-14 pr-12 rounded-2xl border-none bg-white text-sm font-medium placeholder-slate-400 focus:ring-0"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <span className="material-symbols-outlined text-primary opacity-60">mic</span>
          </div>
        </div>
      </header>

      {/* 24H Overview */}
      <section className="px-6 mb-8">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <div className="w-1.5 h-5 bg-emerald-500 rounded-full"></div>
            24H 概览
          </h2>
          <span className="text-[10px] text-slate-400 font-bold uppercase">Update: Live</span>
        </div>

        <div className="glass-panel p-5 rounded-[32px] shadow-sm relative overflow-hidden mb-4">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs text-slate-400 font-medium mb-1">新闻声量</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-800 tracking-tight">{news.length.toLocaleString()}</span>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center">
                  <span className="material-symbols-outlined text-[14px] mr-0.5 icon-filled">trending_up</span> +12%
                </span>
              </div>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <span className="material-symbols-outlined icon-filled">bar_chart</span>
            </div>
          </div>

          <div className="h-24 w-[110%] -ml-[5%]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 px-2 mt-1 font-medium">
            <span>00:00</span>
            <span>12:00</span>
            <span>18:00</span>
          </div>
        </div>

        {/* Sentiment Distribution */}
        <div className="glass-panel p-6 rounded-[32px] shadow-sm">
          <p className="text-xs text-slate-400 font-medium mb-1">情感分布</p>
          <h3 className="text-xl font-bold text-slate-800 mb-6">混合态势</h3>

          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={54}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={10}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center text-3xl">
                🤔
              </div>
            </div>

            <div className="flex-1 space-y-3">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs font-medium text-slate-500">
                      {item.name === 'Positive' ? '积极' : item.name === 'Neutral' ? '中性' : '负面'}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-700">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="px-6 mb-6 overflow-x-auto no-scrollbar">
        <div className="flex gap-3">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-6 py-2.5 rounded-full text-xs font-bold shadow-lg whitespace-nowrap transition-all ${activeFilter === 'all'
              ? 'bg-slate-800 text-white shadow-slate-200'
              : 'bg-white text-slate-600 border border-slate-100 shadow-sm'
              }`}
          >
            全部 {!loading && <span className="text-[10px] opacity-70">({getCategoryCount('all')})</span>}
          </button>
          <button
            onClick={() => setActiveFilter('high-risk')}
            className={`px-6 py-2.5 rounded-full text-xs font-bold flex items-center gap-1 whitespace-nowrap transition-all ${activeFilter === 'high-risk'
              ? 'bg-slate-800 text-white shadow-lg shadow-slate-200'
              : 'bg-white text-slate-600 border border-slate-100 shadow-sm'
              }`}
          >
            <span className="text-orange-500">🔥</span> 高风险 {!loading && <span className="text-[10px] opacity-70">({getCategoryCount('high-risk')})</span>}
          </button>
          <button
            onClick={() => setActiveFilter('tech')}
            className={`px-6 py-2.5 rounded-full text-xs font-bold flex items-center gap-1 whitespace-nowrap transition-all ${activeFilter === 'tech'
              ? 'bg-slate-800 text-white shadow-lg shadow-slate-200'
              : 'bg-white text-slate-600 border border-slate-100 shadow-sm'
              }`}
          >
            <span className="text-blue-500">🤖</span> 科技 {!loading && <span className="text-[10px] opacity-70">({getCategoryCount('tech')})</span>}
          </button>
          <button
            onClick={() => setActiveFilter('finance')}
            className={`px-6 py-2.5 rounded-full text-xs font-bold flex items-center gap-1 whitespace-nowrap transition-all ${activeFilter === 'finance'
              ? 'bg-slate-800 text-white shadow-lg shadow-slate-200'
              : 'bg-white text-slate-600 border border-slate-100 shadow-sm'
              }`}
          >
            <span className="text-green-500">💰</span> 财经 {!loading && <span className="text-[10px] opacity-70">({getCategoryCount('finance')})</span>}
          </button>
          <button
            onClick={() => setActiveFilter('policy')}
            className={`px-6 py-2.5 rounded-full text-xs font-bold flex items-center gap-1 whitespace-nowrap transition-all ${activeFilter === 'policy'
              ? 'bg-slate-800 text-white shadow-lg shadow-slate-200'
              : 'bg-white text-slate-600 border border-slate-100 shadow-sm'
              }`}
          >
            <span className="text-red-500">📋</span> 政策 {!loading && <span className="text-[10px] opacity-70">({getCategoryCount('policy')})</span>}
          </button>
          <button
            onClick={() => setActiveFilter('culture')}
            className={`px-6 py-2.5 rounded-full text-xs font-bold flex items-center gap-1 whitespace-nowrap transition-all ${activeFilter === 'culture'
              ? 'bg-slate-800 text-white shadow-lg shadow-slate-200'
              : 'bg-white text-slate-600 border border-slate-100 shadow-sm'
              }`}
          >
            <span className="text-pink-500">🎨</span> 人文 {!loading && <span className="text-[10px] opacity-70">({getCategoryCount('culture')})</span>}
          </button>
        </div>
      </div>

      {/* Realtime Feed */}
      <section className="px-6">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <div className="w-1.5 h-5 bg-orange-500 rounded-full"></div>
            实时动态
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="text-center text-slate-400 py-10">加载中...</div>
          ) : (() => {
            // Apply filter logic
            const filteredNews = news.filter(item => {
              if (activeFilter === 'all') return true;
              if (activeFilter === 'high-risk') return item.isHighRisk === true;
              if (activeFilter === 'tech') return item.category === 'tech';
              if (activeFilter === 'finance') return item.category === 'finance';
              if (activeFilter === 'policy') return item.category === 'policy';
              if (activeFilter === 'culture') return item.category === 'culture';
              return true;
            });

            if (filteredNews.length === 0) {
              const emptyMessages = {
                'all': { emoji: '📭', title: '暂无新闻', subtitle: '系统中还没有任何新闻内容' },
                'high-risk': { emoji: '✅', title: '无高风险新闻', subtitle: '当前没有需要特别关注的高风险新闻' },
                'tech': { emoji: '🤖', title: '暂无科技新闻', subtitle: '科技分类下暂时没有内容' },
                'finance': { emoji: '💰', title: '暂无财经新闻', subtitle: '财经分类下暂时没有内容' },
                'policy': { emoji: '📋', title: '暂无政策新闻', subtitle: '政策分类下暂时没有内容' },
                'culture': { emoji: '🎨', title: '暂无人文新闻', subtitle: '人文分类下暂时没有内容' },
              };
              const message = emptyMessages[activeFilter] || emptyMessages['all'];

              return (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">{message.emoji}</div>
                  <p className="text-slate-400 font-medium">{message.title}</p>
                  <p className="text-xs text-slate-300 mt-2">{message.subtitle}</p>
                </div>
              );
            }

            return filteredNews.map(item => (
              <div
                key={item.id}
                onClick={() => navigate(`/news/${item.id}`)}
                className="glass-panel p-4 rounded-3xl shadow-sm border border-slate-100 flex gap-4 cursor-pointer hover:shadow-md hover:border-primary/20 transition-all active:scale-[0.98]"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px] text-slate-500">public</span>
                    </div>
                    <span className="text-xs font-bold text-slate-600">{item.source}</span>
                    <span className="text-[10px] text-slate-400">{item.time}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 leading-relaxed mb-3 line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="flex gap-2">
                    {item.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-500 rounded-lg"># {tag}</span>
                    ))}
                    {item.sentiment === 'negative' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-50 text-orange-500 rounded-lg flex items-center gap-1">
                        <span className="material-symbols-outlined text-[10px] icon-filled">warning</span> 负面
                      </span>
                    )}
                    {item.sentiment === 'positive' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-green-50 text-green-500 rounded-lg flex items-center gap-1">
                        <span className="material-symbols-outlined text-[10px] icon-filled">thumb_up</span> 积极
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-20 h-20 bg-slate-200 rounded-2xl flex-shrink-0 overflow-hidden">
                  <img src={item.imageUrl} alt="news" className="w-full h-full object-cover opacity-90" />
                </div>
              </div>
            ))
          })()}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;