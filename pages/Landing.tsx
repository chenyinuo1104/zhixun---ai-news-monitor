import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F0F8FF] relative overflow-hidden flex flex-col items-center justify-between py-8">
      {/* Background Mesh Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-[100px] opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-100 rounded-full blur-[100px] opacity-60"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full px-6 pt-4 flex justify-start">
        <div className="glass-panel px-4 py-2 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="16" r="4" fill="#8B5CF6"/>
              <circle cx="16" cy="12" r="4" fill="#6366F1"/>
              <circle cx="10" cy="8" r="3" fill="#A855F7"/>
            </svg>
          </div>
          <div className="text-xl font-bold text-slate-800 flex items-center">
            Zhixun<span className="text-secondary text-3xl leading-none">.</span>
          </div>
        </div>
      </header>

      {/* Main Content - Floating Bubbles */}
      <main className="relative z-10 w-full flex-grow flex items-center justify-center perspective-1000">
        <div className="relative w-full max-w-md h-[500px]">
          
          {/* Orange Bubble */}
          <div className="absolute top-[10%] left-[5%] w-40 h-40 rounded-full animate-float cursor-pointer
            bg-gradient-to-br from-[#FFD699] to-[#FFB347] shadow-[0_20px_40px_rgba(255,179,71,0.3)]
            flex items-center justify-center border border-white/30 backdrop-blur-sm">
            <div className="absolute top-4 left-4 w-12 h-12 bg-white/20 rounded-full blur-md"></div>
            <span className="text-white text-xl font-bold drop-shadow-md">宏观经济</span>
          </div>

          {/* Purple Bubble */}
          <div className="absolute top-[5%] right-[10%] w-36 h-36 rounded-full animate-float-delayed cursor-pointer
            bg-gradient-to-br from-[#E9D5FF] to-[#C084FC] shadow-[0_20px_40px_rgba(192,132,252,0.3)]
            flex items-center justify-center border border-white/30 backdrop-blur-sm">
            <div className="absolute top-3 left-3 w-10 h-10 bg-white/20 rounded-full blur-md"></div>
            <span className="text-white text-lg font-bold drop-shadow-md">品牌声誉</span>
          </div>

          {/* Big Pink Central Bubble */}
          <div className="absolute top-[18%] left-[50%] -translate-x-1/2 w-64 h-64 rounded-full animate-pulse-slow z-20 cursor-pointer
            bg-gradient-to-br from-[#FF9EBE] to-[#FF6B9E] shadow-[0_30px_60px_rgba(255,107,158,0.4)]
            flex flex-col items-center justify-center border-2 border-white/40 backdrop-blur-md">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-full blur-xl"></div>
            <span className="text-white text-4xl font-black tracking-tight drop-shadow-lg mb-2">人工智能</span>
            <div className="px-4 py-1 bg-white/20 rounded-full border border-white/40">
              <span className="text-white text-[10px] font-bold tracking-[0.2em]">AI CORE</span>
            </div>
          </div>

          {/* Blue Bubble */}
          <div className="absolute bottom-[8%] right-[5%] w-44 h-44 rounded-full animate-float-slow cursor-pointer
            bg-gradient-to-br from-[#7DD3FC] to-[#0EA5E9] shadow-[0_20px_40px_rgba(14,165,233,0.3)]
            flex items-center justify-center border border-white/30 backdrop-blur-sm">
             <div className="absolute top-5 left-5 w-14 h-14 bg-white/20 rounded-full blur-md"></div>
            <span className="text-white text-xl font-bold drop-shadow-md">市场波动</span>
          </div>

          {/* Green Bubble */}
          <div className="absolute bottom-[20%] left-[8%] w-32 h-32 rounded-full animate-float-delayed cursor-pointer
            bg-gradient-to-br from-[#BBF7D0] to-[#4ADE80] shadow-[0_20px_40px_rgba(74,222,128,0.3)]
            flex items-center justify-center border border-white/30 backdrop-blur-sm">
            <div className="absolute top-3 left-3 w-10 h-10 bg-white/20 rounded-full blur-md"></div>
            <span className="text-white text-lg font-bold drop-shadow-md">政策解读</span>
          </div>

        </div>
      </main>

      {/* Footer / CTA */}
      <footer className="relative z-10 w-full flex flex-col items-center gap-6 pb-8">
        <button 
          onClick={() => navigate('/dashboard')}
          className="group w-full max-w-xs h-20 rounded-[40px] 
            bg-gradient-to-r from-[#FF9EBE] to-[#FFD699] 
            shadow-[0_20px_40px_rgba(255,158,190,0.4)] 
            flex items-center justify-between px-3 pl-8 
            transition-transform active:scale-95"
        >
          <span className="text-white text-xl font-bold tracking-widest">点击进入登录</span>
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md group-hover:translate-x-1 transition-transform">
             <span className="material-symbols-outlined text-[#FF9EBE] text-2xl">arrow_forward</span>
          </div>
        </button>
        <p className="text-slate-400 text-[10px] font-bold tracking-[0.3em] uppercase">
          Intelligent Monitoring System
        </p>
      </footer>
    </div>
  );
};

export default Landing;