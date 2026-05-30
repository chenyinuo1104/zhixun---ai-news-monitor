import { supabase } from './supabase';

export interface SupabaseHealth {
  ok: boolean;
  newsCount?: number;
  error?: string;
}

export async function checkSupabaseHealth(): Promise<SupabaseHealth> {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return { ok: false, error: '未配置 VITE_SUPABASE_URL 或 VITE_SUPABASE_ANON_KEY' };
  }

  if (!url.includes('supabase.co')) {
    return { ok: false, error: 'Supabase URL 格式不正确' };
  }

  try {
    const { count, error } = await supabase
      .from('news')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, newsCount: count ?? 0 };
  } catch (err) {
    const message = err instanceof Error ? err.message : '连接失败';
    if (message.includes('Failed to fetch') || message.includes('fetch')) {
      return {
        ok: false,
        error: '无法连接数据库，请检查 Supabase 项目是否仍存在，以及 .env 中的 URL 和 Key 是否正确',
      };
    }
    return { ok: false, error: message };
  }
}
