import { NewsItem, TrendItem } from '../types';

export const DEMO_AUTH_STORAGE_KEY = 'zhixun-demo-auth';

export const demoProfile = {
  full_name: 'Demo User',
  position: 'AI News Analyst',
  department: 'Demo Lab',
  avatar_url: 'https://picsum.photos/200/200?random=demo-user',
};

export interface DemoNewsRecord extends NewsItem {
  createdAt: string;
}

type SentimentKind = 'positive' | 'negative' | 'neutral';

interface SentimentAnalysisResult {
  sentiment: SentimentKind;
  score: number;
  confidence: number;
  isHighRisk: boolean;
  positiveHits: string[];
  negativeHits: string[];
  riskHits: string[];
}

const positiveKeywords = [
  '发布', '突破', '提升', '增长', '回暖', '利好', '扶持', '成功', '改善', '优化',
  '升级', '合作', '提效', '创新', '走强', '增加', '推进', '上线', '发展', '看好',
];

const negativeKeywords = [
  '泄露', '风险', '下调', '承压', '争议', '调查', '下滑', '危机', '故障', '违规',
  '裁员', '暴跌', '受损', '波动', '担忧', '处罚', '攻击', '异常', '负面', '冲击',
];

const highRiskKeywords = [
  '泄露', '高风险', '风险', '安全', '漏洞', '攻击', '违规', '处罚', '危机', '调查',
  '事故', '威胁', '冲突', '中断',
];

export const demoNews: DemoNewsRecord[] = [
  {
    id: 'demo-news-1',
    source: '36Kr',
    time: '5分钟前',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    title: 'OpenAI 发布新一代智能体开发能力，企业接入速度提升',
    tags: ['AI', 'OpenAI', '智能体'],
    sentiment: 'positive',
    imageUrl: 'https://picsum.photos/400/300?random=201',
    category: 'tech',
    isHighRisk: false,
    summary: '多家开发团队开始将新能力接入业务流程，关注点集中在成本与稳定性。',
    content: '这是一条用于前端体验模式的演示新闻。当前站点会在无法连接 Supabase 时回退到本地演示数据，方便继续调试页面、路由和交互。',
    link: 'https://example.com/demo/1',
  },
  {
    id: 'demo-news-2',
    source: '财联社',
    time: '18分钟前',
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    title: '算力基础设施投资升温，多地发布 AI 产业扶持计划',
    tags: ['算力', '政策', '产业'],
    sentiment: 'positive',
    imageUrl: 'https://picsum.photos/400/300?random=202',
    category: 'policy',
    isHighRisk: false,
    summary: '地方政策密集出台，产业链公司获得更多关注。',
    content: '演示数据模拟了政策与产业利好情境，可用于检查情感标签、分类筛选和详情页跳转。',
    link: 'https://example.com/demo/2',
  },
  {
    id: 'demo-news-3',
    source: '界面新闻',
    time: '35分钟前',
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    title: '某平台疑似出现数据泄露风险，相关部门已介入调查',
    tags: ['安全', '平台', '风险'],
    sentiment: 'negative',
    imageUrl: 'https://picsum.photos/400/300?random=203',
    category: 'tech',
    isHighRisk: true,
    summary: '平台回应称正在排查，用户侧开始担忧账号和隐私安全。',
    content: '这条演示新闻用于检查高风险标签、负面情感状态和过滤器表现。',
    link: 'https://example.com/demo/3',
  },
  {
    id: 'demo-news-4',
    source: '证券时报',
    time: '1小时前',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    title: 'A 股 AI 应用板块震荡走强，市场情绪明显回暖',
    tags: ['A股', '市场', 'AI应用'],
    sentiment: 'positive',
    imageUrl: 'https://picsum.photos/400/300?random=204',
    category: 'finance',
    isHighRisk: false,
    summary: '投资者关注应用层商业化进展，相关公司成交活跃。',
    content: '这条数据适合用于调试财经分类与看板中的情感分布。',
    link: 'https://example.com/demo/4',
  },
  {
    id: 'demo-news-5',
    source: '澎湃新闻',
    time: '2小时前',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    title: '博物馆上线 AI 导览服务，传统文化展陈方式继续数字化',
    tags: ['文化', '博物馆', 'AI导览'],
    sentiment: 'positive',
    imageUrl: 'https://picsum.photos/400/300?random=205',
    category: 'culture',
    isHighRisk: false,
    summary: '文化场馆数字化改造成为近期热点话题。',
    content: '这条演示新闻用于验证人文分类和多标签展示。',
    link: 'https://example.com/demo/5',
  },
  {
    id: 'demo-news-6',
    source: '新浪财经',
    time: '4小时前',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    title: '芯片企业下调本季营收指引，供应链承压',
    tags: ['芯片', '供应链', '财报'],
    sentiment: 'negative',
    imageUrl: 'https://picsum.photos/400/300?random=206',
    category: 'finance',
    isHighRisk: false,
    summary: '市场担忧需求恢复节奏慢于预期。',
    content: '这条演示数据用于构造正负面混合分布。',
    link: 'https://example.com/demo/6',
  },
  {
    id: 'demo-news-7',
    source: '新华社',
    time: '8小时前',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    title: '新规强调生成式 AI 服务合规要求，平台治理进一步细化',
    tags: ['合规', '生成式AI', '治理'],
    sentiment: 'neutral',
    imageUrl: 'https://picsum.photos/400/300?random=207',
    category: 'policy',
    isHighRisk: false,
    summary: '监管细则逐步明确，企业开始调整内部流程。',
    content: '这条演示新闻适合验证中性情感、政策分类和助手摘要上下文。',
    link: 'https://example.com/demo/7',
  },
  {
    id: 'demo-news-8',
    source: 'InfoQ',
    time: '12小时前',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    title: '企业开始大规模试点多智能体流程编排，运维成本下降',
    tags: ['工程化', '智能体', '企业服务'],
    sentiment: 'positive',
    imageUrl: 'https://picsum.photos/400/300?random=208',
    category: 'tech',
    isHighRisk: false,
    summary: '越来越多团队把智能体能力放进客服和运营场景。',
    content: '这条演示新闻可帮助调试热门标签统计。',
    link: 'https://example.com/demo/8',
  },
  {
    id: 'demo-news-9',
    source: '第一财经',
    time: '1天前',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    title: '跨境电商平台借助 AI 客服提效，但售后争议仍在增加',
    tags: ['跨境电商', '客服', '争议'],
    sentiment: 'neutral',
    imageUrl: 'https://picsum.photos/400/300?random=209',
    category: 'finance',
    isHighRisk: false,
    summary: '效率改善与用户体验波动并存，市场观点分化。',
    content: '这条演示新闻跨越 24 小时边界，适合观察统计页时间范围切换。',
    link: 'https://example.com/demo/9',
  },
  {
    id: 'demo-news-10',
    source: '中国青年报',
    time: '2天前',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    title: '高校开设 AI 与媒介素养课程，学生关注技术伦理问题',
    tags: ['教育', '伦理', 'AI'],
    sentiment: 'positive',
    imageUrl: 'https://picsum.photos/400/300?random=210',
    category: 'culture',
    isHighRisk: false,
    summary: '校园场景中围绕 AI 的讨论持续升温。',
    content: '这条演示数据用于补充人文与教育类内容。',
    link: 'https://example.com/demo/10',
  },
];

