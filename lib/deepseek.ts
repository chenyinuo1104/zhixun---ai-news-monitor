/**
 * DeepSeek API 服务模块
 * 提供与DeepSeek AI模型的交互功能
 */

const DEEPSEEK_API_KEY = (import.meta as any).env?.VITE_DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface DeepSeekResponse {
    choices: Array<{
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

/**
 * 调用DeepSeek API生成回复
 * @param messages 消息历史
 * @param newsContext 新闻上下文（可选）
 * @param signal AbortSignal用于取消请求（可选）
 * @returns AI回复内容
 */
export async function callDeepSeek(
    messages: Message[],
    newsContext?: string,
    signal?: AbortSignal
): Promise<string> {
    if (!DEEPSEEK_API_KEY) {
        throw new Error('DeepSeek API密钥未配置');
    }

    // 构建系统提示词
    const systemPrompt = newsContext
        ? `你是一个专业的AI舆情分析助手，负责帮助用户分析和理解新闻资讯。

你的主要能力包括：
1. 分析新闻趋势和舆情动向
2. 解读新闻背后的深层含义
3. 提供客观、专业的观点
4. 回答用户关于新闻的问题

当前新闻数据库中的最新资讯：
${newsContext}

请基于以上新闻数据，为用户提供准确、有用的分析和回答。回答要简洁明了，重点突出。`
        : `你是一个专业的AI舆情分析助手。你能够分析新闻趋势、解读舆情动向，并为用户提供客观专业的观点。请用简洁明了的方式回答用户问题。`;

    // 准备请求消息
    const requestMessages: Message[] = [
        { role: 'system', content: systemPrompt },
        ...messages
    ];

    try {
        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: requestMessages,
                temperature: 0.7,
                max_tokens: 2000,
                top_p: 0.95,
                frequency_penalty: 0.0,
                presence_penalty: 0.0
            }),
            signal // 添加signal以支持终止请求
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                `DeepSeek API请求失败: ${response.status} ${response.statusText}${errorData.error ? ` - ${JSON.stringify(errorData.error)}` : ''
                }`
            );
        }

        const data: DeepSeekResponse = await response.json();

        if (!data.choices || data.choices.length === 0) {
            throw new Error('DeepSeek API返回数据格式错误');
        }

        return data.choices[0].message.content;
    } catch (error) {
        console.error('DeepSeek API调用错误:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('调用DeepSeek API时发生未知错误');
    }
}

/**
 * 获取新闻上下文
 * 从Supabase获取最新新闻作为AI助手的上下文
 */
export async function getNewsContext(supabase: any, limit: number = 10): Promise<string> {
    try {
        const { data: news, error } = await supabase
            .from('news')
            .select('title, summary, sentiment, category, created_at')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('获取新闻上下文失败:', error);
            return '';
        }

        if (!news || news.length === 0) {
            return '暂无最新新闻数据';
        }

        // 格式化新闻数据
        const formattedNews = news.map((item: any, index: number) => {
            const date = new Date(item.created_at).toLocaleDateString('zh-CN');
            const sentiment = item.sentiment === 'positive' ? '积极' :
                item.sentiment === 'negative' ? '负面' : '中性';
            return `${index + 1}. [${date}] ${item.title}
   分类: ${item.category || '未分类'} | 情感: ${sentiment}
   摘要: ${item.summary || '无'}`;
        }).join('\n\n');

        return formattedNews;
    } catch (error) {
        console.error('获取新闻上下文时出错:', error);
        return '';
    }
}
