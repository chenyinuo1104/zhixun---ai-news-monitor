import React from 'react';
import { ChatMessage } from '../types';

const Assistant: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FFFBF2] flex flex-col relative overflow-hidden text-slate-800">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-orange-50 via-yellow-50/50 to-transparent"></div>
        <div className="absolute top-[-10%] right-[-20%] w-[400px] h-[400px] bg-orange-200/20 rounded-full blur-[80px]"></div>
        <div className="absolute top-[20%] left-[-10%] w-[300px] h-[300px] bg-yellow-200/30 rounded-full blur-[60px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-20 px-5 py-4 flex items-center justify-between bg-white/70 backdrop-blur-xl border-b border-white/50 sticky top-0">
        <button className="p-2 -ml-2 text-slate-500 hover:bg-orange-50 rounded-full transition-colors">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-500 icon-filled">bubble_chart</span>
            AI 舆情助手
          </h1>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">实时在线</span>
          </div>
        </div>
        <button className="p-2 -mr-2 text-slate-500 hover:bg-orange-50 rounded-full transition-colors">
          <span className="material-symbols-outlined">history</span>
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar p-5 pb-48 relative z-10 space-y-8">
        <div className="flex justify-center py-2">
          <span className="text-[10px] font-bold text-slate-400 bg-white/60 px-4 py-1.5 rounded-full shadow-sm backdrop-blur border border-white/50">
            今天 ✨ 10:23 AM
          </span>
        </div>

        {/* User Message */}
        <div className="flex justify-end">
          <div className="flex flex-col items-end gap-1.5 max-w-[85%]">
            <div className="bg-white border border-orange-100 px-6 py-4 rounded-[1.8rem] rounded-tr-md text-[15px] leading-relaxed text-slate-700 shadow-sm">
               当前关于新贸易政策的舆论情感如何？ 🤔
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-100 ml-3 mt-auto border-2 border-white shadow-md flex items-center justify-center overflow-hidden shrink-0">
             <span className="material-symbols-outlined text-slate-400">person</span>
          </div>
        </div>

        {/* Processing State */}
        <div className="flex flex-col gap-3 my-2">
          <div className="flex items-center gap-3 px-4">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md border border-orange-100 animate-spin-slow">
              <span className="material-symbols-outlined text-orange-400 text-lg">cyclone</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-600 font-bold">正在检索 5 篇全球来源文章... 🌍</span>
              <span className="text-[10px] text-orange-500 font-medium">已找到相关报道 ✨</span>
            </div>
          </div>
          <div className="ml-16 w-32 h-1 bg-slate-200 rounded-full overflow-hidden">
             <div className="h-full bg-gradient-to-r from-orange-400 to-pink-500 w-2/3 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* AI Response */}
        <div className="flex flex-col gap-2">
          <div className="flex items-end gap-3">
             <div className="w-12 h-12 rounded-2xl shrink-0 relative flex items-center justify-center shadow-lg bg-gradient-to-br from-[#FFBE0B] via-[#FF8F5C] to-[#FF5C8D] border border-white/40">
                <div className="absolute inset-0 bg-white/20 rounded-2xl"></div>
                <span className="material-symbols-outlined text-white text-2xl icon-filled drop-shadow-md z-10">diamond</span>
             </div>
             
             <div className="flex flex-col w-full max-w-[95%]">
               <span className="text-[11px] font-bold text-slate-400 mb-2 ml-1 flex items-center gap-1">
                  AI 舆情分析师 <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-[9px] border border-orange-200 font-black">BOT</span>
               </span>
               <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[2rem] rounded-tl-sm p-6 relative shadow-sm">
                  <p className="text-[15px] leading-relaxed text-slate-700 font-medium">
                     根据最新报告，舆论情感喜忧参半 😯，但总体偏向谨慎 🛡️。主要金融媒体表达了对关税的担忧 📉，而国内制造业则表现出乐观情绪 🌟。
                     <br/><br/>
                     <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
                        ✨ 核心摘要如下：
                     </span>
                  </p>
                  <ul className="mt-5 space-y-3">
                    <li className="flex items-center gap-3 bg-red-50 rounded-2xl p-3 border border-red-100">
                       <div className="bg-white text-red-500 rounded-full p-2 shadow-sm shrink-0">
                          <span className="material-symbols-outlined text-[18px]">trending_up</span>
                       </div>
                       <span className="text-sm text-slate-700 font-medium">金融板块波动性上升了 <span className="text-red-600 font-black">12%</span> 📊</span>
                    </li>
                     <li className="flex items-center gap-3 bg-green-50 rounded-2xl p-3 border border-green-100">
                       <div className="bg-white text-green-500 rounded-full p-2 shadow-sm shrink-0">
                          <span className="material-symbols-outlined text-[18px]">handshake</span>
                       </div>
                       <span className="text-sm text-slate-700 font-medium">制造业工会领袖发表了联合支持声明 🤝</span>
                    </li>
                  </ul>
               </div>
             </div>
          </div>
        </div>

      </main>

      {/* Input Area */}
      <div className="fixed bottom-[100px] left-0 right-0 z-40 flex justify-center pointer-events-none">
         <div className="w-full max-w-[430px] px-4 pointer-events-auto">
             <div className="flex items-end gap-2 bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-2 pr-3 border border-white shadow-[0_8px_32px_rgba(255,143,92,0.15)] focus-within:ring-2 focus-within:ring-orange-200 transition-all">
                <button className="p-3 text-slate-400 hover:text-orange-500 transition-colors rounded-full">
                   <span className="material-symbols-outlined text-[24px]">add_circle</span>
                </button>
                <textarea 
                   className="flex-1 bg-transparent border-0 focus:ring-0 p-3 text-slate-700 placeholder:text-slate-400 resize-none max-h-24 text-[15px] font-medium" 
                   placeholder="询问近期热点事件..." 
                   rows={1}
                />
                <button className="bg-gradient-to-br from-orange-400 to-pink-500 text-white p-3 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                   <span className="material-symbols-outlined text-[22px] ml-0.5 icon-filled">send</span>
                </button>
             </div>
         </div>
      </div>

    </div>
  );
};

export default Assistant;