const dedupe = (items: string[]) => [...new Set(items)];

const analyzeSentimentText = (text: string): SentimentAnalysisResult => {
  const normalized = text.trim().toLowerCase();
  const positiveHits = dedupe(positiveKeywords.filter((keyword) => normalized.includes(keyword)));
  const negativeHits = dedupe(negativeKeywords.filter((keyword) => normalized.includes(keyword)));
  const riskHits = dedupe(highRiskKeywords.filter((keyword) => normalized.includes(keyword)));

  const positiveScore = positiveHits.length;
  const negativeScore = negativeHits.length;
  const total = positiveScore + negativeScore;

  let sentiment: SentimentKind = 'neutral';
  let rawScore = 0;

  if (positiveScore > negativeScore) {
    sentiment = 'positive';
    rawScore = positiveScore - negativeScore;
  } else if (negativeScore > positiveScore) {
    sentiment = 'negative';
    rawScore = positiveScore - negativeScore;
  }

  const scoreBase = total === 0 ? 0 : rawScore / Math.max(total, 3);
  const score = Math.max(-1, Math.min(1, Number(scoreBase.toFixed(2))));
  const confidence = total === 0 ? 0.2 : Math.min(0.95, Number((0.45 + total * 0.12).toFixed(2)));

  return {
    sentiment,
    score,
    confidence,
    isHighRisk: riskHits.length > 0,
    positiveHits,
    negativeHits,
    riskHits,
  };
};

const formatSentimentLabel = (sentiment: SentimentKind) => {
  if (sentiment === 'positive') return '积极';
  if (sentiment === 'negative') return '负面';
  return '中性';
};

const formatReasonLine = (title: string, hits: string[]) => {
  if (hits.length === 0) return `${title}：未命中明显关键词`;
  return `${title}：${hits.join('、')}`;
};

