import jieba
import jieba.analyse

def extract_keywords(text, topK=5):
    """
    使用 TF-IDF 提取关键词
    """
    keywords = jieba.analyse.extract_tags(text, topK=topK, withWeight=False)
    return keywords
