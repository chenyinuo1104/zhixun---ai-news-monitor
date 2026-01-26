import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
   const { user, signOut } = useAuth();
   const [profile, setProfile] = useState<any>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      if (!user) return;

      const fetchProfile = async () => {
         try {
            const { data, error } = await supabase
               .from('profiles')
               .select('*')
               .eq('id', user.id)
               .single();

            if (error) {
               console.error('Error fetching profile:', error);
               // If no profile exists, using defaults or prompt setup
            } else {
               setProfile(data);
            }
         } catch (error) {
            console.error('Error:', error);
         } finally {
            setLoading(false);
         }
      };

      fetchProfile();
   }, [user]);

   const handleSignOut = async () => {
      await signOut();
   };

   return (
      <div className="min-h-screen bg-[#FDF4F7] flex flex-col relative overflow-hidden pb-32">

         {/* Background Decor */}
         <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-[-20%] right-[-30%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-3xl"></div>
            <div className="absolute top-[-10%] left-[-20%] w-[400px] h-[400px] bg-blue-200/40 rounded-full blur-3xl"></div>
            <div className="absolute top-[120px] left-[5%] w-16 h-16 rounded-full bg-gradient-to-br from-white/90 to-pink-200/40 backdrop-blur-sm shadow-inner z-10"></div>
            <div className="absolute top-[60px] right-[10%] w-24 h-24 rounded-full bg-gradient-to-br from-white/90 to-blue-200/40 backdrop-blur-sm shadow-inner z-10"></div>
         </div>

         {/* Header */}
         <header className="relative z-20 grid grid-cols-3 items-center px-6 pt-12 pb-4">
            <div></div>
            <div className="flex justify-center">
               <span className="text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">个人空间</span>
            </div>
            <div className="flex justify-end">
               <button className="w-10 h-10 rounded-full glass-panel flex items-center justify-center shadow-sm text-slate-600 active:scale-95 transition-transform">
                  <span className="material-symbols-outlined">settings</span>
               </button>
            </div>
         </header>

         {/* Avatar Section */}
         <div className="relative z-10 flex flex-col items-center mt-2 px-6">
            <div className="relative mb-4 group cursor-pointer">
               <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-secondary to-purple-500 blur-md opacity-70 group-hover:opacity-100 transition-opacity"></div>
               <div className="relative p-[4px] rounded-full bg-gradient-to-tr from-secondary via-white to-purple-500">
                  <div className="w-32 h-32 rounded-full border-[4px] border-white bg-slate-200 overflow-hidden">
                     <img
                        src={profile?.avatar_url || "https://picsum.photos/200/200?random=user"}
                        alt="User"
                        className="w-full h-full object-cover"
                     />
                  </div>
               </div>
               <div className="absolute bottom-1 right-1 bg-white text-secondary p-2 rounded-full shadow-lg border border-slate-100 hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[16px] font-bold block">edit</span>
               </div>
            </div>

            <div className="text-center mb-6">
               <h1 className="text-3xl font-black text-slate-800 mb-1 flex items-center justify-center gap-2">
                  {profile?.full_name || user?.email?.split('@')[0] || 'Guest'} <span className="text-2xl">✨</span>
               </h1>
               <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-secondary to-[#FF8F70] text-white text-[10px] font-bold shadow-lg shadow-secondary/30">
                     {profile?.position || '高级舆情分析师'}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/60 text-slate-500 text-[10px] font-bold border border-white/40">
                     @{profile?.department || '政府事务部'}
                  </span>
               </div>
            </div>
         </div>

         {/* Stats Cards */}
         <div className="px-6 mb-8">
            <div className="glass-panel w-full rounded-2xl p-4 flex items-center justify-between mb-4 shadow-sm hover:scale-[1.01] transition-transform">
               <div className="flex items-center gap-3">
                  <div className="flex h-3 w-3 relative">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">今日状态</span>
                     <span className="text-sm font-bold text-slate-800">🔥 搞大事中...</span>
                  </div>
               </div>
               <button className="text-slate-300 hover:text-secondary transition-colors">
                  <span className="material-symbols-outlined">edit</span>
               </button>
            </div>

            <div className="grid grid-cols-3 gap-4 w-full">
               {[
                  { val: 128, label: '关注话题', color: 'from-secondary to-purple-500' },
                  { val: 45, label: '已阅报告', color: 'from-blue-400 to-cyan-400' },
                  { val: 12, label: '待处理', color: 'from-amber-400 to-orange-400' }
               ].map((stat, idx) => (
                  <div key={idx} className="glass-panel rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group hover:-translate-y-1 transition-transform">
                     <div className={`absolute top-0 w-full h-1 bg-gradient-to-r ${stat.color}`}></div>
                     <span className="text-2xl font-black text-slate-800 mb-1">{stat.val}</span>
                     <span className="text-[10px] font-bold text-slate-400 uppercase">{stat.label}</span>
                  </div>
               ))}
            </div>
         </div>

         {/* Subscriptions */}
         <div className="px-6 flex-1 space-y-6">
            <div>
               <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                     <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-100 to-white text-secondary shadow-sm border border-white flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px] icon-filled">bookmarks</span>
                     </div>
                     我的订阅
                  </h3>
                  <button className="text-xs font-bold text-secondary">全部</button>
               </div>
               <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  {[
                     { icon: '🤖', name: 'AI 产业', bg: 'bg-blue-50' },
                     { icon: '💾', name: '半导体', bg: 'bg-purple-50' },
                     { icon: '🌍', name: '宏观经济', bg: 'bg-orange-50' }
                  ].map((sub, idx) => (
                     <div key={idx} className="glass-panel min-w-[120px] p-3 rounded-2xl flex flex-col items-center gap-2 cursor-pointer hover:bg-white transition-colors border border-white/60">
                        <div className={`w-10 h-10 rounded-xl ${sub.bg} flex items-center justify-center text-xl shadow-inner`}>{sub.icon}</div>
                        <span className="text-sm font-bold text-slate-700">{sub.name}</span>
                     </div>
                  ))}
               </div>
            </div>

            {/* Settings Preview */}
            <div className="glass-panel rounded-3xl p-5 shadow-sm">
               <h3 className="text-lg font-black text-slate-800 pb-4 flex items-center gap-2 border-b border-slate-100 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-white text-blue-500 shadow-sm border border-white flex items-center justify-center">
                     <span className="material-symbols-outlined text-[18px] icon-filled">tune</span>
                  </div>
                  监控设置
               </h3>
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white to-slate-50 shadow-md border border-white flex items-center justify-center text-orange-500">
                        <span className="material-symbols-outlined text-[20px] icon-filled">notifications_active</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">实时推送</span>
                        <span className="text-[10px] text-slate-400">关键词命中立即通知</span>
                     </div>
                  </div>
                  <div className="w-11 h-6 bg-gradient-to-r from-secondary to-[#FF8F70] rounded-full relative shadow-inner cursor-pointer">
                     <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </div>
               </div>
            </div>

            <button
               onClick={handleSignOut}
               className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-black shadow-lg shadow-red-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
               <span className="material-symbols-outlined">logout</span>
               退出登录
            </button>
         </div>

      </div>
   );
};

export default Profile;