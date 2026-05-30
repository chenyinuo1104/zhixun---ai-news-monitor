/**
 * 前端情感分析模块
 * 使用关键词匹配进行中文情感分析
 */

interface SentimentResult {
    sentiment: 'positive' | 'negative' | 'neutral';
    score: number;
    isHighRisk: boolean;
    confidence: number;
}

class SentimentAnalyzer {
    private positiveKeywords: string[] = [
        '突破', '创新', '成功', '增长', '上涨', '利好', '推出', '发布',
        '领先', '优秀', '卓越', '提升', '改善', '支持', '赞', '获奖',
        '合作', '共赢', '发展', '繁荣', '进步', '升级', '优化', '机遇',
        '强劲', '稳定', '健康', '盈利', '收益', '良好', '顺利', '完成',
        '超越', '夺冠', '第一', '冠军', '赢得', '表彰', '喜讯', '胜利',
        '积极', '正面', '有利', '复苏', '回暖', '新高', '增加', '提高',
        '上升', '完善', '增强', '加强', '深化', '拓展', '延伸', '推广',
        '普及', '圆满', '完美', '出色', '精彩', '杰出', '非凡', '显著',
        '突出', '明显', '明确', '清晰', '安全', '稳定'
    ];

    private negativeKeywords: string[] = [
        '死亡', '去世', '逝世', '身亡', '伤亡', '死伤', '遇难', '遇害',
        '被害', '爆炸', '起火', '火灾', '灾难', '事故', '意外', '危机',
        '崩盘', '破产', '倒闭', '暴跌', '亏损', '制裁', '垄断', '被捕',
        '违法', '泄露', '漏洞', '攻击', '威胁', '污染', '丑闻', '绯闻',
        '负面', '消极', '涉嫌', '调查', '审查', '逮捕', '抓捕', '拘留',
        '拘禁', '判刑', '入狱', '坐牢', '处罚', '惩罚', '罚款', '查封',
        '冻结', '关停', '关闭', '停业', '停产', '整顿', '整改', '下跌',
        '下降', '回落', '收缩', '放缓', '停滞', '衰退', '萧条', '低迷',
        '疲软', '弱势', '受挫', '受阻', '遇阻', '困难', '问题', '麻烦',
        '困扰', '烦恼', '忧虑', '担心', '害怕', '恐惧', '危险', '风险',
        '隐患', '险情', '紧急', '严重', '恶劣', '糟糕', '差劲', '失败',
        '失利', '落败', '战败', '崩溃', '瓦解', '分裂', '决裂', '警告',
        '裁员', '震荡', '质疑', '批评', '指责', '谴责', '抗议', '冲突',
        '矛盾', '争议', '损失', '恶化', '担忧', '焦虑', '困境', '下滑',
        '减少', '萎缩', '延迟', '推迟', '打击', '打压', '压制', '抑制',
        '遏制', '控制', '限制', '约束', '制约', '阻碍', '妨碍', '干扰',
        '影响', '波及', '牵连', '涉及', '关联', '牵扯', '连累', '拖累',
        '陷入', '卷入', '牵涉', '诉讼', '欺诈', '诈骗', '造假', '腐败',
        '贪污', '受贿', '行贿', '渎职', '失职', '失误', '错误',
        // 新增负面关键词
        '风波', '丑闻', '虚假', '误导', '欺骗', '隐瞒', '违约', '纠纷',
        '冲突', '争议', '抗议', '罢工', '停摆', '瘫痪', '中断', '暂停',
        '终止', '取消', '撤回', '拒绝', '驳回', '败诉', '赔偿', '索赔',
        '亏损', '负债', '坏账', '债务', '拖欠', '赖账', '跑路', '失联',
        '查封', '扣押', '冻结', '没收', '销毁', '召回', '下架', '禁售',
        '警告', '警示', '风险', '隐患', '漏洞', '缺陷', '故障', '事故',
        '伤亡', '死亡', '受伤', '中毒', '感染', '污染', '辐射', '泄漏',
        '爆炸', '火灾', '洪水', '地震', '台风', '暴雨', '暴雪', '冰雹',
        '滑坡', '泥石流', '崩塌', '坍塌', '倾覆', '沉没', '坠毁', '失事',
        '爆炸', '枪击', '袭击', '恐怖', '暴乱', '冲突', '战争', '对峙',
        '抗议', '示威', '游行', '集会', '冲突', '暴力', '冲突', '流血',
        '动荡', '混乱', '恐慌', '危机', '紧急', '严重', '重大', '特大',
        '恶劣', '严峻', '危急', '紧迫', '紧急', '危险', '威胁', '风险'
    ];

