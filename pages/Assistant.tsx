import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const Assistant: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    // Fetch initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) console.error('Error fetching messages:', error);
      else if (data) {
        setMessages(data.map((msg: any) => ({
          id: msg.id,
          role: msg.is_ai ? 'assistant' : 'user',
          content: msg.content,
          time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })));
      }
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel('chat_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        const newMsg = payload.new;
        // Avoid potentially duplicating if we insert it locally optimized, but here we just listen
        // We'll insert locally for immediate feedback then dedupe or just rely on fetch? 
        // Simplest: just append if ID not exists.
        setMessages((prev) => {
          if (prev.find(m => m.id === newMsg.id)) return prev;
          return [...prev, {
            id: newMsg.id,
            role: newMsg.is_ai ? 'assistant' : 'user',
            content: newMsg.content,
            time: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }];
        });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const handleSend = async () => {
    if (!inputText.trim() || !user) return;

    const text = inputText;
    setInputText('');

    // Optimistic User UI update?
    // Let's just wait for DB confirm for simplicity or basic optimistic

    const { error } = await supabase.from('chat_messages').insert({
      user_id: user.id,
      content: text,
      is_ai: false
    });

    if (error) {
      console.error('Error sending message:', error);
      // specific error handling
    } else {
      // Mock AI response for demo if no backend logic exists to trigger it
      setTimeout(async () => {
        // Check if we need to auto-reply (in a real app, a backend function would do this)
        // For this demo, we can just insert a mock AI reply after a delay
        await supabase.from('chat_messages').insert({
          user_id: user.id,
          content: "I received your message: " + text + ". Currently I am a simple demo bot.",
          is_ai: true
        });
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
            今天 ✨ {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Messages */}
        {loading ? (
          <div className="text-center text-slate-400 text-sm">Loading chat history...</div>
        ) : (
          messages.map((msg) => (
            msg.role === 'user' ? (
              <div key={msg.id} className="flex justify-end">
                <div className="flex flex-col items-end gap-1.5 max-w-[85%]">
                  <div className="bg-white border border-orange-100 px-6 py-4 rounded-[1.8rem] rounded-tr-md text-[15px] leading-relaxed text-slate-700 shadow-sm">
                    {msg.content}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-100 ml-3 mt-auto border-2 border-white shadow-md flex items-center justify-center overflow-hidden shrink-0">
                  <span className="material-symbols-outlined text-slate-400">person</span>
                </div>
              </div>
            ) : (
              <div key={msg.id} className="flex flex-col gap-2">
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
                      <div className="text-[15px] leading-relaxed text-slate-700 font-medium">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          ))
        )}
        <div ref={messagesEndRef} />

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
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button
              onClick={handleSend}
              className="bg-gradient-to-br from-orange-400 to-pink-500 text-white p-3 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[22px] ml-0.5 icon-filled">send</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Assistant;