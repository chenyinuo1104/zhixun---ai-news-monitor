"""
新闻分类模块
根据新闻标题和内容智能分类，不确定时返回 None
"""
from typing import Optional

class NewsClassifier:
    """新闻分类器"""
    
    def __init__(self):
        # 科技类关键词
        self.tech_keywords = [
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
            '36氪', '钛媒体', '爱范儿', 'cnbeta'
        ]
        
        # 财经类关键词
        self.finance_keywords = [
            '股市', '股票', 'A股', '港股', '美股', '上市', 'IPO',
            '金融', '银行', '证券', '基金', '投资', '理财',
            '经济', 'GDP', '通胀', 'CPI', '货币政策', '央行',
            '企业', '公司', '财报', '营收', '利润', '亏损',
            '创业', '融资', '投资', 'VC', 'PE', '天使轮',
            '并购', '收购', '重组', '破产', '倒闭',
            '房地产', '房价', '楼市',
            '汇率', '外汇', '美元', '人民币',
            '税务', '税收', '财政',
            '贸易', '关税', '出口', '进口'
        ]
        
        # 政策类关键词
        self.policy_keywords = [
            '政策', '法规', '法律', '监管', '规定', '办法', '条例',
            '政府', '国务院', '部委', '发改委', '工信部', '商务部',
            '通知', '公告', '发布', '出台', '实施', '执行',
            '政治', '选举', '领导人', '会议', '两会',
            '外交', '国际', '中美', '中欧', '中日',
            '安全', '国家安全', '网络安全', '数据安全',
            '环保', '环境', '碳中和', '碳达峰', '减排',
            '教育', '医疗', '社保', '养老', '就业'
        ]
        
        # 人文类关键词
        self.culture_keywords = [
            '文化', '艺术', '文学', '电影', '音乐', '戏剧', '展览',
            '历史', '考古', '文物', '博物馆',
            '旅游', '旅行', '景点', '景区',
            '体育', '运动', '奥运', '世界杯', '足球', '篮球',
            '娱乐', '明星', '八卦', '综艺', '电视剧', '电影',
            '生活', '健康', '养生', '美食', '时尚',
            '教育', '大学', '学校', '高考', '留学',
            '社会', '民生', '公益', '慈善'
        ]
    
    def classify(self, title: str, content: str = '', source_category: Optional[str] = None) -> Optional[str]:
        """
        智能分类新闻
        
        Args:
            title: 新闻标题
            content: 新闻内容（可选）
            source_category: 来源默认分类（可选，作为备选）
            
        Returns:
            'tech' | 'finance' | 'policy' | 'culture' | None（不确定时返回None）
        """
        if not title:
            return None
        
        text = (title + " " + (content or "")).lower()
        
        # 统计各类关键词匹配数量
        tech_count = sum(1 for kw in self.tech_keywords if kw.lower() in text)
        finance_count = sum(1 for kw in self.finance_keywords if kw.lower() in text)
        policy_count = sum(1 for kw in self.policy_keywords if kw.lower() in text)
        culture_count = sum(1 for kw in self.culture_keywords if kw.lower() in text)
        
        # 构建结果字典
        counts = {
            'tech': tech_count,
            'finance': finance_count,
            'policy': policy_count,
            'culture': culture_count
        }
        
        # 找到匹配最多的分类
        max_count = max(counts.values())
        
        # 如果没有任何关键词匹配，或匹配太少，返回 None
        if max_count < 1:
            return None
        
        # 找到所有有最大匹配数的分类
        candidates = [cat for cat, count in counts.items() if count == max_count]
        
        # 如果有多个分类匹配数相同，返回 None（不确定）
        if len(candidates) > 1:
            return None
        
        # 只有一个明确分类，返回它
        return candidates[0]


# 创建全局分类器实例
_classifier = NewsClassifier()

def classify_news(title: str, content: str = '', source_category: Optional[str] = None) -> Optional[str]:
    """
    快捷函数：分类新闻
    
    Args:
        title: 新闻标题
        content: 新闻内容（可选）
        source_category: 来源默认分类（可选）
        
    Returns:
        'tech' | 'finance' | 'policy' | 'culture' | None
    """
    return _classifier.classify(title, content, source_category)


# 测试代码
if __name__ == "__main__":
    test_cases = [
        ("火箭爆炸致蓝色起源势头逆转 双重打击或引发重大延期", "tech"),
        ("10名车主诉特斯拉FSD欺诈案近日开庭 索赔金额数百万元", "finance"),
        ("央行宣布下调存款准备金率0.5个百分点", "finance"),
        ("国务院发布关于促进民营经济发展的意见", "policy"),
        ("三星堆考古发现新文物，震惊考古界", "culture"),
        ("苹果发布新款iPhone，搭载A18芯片", "tech"),
        ("欧冠决赛即将打响，巴黎对决皇马", "culture"),
        ("今日天气晴朗，气温适宜", None),
    ]
    
    print("=" * 60)
    print("新闻分类测试")
    print("=" * 60)
    
    for text, expected in test_cases:
        result = classify_news(text)
        status = "✅" if result == expected else "❌"
        print(f"\n{status} 文本: {text}")
        print(f"   预期: {expected}")
        print(f"   结果: {result}")
