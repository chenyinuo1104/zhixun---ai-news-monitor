"""
智能情感分析模块
使用中文情感分析识别新闻的情感倾向
"""
import re
from typing import Literal

SentimentType = Literal['positive', 'negative', 'neutral']

class SentimentAnalyzer:
    """情感分析器 - 基于关键词和规则的中文情感分析"""
    
    def __init__(self):
        # 积极情感关键词（按权重排序，更重要的在前）
        self.positive_keywords = [
            # 高权重
            '成功', '突破', '创新', '增长', '上涨', '利好', '领先', '优秀',
            '卓越', '提升', '改善', '获奖', '合作', '共赢', '发展', '繁荣',
            '进步', '升级', '优化', '机遇', '强劲', '稳定', '健康', '盈利',
            '收益', '顺利', '完成', '超越', '夺冠', '冠军', '赢得', '表彰',
            '喜讯', '胜利', '积极', '正面', '有利', '复苏', '回暖', '新高',
            '增加', '提高', '上升', '完善', '增强', '加强', '深化', '拓展',
            '延伸', '推广', '普及', '圆满', '完美', '出色', '精彩', '杰出',
            '非凡', '显著', '突出', '明显', '明确', '清晰', '安全', '稳定'
        ]
        
        # 消极情感关键词（按权重排序，更重要的在前）
        self.negative_keywords = [
            # 高权重 - 严重负面
            '死亡', '去世', '逝世', '身亡', '伤亡', '死伤', '遇难', '遇害',
            '被害', '爆炸', '爆炸', '起火', '火灾', '灾难', '事故', '意外',
            '危机', '崩盘', '破产', '倒闭', '暴跌', '亏损', '制裁', '垄断',
            '被捕', '违法', '泄露', '漏洞', '攻击', '威胁', '污染', '丑闻',
            '绯闻', '负面', '消极', '涉嫌', '调查', '审查', '逮捕', '抓捕',
            '拘留', '拘禁', '判刑', '入狱', '坐牢', '处罚', '惩罚', '罚款',
            '查封', '冻结', '关停', '关闭', '停业', '停产', '整顿', '整改',
            # 中权重 - 一般负面
            '下跌', '下降', '回落', '收缩', '放缓', '停滞', '衰退', '萧条',
            '低迷', '疲软', '弱势', '受挫', '受阻', '遇阻', '困难', '问题',
            '麻烦', '困扰', '烦恼', '忧虑', '担心', '害怕', '恐惧', '危险',
            '风险', '隐患', '险情', '紧急', '严重', '恶劣', '糟糕', '差劲',
            '失败', '失利', '落败', '战败', '崩溃', '瓦解', '分裂', '决裂',
            '警告', '裁员', '震荡', '质疑', '批评', '指责', '谴责', '抗议',
            '冲突', '矛盾', '争议', '损失', '恶化', '担忧', '焦虑', '困境',
            '下滑', '减少', '萎缩', '延迟', '推迟', '打击', '打压', '压制',
            '抑制', '遏制', '控制', '限制', '约束', '制约', '阻碍', '妨碍',
            '干扰', '影响', '波及', '牵连', '涉及', '关联', '牵扯', '连累',
            '拖累', '陷入', '卷入', '牵涉', '诉讼', '欺诈', '诈骗', '造假',
            '腐败', '贪污', '受贿', '行贿', '渎职', '失职', '失误', '错误'
        ]
        
        # 高风险关键词（用于标记is_high_risk）
        self.high_risk_keywords = [
            '严重', '紧急', '危机', '事故', '灾难', '伤亡', '泄露', '漏洞',
            '攻击', '破产', '倒闭', '调查', '被捕', '违法', '制裁', '警告',
            '风险', '威胁', '暴跌', '崩盘', '恶化', '冲突', '抗议', '争议',
            '处罚', '罚款', '质疑', '指责', '谴责', '污染', '死亡', '爆炸',
            '火灾', '丑闻', '诉讼', '欺诈', '腐败', '贪污', '受贿'
        ]
        
        # 情感强化词
        self.intensifiers = ['非常', '十分', '极其', '特别', '相当', '极度', '严重', '重大', '巨大']
        
        # 否定词
        self.negations = ['不', '没', '无', '非', '未', '别', '莫', '勿', '毋', '没有', '不会', '不能']
    
    def analyze(self, text: str) -> dict:
        """
        分析文本的情感倾向
        
        Args:
            text: 要分析的文本（标题+内容）
            
        Returns:
            {
                'sentiment': 'positive' | 'negative' | 'neutral',
                'score': float,  # -1.0 到 1.0
                'is_high_risk': bool,
                'confidence': float  # 0.0 到 1.0
            }
        """
        if not text:
            return {
                'sentiment': 'neutral',
                'score': 0.0,
                'is_high_risk': False,
                'confidence': 0.0
            }
        
        text = text.lower()
        
        # 计算情感分数
        positive_score = 0
        negative_score = 0
        matched_positive = set()
        matched_negative = set()
        
        # 检测积极关键词 - 去重
        for keyword in self.positive_keywords:
            if keyword in text and keyword not in matched_positive:
                weight = 1.0
                # 检查是否有强化词
                for intensifier in self.intensifiers:
                    keyword_pos = text.find(keyword)
                    if (intensifier in text and 
                        keyword_pos > 0 and 
                        intensifier in text[max(0, keyword_pos - 15):keyword_pos]):
                        weight = 2.0
                        break
                
                # 检查是否有否定词
                has_negation = False
                keyword_pos = text.find(keyword)
                for negation in self.negations:
                    if keyword_pos > 0 and negation in text[max(0, keyword_pos - 8):keyword_pos]:
                        has_negation = True
                        break
                
                if has_negation:
                    negative_score += weight
                else:
                    positive_score += weight
                
                matched_positive.add(keyword)
        
        # 检测消极关键词 - 去重
        for keyword in self.negative_keywords:
            if keyword in text and keyword not in matched_negative:
                weight = 1.0
                # 检查是否有强化词
                for intensifier in self.intensifiers:
                    keyword_pos = text.find(keyword)
                    if (intensifier in text and 
                        keyword_pos > 0 and 
                        intensifier in text[max(0, keyword_pos - 15):keyword_pos]):
                        weight = 2.0
                        break
                
                # 检查是否有否定词
                has_negation = False
                keyword_pos = text.find(keyword)
                for negation in self.negations:
                    if keyword_pos > 0 and negation in text[max(0, keyword_pos - 8):keyword_pos]:
                        has_negation = True
                        break
                
                if has_negation:
                    positive_score += weight
                else:
                    negative_score += weight
                
                matched_negative.add(keyword)
        
        # 计算总分数 - 使用更合理的归一化
        total_matches = len(matched_positive) + len(matched_negative)
        if total_matches == 0:
            sentiment_score = 0.0
            confidence = 0.0
        else:
            # 直接计算差值，不再除以过大的数
            sentiment_score = (positive_score - negative_score)
            # 归一化到 [-1, 1] 范围
            max_possible = max(positive_score + negative_score, 1.0)
            sentiment_score = sentiment_score / max_possible
            # 裁剪到 [-1, 1]
            sentiment_score = max(-1.0, min(1.0, sentiment_score))
            confidence = min(total_matches / 3.0, 1.0)
        
        # 判断情感类别 - 使用更简单直接的判断
        if sentiment_score > 0.1:
            sentiment = 'positive'
        elif sentiment_score < -0.1:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'
        
        # 检测高风险
        is_high_risk = any(keyword in text for keyword in self.high_risk_keywords)
        
        return {
            'sentiment': sentiment,
            'score': round(sentiment_score, 2),
            'is_high_risk': is_high_risk,
            'confidence': round(confidence, 2)
        }
    
    def analyze_title_and_content(self, title: str, content: str = '') -> dict:
        """
        分别分析标题和内容，标题权重更高
        
        Args:
            title: 新闻标题
            content: 新闻内容（可选）
            
        Returns:
            情感分析结果字典
        """
        # 标题分析（权重80%）
        title_result = self.analyze(title)
        
        if not content:
            return title_result
        
        # 内容分析（权重20%）
        content_result = self.analyze(content[:800])  # 分析前800字符
        
        # 加权合并
        combined_score = title_result['score'] * 0.8 + content_result['score'] * 0.2
        combined_confidence = (title_result['confidence'] * 0.8 + content_result['confidence'] * 0.2)
        
        # 判断最终情感
        if combined_score > 0.08:
            final_sentiment = 'positive'
        elif combined_score < -0.08:
            final_sentiment = 'negative'
        else:
            final_sentiment = 'neutral'
        
        # 高风险判断（任一为高风险即为高风险）
        is_high_risk = title_result['is_high_risk'] or content_result['is_high_risk']
        
        return {
            'sentiment': final_sentiment,
            'score': round(combined_score, 2),
            'is_high_risk': is_high_risk,
            'confidence': round(combined_confidence, 2),
            'title_sentiment': title_result['sentiment'],
            'content_sentiment': content_result['sentiment']
        }