const extractAnalysisTarget = (input: string): string => {
  const cleaned = input
    .replace(/[“”"'`]/g, '')
    .replace(/请|帮我|一下|麻烦|对于|针对|给我|帮忙/g, ' ')
    .replace(/做一下|做个|进行|做/g, ' ')
    .replace(/情感分析|情绪分析|情感倾向分析|舆情分析|判断一下情感|判断情绪|分析一下情感|分析情绪/g, ' ')
    .replace(/这条新闻|这个新闻|这段话|这句话|这则消息|下面这段/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned || input.trim();
};

const maybeAnalyzeInput = (input: string): string | null => {
  const lowered = input.toLowerCase();
  const needsSentiment =
    /情感|情绪|倾向|舆情|正面|负面|中性|sentiment/.test(input) ||
    /分析/.test(input);

  if (!needsSentiment) return null;

  const target = extractAnalysisTarget(input);
  if (!target || target.length < 4) {
    return '可以，直接把要分析的新闻标题、正文或评论发给我，我会返回情感类别、分数和判断依据。';
  }

  const matchedNews = demoNews.find((item) => target.includes(item.title) || item.title.includes(target));
  const textToAnalyze = matchedNews ? `${matchedNews.title} ${matchedNews.summary || ''}` : target;
  const result = analyzeSentimentText(textToAnalyze);
  const hitReasons = [
    ...result.positiveHits.map((hit) => `积极词“${hit}”`),
    ...result.negativeHits.map((hit) => `负面词“${hit}”`),
  ];

  const reasonText = hitReasons.length > 0 ? hitReasons.join('、') : '未命中明显情绪词，整体表述偏客观';
  const riskText = result.isHighRisk
    ? `高风险提示：是（命中 ${result.riskHits.join('、')}）`
    : '高风险提示：否';

  return [
    `情感分析结果：${formatSentimentLabel(result.sentiment)}`,
    `分数：${result.score}（置信度 ${result.confidence}）`,
    riskText,
    `判断依据：${reasonText}`,
    matchedNews ? `参考来源：已匹配到演示新闻《${matchedNews.title}》` : '参考来源：根据你输入的文本直接分析',
  ].join('\n');
};

export const getDemoTrendItems = (timeframe: '24h' | '7d' | '30d'): TrendItem[] => {
  const now = Date.now();
  const durationMs = timeframe === '24h'
    ? 24 * 60 * 60 * 1000
    : timeframe === '7d'
      ? 7 * 24 * 60 * 60 * 1000
      : 30 * 24 * 60 * 60 * 1000;

  const currentPeriodStart = now - durationMs;
  const previousPeriodStart = currentPeriodStart - durationMs;

  const currentItems = demoNews.filter((item) => new Date(item.createdAt).getTime() >= currentPeriodStart);
  const previousItems = demoNews.filter((item) => {
    const ts = new Date(item.createdAt).getTime();
    return ts >= previousPeriodStart && ts < currentPeriodStart;
  });

  const countTags = (items: DemoNewsRecord[]) => {
    const counts: Record<string, number> = {};
    items.forEach((item) => {
      item.tags.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  };

  const currentCounts = countTags(currentItems);
  const previousCounts = countTags(previousItems);
  const gradients = [
    'from-yellow-400 to-orange-500',
    'from-slate-300 to-slate-500',
    'from-orange-400 to-orange-600',
    'from-slate-200 to-slate-400',
    'from-blue-400 to-blue-600',
    'from-pink-400 to-pink-600',
    'from-emerald-400 to-emerald-600',
    'from-cyan-400 to-cyan-600',
    'from-indigo-400 to-indigo-600',
    'from-purple-400 to-purple-600',
  ];

  return Object.entries(currentCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((item, index) => {
      const previousCount = previousCounts[item.name] || 0;
      let growth = 0;

      if (previousCount === 0 && item.count > 0) {
        growth = 100;
      } else if (previousCount > 0) {
        growth = Math.round(((item.count - previousCount) / previousCount) * 100);
      }

      return {
        id: index + 1,
        rank: index + 1,
        name: item.name,
        volume: `${(item.count * 1000).toLocaleString()}`,
        growth,
        color: gradients[index % gradients.length],
      };
    });
};

export const getDemoAssistantReply = (input: string): string => {
  const directSentimentReply = maybeAnalyzeInput(input);
  if (directSentimentReply) return directSentimentReply;

  const normalized = input.toLowerCase();

  if (normalized.includes('风险') || normalized.includes('安全')) {
    const riskyItems = demoNews.filter((item) => item.isHighRisk || item.sentiment === 'negative').slice(0, 3);
    const lines = riskyItems.map((item, index) => `${index + 1}. ${item.title}`);
    return ['当前体验模式里值得重点关注的风险话题：', ...lines].join('\n');
  }

  if (normalized.includes('趋势') || normalized.includes('热点')) {
    return '近期热点主要集中在 AI、智能体、政策合规、市场情绪 这几个方向。你也可以直接发一条新闻给我，我会当场做情感分析。';
  }

  if (normalized.includes('情感分布')) {
    const sentimentSummary = ['positive', 'neutral', 'negative'].map((kind) => {
      const count = demoNews.filter((item) => item.sentiment === kind).length;
      return `${formatSentimentLabel(kind as SentimentKind)} ${count} 条`;
    });
    return `体验模式数据里的情感分布为：${sentimentSummary.join('，')}。`;
  }

  return [
    '你可以直接把新闻标题、正文或评论发给我。',
    '例如：OpenAI 发布新一代智能体开发能力，企业接入速度提升。对这条新闻进行情感分析',
    '我会返回情感类别、分数、判断依据和高风险提示。',
  ].join('\n');
};

export const getDemoSentimentPreview = () => {
  return demoNews.map((item) => {
    const result = analyzeSentimentText(`${item.title} ${item.summary || ''}`);
    return {
      title: item.title,
      sentiment: result.sentiment,
      score: result.score,
      reason: formatReasonLine('命中词', [...result.positiveHits, ...result.negativeHits]),
    };
  });
};
