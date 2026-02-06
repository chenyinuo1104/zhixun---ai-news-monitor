"""
新闻去重检测模块
使用多种策略检测重复新闻
"""
from difflib import SequenceMatcher
from typing import Optional, Tuple
import re
import hashlib


class DeduplicationChecker:
    """新闻去重检测器"""
    
    def __init__(self, similarity_threshold: float = 0.85):
        """
        初始化去重检测器
        
        Args:
            similarity_threshold: 标题相似度阈值（0-1），默认0.85
        """
        self.similarity_threshold = similarity_threshold
    
    def normalize_title(self, title: str) -> str:
        """
        标准化标题（去除特殊字符、统一大小写等）
        
        Args:
            title: 原始标题
            
        Returns:
            标准化后的标题
        """
        if not title:
            return ""
        
        # 转小写
        title = title.lower().strip()
        
        # 移除常见的前缀标记
        prefixes = ['【', '[', '「', '⚠️', '✅', '❌', '🔥', '📰']
        for prefix in prefixes:
            if prefix in title:
                title = re.sub(f'{prefix}[^】\\]」]*[】\\]」]', '', title)
        
        # 移除多余空格
        title = re.sub(r'\s+', ' ', title).strip()
        
        # 移除常见的无意义标点
        title = re.sub(r'[，。、！？：；""''（）《》【】\[\]().,!?:;"\']', '', title)
        
        return title
    
    def calculate_similarity(self, text1: str, text2: str) -> float:
        """
        计算两个文本的相似度
        
        Args:
            text1: 文本1
            text2: 文本2
            
        Returns:
            相似度分数（0-1）
        """
        if not text1 or not text2:
            return 0.0
        
        # 标准化
        norm1 = self.normalize_title(text1)
        norm2 = self.normalize_title(text2)
        
        if not norm1 or not norm2:
            return 0.0
        
        # 使用SequenceMatcher计算相似度
        return SequenceMatcher(None, norm1, norm2).ratio()
    
    def is_duplicate_title(self, title1: str, title2: str) -> Tuple[bool, float]:
        """
        判断两个标题是否重复
        
        Args:
            title1: 标题1
            title2: 标题2
            
        Returns:
            (是否重复, 相似度分数)
        """
        similarity = self.calculate_similarity(title1, title2)
        is_dup = similarity >= self.similarity_threshold
        return is_dup, similarity
    
    def is_duplicate_url(self, url1: str, url2: str) -> bool:
        """
        判断两个URL是否重复（考虑参数差异）
        
        Args:
            url1: URL1
            url2: URL2
            
        Returns:
            是否重复
        """
        if not url1 or not url2:
            return False
        
        # 移除协议前缀
        url1 = re.sub(r'^https?://(www\.)?', '', url1.lower())
        url2 = re.sub(r'^https?://(www\.)?', '', url2.lower())
        
        # 移除尾部斜杠
        url1 = url1.rstrip('/')
        url2 = url2.rstrip('/')
        
        # 移除常见的追踪参数
        tracking_params = ['utm_source', 'utm_medium', 'utm_campaign', 'from', 'share']
        for param in tracking_params:
            url1 = re.sub(f'[?&]{param}=[^&]*', '', url1)
            url2 = re.sub(f'[?&]{param}=[^&]*', '', url2)
        
        # 比较清理后的URL
        return url1 == url2
    
    def generate_content_hash(self, content: str) -> str:
        """
        生成内容的哈希值（用于快速查找）
        
        Args:
            content: 文本内容
            
        Returns:
            MD5哈希值
        """
        if not content:
            return ""
        
        normalized = self.normalize_title(content)
        return hashlib.md5(normalized.encode('utf-8')).hexdigest()
    
    def check_duplicate(self, 
                       title: str, 
                       url: Optional[str] = None,
                       existing_titles: list = None,
                       existing_urls: list = None) -> dict:
        """
        综合检查新闻是否重复
        
        Args:
            title: 新闻标题
            url: 新闻URL（可选）
            existing_titles: 已存在的标题列表
            existing_urls: 已存在的URL列表
            
        Returns:
            {
                'is_duplicate': bool,
                'reason': str,  # 重复原因
                'similarity': float,  # 相似度（如果是标题重复）
                'matched_title': str,  # 匹配到的标题（如果有）
            }
        """
        result = {
            'is_duplicate': False,
            'reason': '',
            'similarity': 0.0,
            'matched_title': ''
        }
        
        # 1. 检查URL重复
        if url and existing_urls:
            for existing_url in existing_urls:
                if self.is_duplicate_url(url, existing_url):
                    result['is_duplicate'] = True
                    result['reason'] = 'URL重复'
                    return result
        
        # 2. 检查标题重复
        if existing_titles:
            for existing_title in existing_titles:
                is_dup, similarity = self.is_duplicate_title(title, existing_title)
                if is_dup:
                    result['is_duplicate'] = True
                    result['reason'] = f'标题相似度过高 ({similarity:.2%})'
                    result['similarity'] = similarity
                    result['matched_title'] = existing_title
                    return result
        
        return result


