import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NewsItem } from '../types';
import { supabase } from '../lib/supabase';

const NewsDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [news, setNews] = useState<NewsItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    useEffect(() => {
        const fetchNewsDetail = async () => {
            if (!id) {
                setError('新闻 ID 不存在');
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('news')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) {
                    console.error('Error fetching news detail:', error);
                    setError('获取新闻详情失败');
                } else if (data) {
                    const newsItem: NewsItem = {
                        id: data.id,
                        source: data.source,
                        time: formatTimeAgo(data.created_at),
                        title: data.title,
                        tags: data.tags || [],
                        sentiment: data.sentiment,
                        imageUrl: data.image_url,
                        category: data.category,
                        isHighRisk: data.is_high_risk,
                        summary: data.summary,
                        content: data.content,
                        link: data.link
                    };
                    setNews(newsItem);
                }
            } catch (err) {
                console.error('Error:', err);
                setError('加载失败,请重试');
            } finally {
                setLoading(false);
            }
        };

        fetchNewsDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-400 font-medium">加载中...</p>
                </div>
            </div>
        );
    }

    if (error || !news) {
        return (
            <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
                <div className="text-center px-6">
                    <div className="text-6xl mb-4">😔</div>
                    <p className="text-slate-600 font-bold text-lg mb-2">{error || '新闻不存在'}</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-4 px-6 py-3 bg-primary text-white rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-all"
                    >
                        返回首页
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FB] pb-20">
            {/* Header with Back Button */}
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-slate-100">
                <div className="px-6 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all group"
                    >
                        <span className="material-symbols-outlined text-slate-600 group-hover:text-slate-800">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-bold text-slate-800">新闻详情</h1>
                </div>
            </header>

            {/* News Content */}
            <div className="px-6 pt-6">
                {/* Source and Time */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px] text-slate-500">public</span>
                    </div>
                    <span className="text-sm font-bold text-slate-600">{news.source}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-400">{news.time}</span>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-black text-slate-800 leading-relaxed mb-6">
                    {news.title}
                </h1>

                {/* Tags and Sentiment */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {news.tags.map(tag => (
                        <span key={tag} className="text-xs font-bold px-3 py-1.5 bg-blue-50 text-blue-500 rounded-lg">
                            # {tag}
                        </span>
                    ))}
                    {news.sentiment === 'negative' && (
                        <span className="text-xs font-bold px-3 py-1.5 bg-orange-50 text-orange-500 rounded-lg flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] icon-filled">warning</span> 负面
                        </span>
                    )}
                    {news.sentiment === 'positive' && (
                        <span className="text-xs font-bold px-3 py-1.5 bg-green-50 text-green-500 rounded-lg flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] icon-filled">thumb_up</span> 积极
                        </span>
                    )}
                    {news.isHighRisk && (
                        <span className="text-xs font-bold px-3 py-1.5 bg-red-50 text-red-500 rounded-lg flex items-center gap-1">
                            <span className="text-orange-500">🔥</span> 高风险
                        </span>
                    )}
                </div>

                {/* Image */}
                {news.imageUrl && (
                    <div className="rounded-3xl overflow-hidden mb-6 bg-slate-200">
                        <img src={news.imageUrl} alt={news.title} className="w-full h-64 object-cover" />
                    </div>
                )}

                {/* Summary */}
                {news.summary && (
                    <div className="glass-panel p-5 rounded-3xl shadow-sm mb-6">
                        <h3 className="text-sm font-bold text-slate-500 mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">summarize</span>
                            摘要
                        </h3>
                        <p className="text-sm text-slate-700 leading-relaxed">{news.summary}</p>
                    </div>
                )}

                {/* Content */}
                {news.content && (
                    <div className="glass-panel p-6 rounded-3xl shadow-sm mb-6">
                        <h3 className="text-sm font-bold text-slate-500 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">article</span>
                            正文
                        </h3>
                        <div className="prose prose-slate max-w-none">
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {news.content}
                            </p>
                        </div>
                    </div>
                )}

                {/* Original Link */}
                {news.link && (
                    <a
                        href={news.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block glass-panel p-5 rounded-3xl shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary">open_in_new</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 mb-0.5">查看原文</p>
                                    <p className="text-xs text-slate-400">在新窗口中打开</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">
                                chevron_right
                            </span>
                        </div>
                    </a>
                )}

                {/* No Content Message */}
                {!news.content && !news.summary && (
                    <div className="glass-panel p-10 rounded-3xl shadow-sm text-center">
                        <div className="text-5xl mb-3">📰</div>
                        <p className="text-slate-400 font-medium">暂无详细内容</p>
                        <p className="text-xs text-slate-300 mt-2">该新闻仅包含标题信息</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsDetail;
