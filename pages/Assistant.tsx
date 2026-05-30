import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChatMessage } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const Assistant: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAIResponding, setIsAIResponding] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialMessageSent = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else if (data) {
        setMessages(
          data.map((msg: any) => ({
            id: msg.id,
            role: msg.is_ai ? 'assistant' : 'user',
            content: msg.content,
            time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }))
        );
      }
      setLoading(false);
    };

    fetchMessages();

    const subscription = supabase
      .channel('chat_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        const newMsg = payload.new;
        setMessages((prev) => {
          if (prev.find((m) => m.id === newMsg.id)) return prev;
          return [
            ...prev,
            {
              id: newMsg.id,
              role: newMsg.is_ai ? 'assistant' : 'user',
              content: newMsg.content,
              time: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ];
        });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    const state = location.state as { initialMessage?: string } | null;

    if (state?.initialMessage && !initialMessageSent.current && !loading) {
      initialMessageSent.current = true;
      setInputText(state.initialMessage);
      window.setTimeout(() => {
        handleSendMessage(state.initialMessage);
      }, 300);
    }
  }, [location, loading]);

  const handleSendMessage = async (message?: string) => {
    const textToSend = message || inputText;
    if (!textToSend.trim() || isAIResponding) return;

    setInputText('');

    const userMessage: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const thinkingMessage: ChatMessage = {
      id: 'temp-thinking',
      role: 'assistant',
      content: '正在思考...',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage, thinkingMessage]);
    setIsAIResponding(true);

    if (!user) {
      try {
        abortControllerRef.current = new AbortController();
        const { callDeepSeek, getNewsContext } = await import('../lib/deepseek');
        const newsContext = await getNewsContext(supabase, 10);
        const aiResponse = await callDeepSeek(
          [{ role: 'user', content: textToSend }],
          newsContext,
          abortControllerRef.current.signal
        );
        setMessages((prev) =>
          prev.filter((m) => m.id !== thinkingMessage.id).concat({
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: aiResponse,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          })
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'AI 回复失败';
        setMessages((prev) =>
          prev.filter((m) => m.id !== thinkingMessage.id).concat({
            id: `ai-error-${Date.now()}`,
            role: 'assistant',
            content: message.includes('API密钥') ? `${message}。请在 .env 中配置 VITE_DEEPSEEK_API_KEY。` : message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          })
        );
      } finally {
        setIsAIResponding(false);
      }
      return;
    }

    const { error } = await supabase.from('chat_messages').insert({
      user_id: user.id,
      content: textToSend,
      is_ai: false,
    });

    if (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id && m.id !== thinkingMessage.id));
      setIsAIResponding(false);
      return;
    }

    try {
      abortControllerRef.current = new AbortController();
      const { callDeepSeek, getNewsContext } = await import('../lib/deepseek');
      const newsContext = await getNewsContext(supabase, 10);
      const { data: recentMessages } = await supabase
        .from('chat_messages')
        .select('content, is_ai')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      const chatHistory = (recentMessages || [])
        .reverse()
        .map((msg: any) => ({
          role: msg.is_ai ? 'assistant' as const : 'user' as const,
          content: msg.content,
        }));

      const aiResponse = await callDeepSeek(chatHistory, newsContext, abortControllerRef.current.signal);

      await supabase.from('chat_messages').insert({
        user_id: user.id,
        content: aiResponse,
        is_ai: true,
      });

      setMessages((prev) => prev.filter((m) => m.id !== thinkingMessage.id));
    } catch (error) {
      console.error('AI response error:', error);
      setMessages((prev) =>
        prev.filter((m) => m.id !== thinkingMessage.id).concat({
          id: `ai-error-${Date.now()}`,
          role: 'assistant',
          content: error instanceof Error ? error.message : 'AI 回复失败',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
      );
    } finally {
      setIsAIResponding(false);
    }
  };

  const handleStopGeneration = () => {
    abortControllerRef.current?.abort();
    setIsAIResponding(false);
    setMessages((prev) => prev.filter((m) => m.id !== 'temp-thinking'));
  };

  return (
    <div className="min-h-screen bg-[#FFF8F3] flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-20%] w-[400px] h-[400px] bg-orange-100/50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[20%] left-[-10%] w-[300px] h-[300px] bg-pink-100/50 rounded-full blur-3xl"></div>
      </div>

      <header className="relative z-20 px-5 py-4 flex items-center justify-between bg-white/70 backdrop-blur-xl border-b border-white/50 sticky top-0">
        <button className="p-2 -ml-2 text-slate-500 hover:bg-orange-50 rounded-full transition-colors">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-500 icon-filled">bubble_chart</span>
            AI 舆情助手
          </h1>
        </div>
        <button className="p-2 -mr-2 text-slate-500 hover:bg-orange-50 rounded-full transition-colors">
          <span className="material-symbols-outlined">history</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-5 pb-48 relative z-10 space-y-8">
        <div className="flex justify-center py-2">
          <span className="text-[10px] font-bold text-slate-400 bg-white/60 px-4 py-1.5 rounded-full shadow-sm backdrop-blur border border-white/50">
            今天 {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {loading ? (
          <div className="text-center text-slate-400 text-sm">Loading chat history...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-slate-400 text-sm py-12">
            基于数据库中的最新新闻提问，例如热点趋势或情感分析
          </div>
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
                    <div className="bg-white/80 backdrop-blur-md border border-white px-6 py-5 rounded-[1.8rem] rounded-tl-md text-[15px] leading-relaxed text-slate-700 shadow-sm whitespace-pre-wrap">
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold mt-1.5 ml-2">{msg.time}</span>
                  </div>
                </div>
              </div>
            )
          ))
        )}
        <div ref={messagesEndRef} />
      </main>

      <div className="absolute bottom-28 left-0 right-0 z-30 px-5">
        <div className="bg-white/90 backdrop-blur-xl border border-white rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-2 flex items-end gap-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="问问 AI 现在的舆情趋势..."
            rows={1}
            className="flex-1 bg-transparent border-none resize-none px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:ring-0 max-h-32"
          />
          {isAIResponding ? (
            <button
              onClick={handleStopGeneration}
              className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center shrink-0"
            >
              <span className="material-symbols-outlined text-slate-600">stop</span>
            </button>
          ) : (
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 flex items-center justify-center shrink-0 disabled:opacity-40 shadow-lg"
            >
              <span className="material-symbols-outlined text-white icon-filled">send</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Assistant;
