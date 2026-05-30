import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
   const navigate = useNavigate();
   const { user, signOut } = useAuth();
   const [profile, setProfile] = useState<any>(null);

   useEffect(() => {
      if (!user) return;

      const fetchProfile = async () => {
         try {
            const { data, error } = await supabase
               .from('profiles')
               .select('*')
               .eq('id', user.id)
               .single();

            if (!error && data) {
               setProfile(data);
            }
         } catch (error) {
            console.error('Error:', error);
         }
      };

      fetchProfile();
   }, [user]);

   const handleSignOut = async () => {
      await signOut();
   };

   if (!user) {
      return (
         <div className="min-h-screen bg-[#FDF4F7] flex flex-col items-center justify-center px-6 pb-32">
            <div className="w-20 h-20 rounded-full bg-white/80 flex items-center justify-center mb-4 shadow-sm">
               <span className="material-symbols-outlined text-4xl text-slate-400">person</span>
            </div>
            <h1 className="text-2xl font-black text-slate-800 mb-2">未登录</h1>
            <p className="text-sm text-slate-500 mb-6 text-center">登录后可保存 AI 对话与个人设置</p>
            <button
               onClick={() => navigate('/')}
               className="px-6 py-3 rounded-2xl bg-gradient-to-r from-secondary to-purple-500 text-white font-bold shadow-lg"
            >
               去登录
            </button>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-[#FDF4F7] flex flex-col relative overflow-hidden pb-32">
         <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-[-20%] right-[-30%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-3xl"></div>
            <div className="absolute top-[-10%] left-[-20%] w-[400px] h-[400px] bg-blue-200/40 rounded-full blur-3xl"></div>
         </div>

         <header className="relative z-20 grid grid-cols-3 items-center px-6 pt-12 pb-4">
            <div></div>
            <div className="flex justify-center">
               <span className="text-xs font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">个人空间</span>
            </div>
            <div className="flex justify-end">
               <button className="w-10 h-10 rounded-full glass-panel flex items-center justify-center shadow-sm text-slate-600">
                  <span className="material-symbols-outlined">settings</span>
               </button>
            </div>
         </header>

         <div className="relative z-10 flex flex-col items-center mt-2 px-6">
            <div className="relative mb-4">
               <div className="relative p-[4px] rounded-full bg-gradient-to-tr from-secondary via-white to-purple-500">
                  <div className="w-32 h-32 rounded-full border-[4px] border-white bg-slate-200 overflow-hidden">
                     <img
                        src={profile?.avatar_url || "https://picsum.photos/200/200?random=user"}
                        alt="User"
                        className="w-full h-full object-cover"
                     />
                  </div>
               </div>
            </div>

            <div className="text-center mb-6">
               <h1 className="text-3xl font-black text-slate-800 mb-1">
                  {profile?.full_name || user.email?.split('@')[0] || 'User'}
               </h1>
               <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-secondary to-[#FF8F70] text-white text-[10px] font-bold">
                     {profile?.position || '舆情分析师'}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/60 text-slate-500 text-[10px] font-bold border border-white/40">
                     @{profile?.department || '监测中心'}
                  </span>
               </div>
            </div>
         </div>

         <div className="px-6 flex-1">
            <button
               onClick={handleSignOut}
               className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-black shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
               <span className="material-symbols-outlined">logout</span>
               退出登录
            </button>
         </div>
      </div>
   );
};

export default Profile;
