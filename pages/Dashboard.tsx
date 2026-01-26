import React from 'react';
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { NewsItem } from '../types';

const Dashboard: React.FC = () => {
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

  const news: NewsItem[] = [
    {
      id: '1',
      source: 'TechDaily',
      time: '12m ago',
      title: '某大型云服务商因垄断行为面临反垄断诉讼',
      tags: ['科技'],
      sentiment: 'negative',
      imageUrl: 'https://picsum.photos/100/100?random=1',
    },
    {
      id: '2',
      source: 'GlobalFinance',
      time: '45m ago',
      title: '央行宣布下调存款准备金率0.5个百分点',
      tags: ['金融', '政策'],
      sentiment: 'positive',
      imageUrl: 'https://picsum.photos/100/100?random=2',
    }
  ];

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
                <span className="text-4xl font-black text-slate-800 tracking-tight">1,240</span>
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
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
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
                    <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}}></div>
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
          <button className="px-6 py-2.5 bg-slate-800 text-white rounded-full text-xs font-bold shadow-lg shadow-slate-200 whitespace-nowrap">全部</button>
          <button className="px-6 py-2.5 bg-white text-slate-600 rounded-full text-xs font-bold border border-slate-100 shadow-sm flex items-center gap-1 whitespace-nowrap">
            <span className="text-orange-500">🔥</span> 高风险
          </button>
          <button className="px-6 py-2.5 bg-white text-slate-600 rounded-full text-xs font-bold border border-slate-100 shadow-sm flex items-center gap-1 whitespace-nowrap">
            <span className="text-blue-500">🤖</span> 科技
          </button>
           <button className="px-6 py-2.5 bg-white text-slate-600 rounded-full text-xs font-bold border border-slate-100 shadow-sm flex items-center gap-1 whitespace-nowrap">
            <span className="text-pink-500">🎨</span> 人文
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
          {news.map(item => (
            <div key={item.id} className="glass-panel p-4 rounded-3xl shadow-sm border border-slate-100 flex gap-4">
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
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;