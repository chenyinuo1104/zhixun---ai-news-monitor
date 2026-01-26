import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ path, icon, label, filled = false }: { path: string; icon: string; label: string; filled?: boolean }) => {
    const active = isActive(path);
    return (
      <button
        onClick={() => navigate(path)}
        className="flex-1 flex flex-col items-center justify-center gap-1 group transition-all duration-300"
      >
        <div className={`
          flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300
          ${active ? 'bg-gradient-to-br from-white to-purple-50 shadow-inner text-primary transform scale-105' : 'text-slate-400 hover:text-slate-600'}
        `}>
          <span className={`material-symbols-outlined text-[26px] ${active || filled ? 'icon-filled' : ''}`}>
            {icon}
          </span>
        </div>
        <span className={`text-[10px] font-bold transition-colors duration-300 ${active ? 'text-primary' : 'text-slate-400'}`}>
          {label}
        </span>
      </button>
    );
  };

  return (
    <div className="absolute bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-[430px] px-6 pointer-events-auto flex justify-center">
        <div className="w-full bg-white/80 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-[0_20px_40px_rgba(0,0,0,0.1)] h-[84px] flex items-center justify-between px-2 relative">
          
          <NavItem path="/dashboard" icon="grid_view" label="总览" />
          <NavItem path="/statistics" icon="analytics" label="统计" />

          {/* Central Floating Action Button */}
          <div className="relative -mt-10 mx-2 group cursor-pointer" onClick={() => navigate('/assistant')}>
             <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
             <button className={`
               w-[72px] h-[72px] rounded-full 
               bg-gradient-to-tr from-primary via-[#9F7AEA] to-[#EC4899]
               flex flex-col items-center justify-center 
               shadow-[0_8px_20px_rgba(139,92,246,0.4)] 
               border-[4px] border-[#F8F9FB]
               transform transition-transform duration-200 active:scale-95 hover:scale-105
             `}>
               <span className="material-symbols-outlined text-white text-[32px] icon-filled">auto_awesome</span>
               <span className="text-[9px] font-bold text-white mt-0.5">AI 助手</span>
             </button>
          </div>

          <NavItem path="/alerts" icon="notifications" label="预警" />
          <NavItem path="/profile" icon="person" label="我的" filled={isActive('/profile')} />
          
        </div>
      </div>
    </div>
  );
};

export default BottomNav;