# 创建全局去重检测器
_checker = DeduplicationChecker(similarity_threshold=0.85)

def is_duplicate(title: str, existing_titles: list, url: str = None, existing_urls: list = None) -> Tuple[bool, str]:
    """
    快捷函数：检查新闻是否重复
    
    Args:
        title: 新闻标题
        existing_titles: 已存在的标题列表
        url: 新闻URL（可选）
        existing_urls: 已存在的URL列表（可选）
        
    Returns:
        (是否重复, 重复原因)
    """
    result = _checker.check_duplicate(title, url, existing_titles, existing_urls)
    return result['is_duplicate'], result['reason']

def calculate_title_similarity(title1: str, title2: str) -> float:
    """
    快捷函数：计算标题相似度
    
    Args:
        title1: 标题1
        title2: 标题2
        
    Returns:
        相似度分数（0-1）
    """
    return _checker.calculate_similarity(title1, title2)


# 用于测试
if __name__ == "__main__":
    print("=" * 60)
    print("去重检测测试")
    print("=" * 60)
    
    # 测试标题相似度
    test_pairs = [
        ("DeepMind 发布最新AI工具", "DeepMind发布最新AI工具", True),
        ("【科技】OpenAI 推出新模型", "OpenAI推出新模型GPT-5", True),
        ("苹果发布iPhone 15", "三星发布Galaxy S24", False),
        ("美股暴跌，投资者恐慌", "美股大幅下跌，投资者普遍担忧", True),
    ]
    
    print("\n标题相似度测试:")
    for title1, title2, expected_dup in test_pairs:
        is_dup, similarity = _checker.is_duplicate_title(title1, title2)
        status = "✅" if is_dup == expected_dup else "❌"
        print(f"\n{status}")
        print(f"  标题1: {title1}")
        print(f"  标题2: {title2}")
        print(f"  相似度: {similarity:.2%}")
        print(f"  判断: {'重复' if is_dup else '不重复'} (预期: {'重复' if expected_dup else '不重复'})")
    
    # 测试URL去重
    print("\n\nURL去重测试:")
    url_pairs = [
        ("https://www.example.com/news/123", "http://example.com/news/123", True),
        ("https://www.site.com/article?utm_source=twitter", "https://site.com/article", True),
        ("https://news.com/story1", "https://news.com/story2", False),
    ]
    
    for url1, url2, expected_dup in url_pairs:
        is_dup = _checker.is_duplicate_url(url1, url2)
        status = "✅" if is_dup == expected_dup else "❌"
        print(f"\n{status}")
        print(f"  URL1: {url1}")
        print(f"  URL2: {url2}")
        print(f"  判断: {'重复' if is_dup else '不重复'} (预期: {'重复' if expected_dup else '不重复'})")
