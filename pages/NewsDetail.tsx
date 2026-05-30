import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NewsItem } from '../types';
import { supabase } from '../lib/supabase';
import { analyzeNews } from '../lib/sentimentAnalyzer';
import { classifyNews } from '../lib/newsClassifier';

interface ExtendedNewsItem extends NewsItem {
  images?: string[];
}

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return '刚刚';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString('zh-CN');
};

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [news, setNews] = useState<ExtendedNewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          return;
        }

        if (data) {
          // 使用前端分析器重新分析情感和分类
          const sentimentResult = analyzeNews(data.title, data.content || '');
          const category = classifyNews(data.title, data.content || '');
          
          setNews({
            id: data.id,
            source: data.source,
            time: formatTimeAgo(data.created_at),
            title: data.title,
            tags: data.tags || [],
            sentiment: sentimentResult.sentiment,
            imageUrl: data.image_url,
            category: category,
            isHighRisk: sentimentResult.isHighRisk,
            summary: data.summary,
            content: data.content,
            link: data.link,
            images: data.images || [],
          });
        }
      } catch (err) {
        console.error('Error:', err);
        setError('加载失败，请重试');
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
          <div className="text-6xl mb-4">📰</div>
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

      <div className="px-6 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px] text-slate-500">public</span>
          </div>
          <span className="text-sm font-bold text-slate-600">{news.source}</span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-400">{news.time}</span>
        </div>

        <h1 className="text-2xl font-black text-slate-800 leading-relaxed mb-6">{news.title}</h1>

        <div className="flex flex-wrap gap-2 mb-6">
          {news.tags.map((tag) => (
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
          {news.sentiment === 'neutral' && (
            <span className="text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] icon-filled">balance</span> 中性
            </span>
          )}
          {news.isHighRisk && (
            <span className="text-xs font-bold px-3 py-1.5 bg-red-50 text-red-500 rounded-lg flex items-center gap-1">
              <span>⚠️</span> 高风险
            </span>
          )}
        </div>

        {news.imageUrl && (
          <div className="rounded-3xl overflow-hidden mb-6 bg-slate-200">
            <img src={news.imageUrl} alt={news.title} className="w-full h-64 object-cover" />
          </div>
        )}

        {news.summary && (
          <div className="glass-panel p-5 rounded-3xl shadow-sm mb-6">
            <h3 className="text-sm font-bold text-slate-500 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">summarize</span>
              摘要
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">{news.summary}</p>
          </div>
        )}

        {news.images && news.images.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-500 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">photo_library</span>
              新闻配图
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {news.images.map((imgUrl, index) => (
                <div key={index} className="rounded-2xl overflow-hidden bg-slate-200">
                  <img
                    src={imgUrl}
                    alt={`${news.title} - 图片 ${index + 1}`}
                    className="w-full h-auto object-contain max-h-96"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {news.content && (
          <div className="glass-panel p-6 rounded-3xl shadow-sm mb-6">
            <h3 className="text-sm font-bold text-slate-500 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">article</span>
              正文
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{news.content}</p>
          </div>
        )}

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
      </div>
    </div>
  );
};

export default NewsDetail;
