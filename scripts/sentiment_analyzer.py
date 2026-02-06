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
        # 积极情感关键词
        self.positive_keywords = [
            '突破', '创新', '成功', '增长', '上涨', '利好', '推出', '发布',
            '领先', '优秀', '卓越', '提升', '改善', '支持', '赞', '获奖',
            '合作', '共赢', '发展', '繁荣', '进步', '升级', '优化', '机遇',
            '强劲', '稳定', '健康', '盈利', '收益', '良好', '顺利', '完成',
            '超越', '夺冠', '第一', '冠军', '赢得', '表彰', '喜讯'
        ]
        
        # 消极情感关键词
        self.negative_keywords = [
            '下跌', '亏损', '失败', '制裁', '垄断', '风险', '警告', '被捕',
            '暴跌', '危机', '崩盘', '震荡', '裁员', '倒闭', '破产', '违法',
            '泄露', '漏洞', '攻击', '威胁', '恶化', '担忧', '焦虑', '困境',
            '质疑', '批评', '指责', '谴责', '抗议', '冲突', '矛盾', '争议',
            '事故', '灾难', '损失', '伤亡', '污染', '恶劣', '严重', '紧急',
            '调查', '处罚', '罚款', '下滑', '减少', '萎缩', '延迟', '推迟'
        ]
        
        # 高风险关键词（用于标记is_high_risk）
        self.high_risk_keywords = [
            '严重', '紧急', '危机', '事故', '灾难', '伤亡', '泄露', '漏洞',
            '攻击', '破产', '倒闭', '调查', '被捕', '违法', '制裁', '警告',
            '风险', '威胁', '暴跌', '崩盘', '恶化', '冲突', '抗议', '争议',
            '处罚', '罚款', '质疑', '指责', '谴责', '污染'
        ]
        
        # 情感强化词
        self.intensifiers = ['非常', '十分', '极其', '特别', '相当', '极度', '严重']
        
        # 否定词
        self.negations = ['不', '没', '无', '非', '未', '别', '莫', '勿', '毋']
    
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
        
        # 检测积极关键词
        for keyword in self.positive_keywords:
            if keyword in text:
                weight = 1.0
                # 检查是否有强化词
                for intensifier in self.intensifiers:
                    if intensifier in text and intensifier in text[max(0, text.find(keyword)-10):text.find(keyword)]:
                        weight = 1.5
                        break
                # 检查是否有否定词
                has_negation = False
                for negation in self.negations:
                    if negation in text[max(0, text.find(keyword)-5):text.find(keyword)]:
                        has_negation = True
                        break
                
                if has_negation:
                    negative_score += weight  # 否定词反转情感
                else:
                    positive_score += weight
        
        # 检测消极关键词
        for keyword in self.negative_keywords:
            if keyword in text:
                weight = 1.0
                # 检查是否有强化词
                for intensifier in self.intensifiers:
                    if intensifier in text and intensifier in text[max(0, text.find(keyword)-10):text.find(keyword)]:
                        weight = 1.5
                        break
                # 检查是否有否定词
                has_negation = False
                for negation in self.negations:
                    if negation in text[max(0, text.find(keyword)-5):text.find(keyword)]:
                        has_negation = True
                        break
                
                if has_negation:
                    positive_score += weight  # 否定词反转情感
                else:
                    negative_score += weight
        
        # 计算总分数（归一化到-1到1）
        total_matches = positive_score + negative_score
        if total_matches == 0:
            sentiment_score = 0.0
            confidence = 0.0
        else:
            sentiment_score = (positive_score - negative_score) / max(total_matches, 5)  # 限制最大值
            sentiment_score = max(-1.0, min(1.0, sentiment_score))  # 裁剪到[-1, 1]
            confidence = min(total_matches / 5.0, 1.0)  # 匹配越多，置信度越高
        
        # 判断情感类别
        if sentiment_score > 0.15:
            sentiment = 'positive'
        elif sentiment_score < -0.15:
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
        # 标题分析（权重70%）
        title_result = self.analyze(title)
        
        if not content:
            return title_result
        
        # 内容分析（权重30%）
        content_result = self.analyze(content[:500])  # 只分析前500字符
        
        # 加权合并
        combined_score = title_result['score'] * 0.7 + content_result['score'] * 0.3
        combined_confidence = (title_result['confidence'] * 0.7 + content_result['confidence'] * 0.3)
        
        # 判断最终情感
        if combined_score > 0.15:
            final_sentiment = 'positive'
        elif combined_score < -0.15:
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
    # 测试用例
    test_cases = [
        ("DeepMind 发布突破性AI编程工具，开发效率提升300%", "positive"),
        ("某大型平台发现严重安全漏洞，百万用户数据泄露", "negative"),
        ("今日天气晴朗，气温适宜", "neutral"),
        ("公司业绩持续下滑，面临破产危机", "negative"),
        ("新产品获得市场热烈反响，销量超预期", "positive"),
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