# 创建全局分析器实例
_analyzer = SentimentAnalyzer()

def analyze_sentiment(text: str) -> SentimentType:
    """
    快捷函数：分析文本情感
    
    Args:
        text: 要分析的文本
        
    Returns:
        'positive' | 'negative' | 'neutral'
    """
    result = _analyzer.analyze(text)
    return result['sentiment']

def analyze_news(title: str, content: str = '') -> dict:
    """
    快捷函数：分析新闻情感（标题+内容）
    
    Args:
        title: 新闻标题
        content: 新闻内容
        
    Returns:
        完整的分析结果字典
    """
    return _analyzer.analyze_title_and_content(title, content)


# 用于测试
if __name__ == "__main__":
    # 测试用例 - 添加更多测试案例
    test_cases = [
        ("火箭爆炸致蓝色起源势头逆转 双重打击或引发重大延期", "negative"),
        ("10名车主诉特斯拉FSD欺诈案近日开庭 索赔金额数百万元", "negative"),
        ("DeepMind 发布突破性AI编程工具，开发效率提升300%", "positive"),
        ("某大型平台发现严重安全漏洞，百万用户数据泄露", "negative"),
        ("今日天气晴朗，气温适宜", "neutral"),
        ("公司业绩持续下滑，面临破产危机", "negative"),
        ("新产品获得市场热烈反响，销量超预期", "positive"),
        ("政府发布利好政策，股市大涨", "positive"),
        ("多地发生严重火灾，造成重大损失", "negative"),
        ("科技创新推动经济发展", "positive"),
    ]
    
    print("=" * 60)
    print("情感分析测试")
    print("=" * 60)
    
    for text, expected in test_cases:
        result = analyze_news(text)
        status = "✅" if result['sentiment'] == expected else "❌"
        print(f"\n{status} 文本: {text}")
        print(f"   预期: {expected}")
        print(f"   结果: {result['sentiment']} (分数: {result['score']}, 置信度: {result['confidence']})")
        print(f"   高风险: {'是' if result['is_high_risk'] else '否'}")
