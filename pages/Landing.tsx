
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing: React.FC = () => {
  const navigator = useNavigate();
  const { signInWithEmail, signUp } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (isSignUp) {
        await signUp(email, password);
        setMessage('注册成功！请检查您的邮箱完成验证。');
        // Optional: switch back to login or stay here showing message
      } else {
        await signInWithEmail(email, password);
        navigator('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

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
              <circle cx="8" cy="16" r="4" fill="#8B5CF6" />
              <circle cx="16" cy="12" r="4" fill="#6366F1" />
              <circle cx="10" cy="8" r="3" fill="#A855F7" />
            </svg>
          </div>
          <div className="text-xl font-bold text-slate-800 flex items-center">
            Zhixun<span className="text-secondary text-3xl leading-none">.</span>
          </div>
        </div>
      </header>

      {/* Main Content - Floating Bubbles */}
      <main className="relative z-10 w-full flex-grow flex items-center justify-center perspective-1000">
        {showLogin ? (
          <div className="w-full max-w-sm p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white mx-4 animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-black text-slate-800 mb-2 text-center">
              {isSignUp ? '创建账户 ✨' : '欢迎回来 👋'}
            </h2>
            <p className="text-slate-500 text-sm text-center mb-8">
              {isSignUp ? '注册您的专属舆情空间' : '请登录您的账户以继续'}
            </p>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 ml-1 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
              {message && <p className="text-green-500 text-xs font-bold text-center">{message}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 h-14 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white font-bold text-lg shadow-lg shadow-indigo-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {loading ? '处理中...' : (isSignUp ? '注 册' : '登 录')}
                {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
              </button>
            </form>

            <div className="flex flex-col items-center gap-2 mt-4">
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-slate-500 text-xs font-bold hover:text-secondary">
                {isSignUp ? '已有账号？去登录' : '没有账号？去注册'}
              </button>
              <button onClick={() => setShowLogin(false)} className="text-slate-400 text-[10px] font-bold hover:text-slate-600">
                返回首页
              </button>
            </div>
          </div>
        ) : (
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
            <div onClick={() => setShowLogin(true)} className="absolute top-[18%] left-[50%] -translate-x-1/2 w-64 h-64 rounded-full animate-pulse-slow z-20 cursor-pointer
            bg-gradient-to-br from-[#FF9EBE] to-[#FF6B9E] shadow-[0_30px_60px_rgba(255,107,158,0.4)]
            flex flex-col items-center justify-center border-2 border-white/40 backdrop-blur-md hover:scale-105 transition-transform">
              <div className="absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-full blur-xl"></div>
              <span className="text-white text-4xl font-black tracking-tight drop-shadow-lg mb-2">人工智能</span>
              <div className="px-4 py-1 bg-white/20 rounded-full border border-white/40">
                <span className="text-white text-[10px] font-bold tracking-[0.2em]">TOUCH TO START</span>
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
        )}
      </main>

      {/* Footer / CTA - Only show if not logging in */}
      {!showLogin && (
        <footer className="relative z-10 w-full flex flex-col items-center gap-6 pb-8">
          <button
            onClick={() => setShowLogin(true)}
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
      )}
    </div>
  );
};

export default Landing;