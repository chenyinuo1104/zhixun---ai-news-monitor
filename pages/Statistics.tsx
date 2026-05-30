import React, { useState, useEffect } from 'react';
import { TrendItem } from '../types';
import { supabase } from '../lib/supabase';

const Statistics: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        // 计算时间范围
        const now = new Date();
        let startDate: Date;

        switch (timeframe) {
          case '24h':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }

        // 从news表获取当前时间范围的新闻
        const { data: currentPeriodData, error: currentError } = await supabase
          .from('news')
          .select('tags, created_at')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false });

        if (currentError) {
          console.error('Error fetching current period news:', currentError);
          setTrends([]);
          setLoading(false);
          return;
        }

        // 获取上一个周期的数据用于计算增长率
        let previousStartDate: Date;
        switch (timeframe) {
          case '24h':
            previousStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
            break;
          case '7d':
            previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            previousStartDate = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            previousStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
        }

        const { data: previousPeriodData } = await supabase
          .from('news')
          .select('tags')
          .gte('created_at', previousStartDate.toISOString())
          .lt('created_at', startDate.toISOString());

        if (!currentPeriodData || currentPeriodData.length === 0) {
          setTrends([]);
          setLoading(false);
          return;
        }

        // 统计当前周期标签出现次数
        const currentTagCounts: { [key: string]: number } = {};
        currentPeriodData.forEach((item: any) => {
          const tags = item.tags || [];
          tags.forEach((tag: string) => {
            currentTagCounts[tag] = (currentTagCounts[tag] || 0) + 1;
          });
        });

        // 统计上一周期标签出现次数
        const previousTagCounts: { [key: string]: number } = {};
        if (previousPeriodData && previousPeriodData.length > 0) {
          previousPeriodData.forEach((item: any) => {
            const tags = item.tags || [];
            tags.forEach((tag: string) => {
              previousTagCounts[tag] = (previousTagCounts[tag] || 0) + 1;
            });
          });
        }

        // 转换为数组并排序
        const sortedTags = Object.entries(currentTagCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10); // 取前10个

        // 生成渐变色配置
        const gradients = [
          'from-yellow-400 to-orange-500',
          'from-slate-300 to-slate-500',
          'from-orange-400 to-orange-600',
          'from-slate-200 to-slate-400',
          'from-blue-400 to-blue-600',
          'from-purple-400 to-purple-600',
          'from-pink-400 to-pink-600',
          'from-emerald-400 to-emerald-600',
          'from-cyan-400 to-cyan-600',
          'from-indigo-400 to-indigo-600',
        ];

        // 转换为TrendItem格式，计算真实增长率
        const trendItems: TrendItem[] = sortedTags.map((tag, index) => {
          // 计算真实增长率
          const currentCount = tag.count;
          const previousCount = previousTagCounts[tag.name] || 0;

          let growth = 0;
          if (previousCount === 0 && currentCount > 0) {
            // 新标签，标记为100%增长
            growth = 100;
          } else if (previousCount > 0) {
            // 计算百分比变化
            growth = Math.round(((currentCount - previousCount) / previousCount) * 100);
          }

          return {
            id: index + 1,
            rank: index + 1,
            name: tag.name,
            volume: `${(tag.count * 1000).toLocaleString()}`, // 放大显示量级
            growth: growth,
            color: gradients[index],
          };
        });

        setTrends(trendItems);
      } catch (error) {
        console.error('Error:', error);
        setTrends([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();

    // 设置定时刷新（每60秒）
    const intervalId = setInterval(() => {
      fetchTrends();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [timeframe]);

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col relative overflow-hidden pb-32">
      {/* Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-[50vh] z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-64 h-64 bg-primary/10 rounded-full blur-[80px]"></div>
        <div className="absolute top-[20%] right-[10%] w-64 h-64 bg-blue-400/10 rounded-full blur-[80px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 pt-4 pb-2 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">舆情统计</h2>
        <div className="w-10 h-10 flex items-center justify-center">
          <button className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center hover:bg-white transition-colors">
            <span className="material-symbols-outlined text-slate-800">settings</span>
          </button>
        </div>
      </header>

      {/* Timeframe Switcher */}
      <div className="relative z-10 px-6 py-2">
        <div className="bg-white/50 backdrop-blur-md rounded-full p-1 flex border border-white/60">
          {(['24h', '7d', '30d'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${timeframe === t
                ? 'bg-primary text-white shadow-md'
                : 'text-slate-500 hover:bg-white/50'
                }`}
            >
              {t === '24h' ? '24小时' : t === '7d' ? '7天' : '30天'}
            </button>
          ))}
        </div>
      </div>

      {/* Bubble Viz - 显示Top3标签 */}
      <div className="relative z-10 w-full h-[340px] flex items-center justify-center">
        <div className="relative w-full h-full max-w-sm">
          {!loading && trends.length > 0 && (
            <>
              {/* Center Bubble - Top 1 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full
                 bg-gradient-to-br from-white/90 via-white/40 to-primary/20 backdrop-blur-sm
                 shadow-[inset_-5px_-5px_15px_rgba(0,0,0,0.05),5px_5px_20px_rgba(139,92,246,0.15)]
                 flex flex-col items-center justify-center border border-white/40 z-20">
                <div className="absolute top-0 left-0 w-full h-full rounded-full bg-gradient-to-br from-white/80 to-transparent opacity-60"></div>
                <span className="text-xl font-black text-primary relative z-10">{trends[0]?.name}</span>
                <span className="text-sm font-bold text-primary/70 relative z-10">{trends[0]?.volume}</span>
              </div>

              {/* Second Bubble - Top 2 */}
              {trends.length > 1 && (
                <div className="absolute top-[15%] left-[10%] w-28 h-28 rounded-full
                   bg-gradient-to-br from-white/90 via-white/40 to-blue-500/20 backdrop-blur-sm
                   shadow-[inset_-5px_-5px_15px_rgba(0,0,0,0.05),5px_5px_20px_rgba(59,130,246,0.15)]
                   flex flex-col items-center justify-center border border-white/40 z-10 animate-float-delayed">
                  <span className="text-base font-bold text-blue-600 relative z-10">{trends[1]?.name}</span>
                  <span className="text-[10px] font-bold text-blue-600/70 relative z-10">{trends[1]?.volume}</span>
                </div>
              )}

              {/* Third Bubble - Top 3 */}
              {trends.length > 2 && (
                <div className="absolute bottom-[20%] right-[5%] w-32 h-32 rounded-full
                   bg-gradient-to-br from-white/90 via-white/40 to-pink-500/20 backdrop-blur-sm
                   shadow-[inset_-5px_-5px_15px_rgba(0,0,0,0.05),5px_5px_20px_rgba(236,72,153,0.15)]
                   flex flex-col items-center justify-center border border-white/40 z-10 animate-float">
                  <span className="text-lg font-bold text-pink-600 relative z-10">{trends[2]?.name}</span>
                  <span className="text-xs font-bold text-pink-600/70 relative z-10">{trends[2]?.volume}</span>
                </div>
              )}

              {/* Fourth Bubble - Top 4 (smaller) */}
              {trends.length > 3 && (
                <div className="absolute bottom-[15%] left-[15%] w-20 h-20 rounded-full
                   bg-gradient-to-br from-white/90 via-white/40 to-emerald-500/20 backdrop-blur-sm
                   flex flex-col items-center justify-center border border-white/40 z-0">
                  <span className="text-xs font-bold text-emerald-600 relative z-10">{trends[3]?.name}</span>
                </div>
              )}
            </>
          )}
          {loading && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400">
              加载中...
            </div>
          )}
        </div>
      </div>

      {/* Ranking List */}
      <div className="relative z-10 px-6 flex-1">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-xl font-bold text-slate-800">热度排行 Top 10</h3>
          <span className="text-xs font-medium text-slate-500 bg-white/50 px-2 py-1 rounded-lg">实时更新</span>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center text-slate-400">Loading trends...</div>
          ) : trends.length === 0 ? (
            <div className="text-center text-slate-400 py-8">暂无标签数据</div>
          ) : trends.map((item) => (
            <div key={item.id} className="glass-panel p-4 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0`}>
                {item.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-slate-800 truncate">{item.name}</h4>
                  <span className="text-sm font-bold text-primary">{item.volume}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${100 - (item.rank - 1) * 10}%`, opacity: 1 - (item.rank - 1) * 0.08 }}
                  ></div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center w-10">
                {item.growth > 0 ? (
                  <>
                    <span className="material-symbols-outlined text-red-500 text-lg">trending_up</span>
                    <span className="text-[10px] font-bold text-red-500">+{item.growth}%</span>
                  </>
                ) : item.growth < 0 ? (
                  <>
                    <span className="material-symbols-outlined text-green-500 text-lg">trending_down</span>
                    <span className="text-[10px] font-bold text-green-500">{item.growth}%</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-slate-400 text-lg">trending_flat</span>
                    <span className="text-[10px] font-bold text-slate-400">0%</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Statistics;
