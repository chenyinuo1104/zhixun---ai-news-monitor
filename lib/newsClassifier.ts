/**
 * 前端新闻分类模块
 * 根据新闻标题和内容智能分类，不确定时返回 undefined
 */

class NewsClassifier {
    private techKeywords: string[] = [
        'AI', '人工智能', 'GPT', '大模型', '算法', '机器学习', '深度学习',
        '科技', '芯片', '半导体', '集成电路', 'CPU', 'GPU', '处理器',
        '手机', '智能手机', '苹果', 'iPhone', '安卓', 'Android',
        '电脑', '计算机', '笔记本', '平板', 'iPad',
        '互联网', 'APP', '应用', '软件', '程序', '代码', '编程',
        '5G', '6G', '通信', '网络', '云计算', '大数据',
        '区块链', '加密货币', '比特币', '以太坊',
        'VR', 'AR', '元宇宙', '虚拟现实', '增强现实',
        '自动驾驶', '电动车', '新能源汽车', '特斯拉',
        '太空', '航天', '卫星', '火箭', 'NASA',
        '生物科技', '基因', '医疗科技', '医疗器械',
        '36氪', '钛媒体', '爱范儿', 'cnbeta', '科技新闻',
        // AI公司
        'DeepSeek', 'OpenAI', 'Google', 'Meta', '微软', 'Apple', '华为',
        '字节', '腾讯', '阿里', '百度', '小米', '京东', '美团',
        '电池', '电池厂', '新能源', '光伏', '储能', '芯片厂',
        '限制', 'API', '生成', '模型', '参数', '算力', '服务器'
    ];

    private financeKeywords: string[] = [
        '股市', '股票', 'A股', '港股', '美股', '上市', 'IPO',
        '金融', '银行', '证券', '基金', '投资', '理财',
        '经济', 'GDP', '通胀', 'CPI', '货币政策', '央行',
        '企业', '公司', '财报', '营收', '利润', '亏损',
        '创业', '融资', 'VC', 'PE', '天使轮',
        '并购', '收购', '重组', '破产', '倒闭',
        '房地产', '房价', '楼市',
        '汇率', '外汇', '美元', '人民币',
        '税务', '税收', '财政',
        '贸易', '关税', '出口', '进口',
        '外卖', '订单', '骑手', '补贴', '价格战',
        // 法律诉讼相关
        '诉讼', '起诉', '控告', '索赔', '赔偿', '罚款', '处罚',
        '和解', '了结', '支付', '金额', '美元', '万元', '亿元',
        // 商业相关
        '支付', '交易', '收购', '合并', '合作', '协议', '合同'
    ];

    private policyKeywords: string[] = [
        // 核心政策相关词汇
        '政策', '法规', '法律', '监管', '规定', '办法', '条例',
        '政府', '国务院', '部委', '发改委', '工信部', '商务部',
        '通知', '公告', '发布', '出台', '实施', '执行',
        '政治', '选举', '领导人', '会议', '两会',
        '外交', '国际', '中美', '中欧', '中日',
        '国家安全', '网络安全', '数据安全',
        '碳中和', '碳达峰', '减排', '环保政策'
    ];

    private cultureKeywords: string[] = [
        '文化', '艺术', '文学', '电影', '音乐', '戏剧', '展览',
        '历史', '考古', '文物', '博物馆',
        '旅游', '旅行', '景点', '景区',
        '体育', '运动', '奥运', '世界杯', '足球', '篮球',
        '娱乐', '明星', '八卦', '综艺', '电视剧', '电影',
        '生活', '健康', '养生', '美食', '时尚',
        '教育', '大学', '学校', '高考', '留学',
        '社会', '民生', '公益', '慈善',
        '去世', '逝世', '享年', '演员', '著名'
    ];

    classify(title: string, content: string = ''): 'tech' | 'finance' | 'policy' | 'culture' | undefined {
        if (!title) {
            return undefined;
        }

        const text = (title + ' ' + content).toLowerCase();

        // 统计各类关键词匹配数量
        const techCount = this.techKeywords.filter(kw => text.includes(kw.toLowerCase())).length;
        const financeCount = this.financeKeywords.filter(kw => text.includes(kw.toLowerCase())).length;
        const policyCount = this.policyKeywords.filter(kw => text.includes(kw.toLowerCase())).length;
        const cultureCount = this.cultureKeywords.filter(kw => text.includes(kw.toLowerCase())).length;

        // 设置最低匹配阈值
        // 政策类需要更高的阈值以避免误分类
        const techThreshold = 1;
        const financeThreshold = 1;
        const policyThreshold = 2; // 政策类需要至少2个关键词匹配
        const cultureThreshold = 1;

        // 只有超过阈值的分类才能成为候选
        const candidates: Array<{ category: 'tech' | 'finance' | 'policy' | 'culture'; count: number }> = [];
        if (techCount >= techThreshold) candidates.push({ category: 'tech', count: techCount });
        if (financeCount >= financeThreshold) candidates.push({ category: 'finance', count: financeCount });
        if (policyCount >= policyThreshold) candidates.push({ category: 'policy', count: policyCount });
        if (cultureCount >= cultureThreshold) candidates.push({ category: 'culture', count: cultureCount });

        // 如果没有候选分类，返回 undefined
        if (candidates.length === 0) {
            return undefined;
        }

        // 找到最大匹配数
        const maxCount = Math.max(...candidates.map(c => c.count));

        // 找到所有有最大匹配数的分类
        const topCandidates = candidates.filter(c => c.count === maxCount);

        // 如果有多个分类匹配数相同，返回 undefined（不确定）
        if (topCandidates.length > 1) {
            return undefined;
        }

        return topCandidates[0].category;
    }
}

export const newsClassifier = new NewsClassifier();

export function classifyNews(title: string, content: string = ''): 'tech' | 'finance' | 'policy' | 'culture' | undefined {
    return newsClassifier.classify(title, content);
}