    private highRiskKeywords: string[] = [
        '严重', '紧急', '危机', '事故', '灾难', '伤亡', '泄露', '漏洞',
        '攻击', '破产', '倒闭', '调查', '被捕', '违法', '制裁', '警告',
        '风险', '威胁', '暴跌', '崩盘', '恶化', '冲突', '抗议', '争议',
        '处罚', '罚款', '质疑', '指责', '谴责', '污染', '死亡', '爆炸',
        '火灾', '丑闻', '诉讼', '欺诈', '腐败', '贪污', '受贿'
    ];

    private intensifiers: string[] = ['非常', '十分', '极其', '特别', '相当', '极度', '严重', '重大', '巨大'];
    private negations: string[] = ['不', '没', '无', '非', '未', '别', '莫', '勿', '毋', '没有', '不会', '不能'];

    analyze(text: string): SentimentResult {
        if (!text) {
            return {
                sentiment: 'neutral',
                score: 0.0,
                isHighRisk: false,
                confidence: 0.0
            };
        }

        const lowerText = text.toLowerCase();
        let positiveScore = 0;
        let negativeScore = 0;
        const matchedPositive = new Set<string>();
        const matchedNegative = new Set<string>();

        // 检测积极关键词
        for (const keyword of this.positiveKeywords) {
            const keywordLower = keyword.toLowerCase();
            if (lowerText.includes(keywordLower) && !matchedPositive.has(keywordLower)) {
                let weight = 1.0;
                const keywordPos = lowerText.indexOf(keywordLower);
                
                // 检查强化词
                for (const intensifier of this.intensifiers) {
                    if (keywordPos > 0 && lowerText.substring(Math.max(0, keywordPos - 15), keywordPos).includes(intensifier)) {
                        weight = 2.0;
                        break;
                    }
                }

                // 检查否定词
                let hasNegation = false;
                for (const negation of this.negations) {
                    if (keywordPos > 0 && lowerText.substring(Math.max(0, keywordPos - 8), keywordPos).includes(negation)) {
                        hasNegation = true;
                        break;
                    }
                }

                if (hasNegation) {
                    negativeScore += weight;
                } else {
                    positiveScore += weight;
                }
                matchedPositive.add(keywordLower);
            }
        }

        // 检测消极关键词
        for (const keyword of this.negativeKeywords) {
            const keywordLower = keyword.toLowerCase();
            if (lowerText.includes(keywordLower) && !matchedNegative.has(keywordLower)) {
                let weight = 1.0;
                const keywordPos = lowerText.indexOf(keywordLower);
                
                // 检查强化词
                for (const intensifier of this.intensifiers) {
                    if (keywordPos > 0 && lowerText.substring(Math.max(0, keywordPos - 15), keywordPos).includes(intensifier)) {
                        weight = 2.0;
                        break;
                    }
                }

                // 检查否定词
                let hasNegation = false;
                for (const negation of this.negations) {
                    if (keywordPos > 0 && lowerText.substring(Math.max(0, keywordPos - 8), keywordPos).includes(negation)) {
                        hasNegation = true;
                        break;
                    }
                }

                if (hasNegation) {
                    positiveScore += weight;
                } else {
                    negativeScore += weight;
                }
                matchedNegative.add(keywordLower);
            }
        }

        // 计算分数
        const totalMatches = matchedPositive.size + matchedNegative.size;
        let sentimentScore = 0.0;
        let confidence = 0.0;

        if (totalMatches > 0) {
            sentimentScore = (positiveScore - negativeScore);
            const maxPossible = Math.max(positiveScore + negativeScore, 1.0);
            sentimentScore = sentimentScore / maxPossible;
            sentimentScore = Math.max(-1.0, Math.min(1.0, sentimentScore));
            confidence = Math.min(totalMatches / 3.0, 1.0);
        }

        // 判断情感
        let sentiment: 'positive' | 'negative' | 'neutral';
        if (sentimentScore > 0.1) {
            sentiment = 'positive';
        } else if (sentimentScore < -0.1) {
            sentiment = 'negative';
        } else {
            sentiment = 'neutral';
        }

        // 检测高风险
        const isHighRisk = this.highRiskKeywords.some(kw => lowerText.includes(kw.toLowerCase()));

        return {
            sentiment,
            score: Math.round(sentimentScore * 100) / 100,
            isHighRisk,
            confidence: Math.round(confidence * 100) / 100
        };
    }
}

export const sentimentAnalyzer = new SentimentAnalyzer();

export function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    return sentimentAnalyzer.analyze(text).sentiment;
}

export function analyzeNews(title: string, content: string = ''): SentimentResult {
    const text = title + ' ' + content;
    return sentimentAnalyzer.analyze(text);
}
