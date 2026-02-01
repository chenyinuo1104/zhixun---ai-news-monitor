import json
import os
import re
from datetime import datetime


def clean_text(text):
    """
    清洗文本：利用正则去除 HTML 标签、广告链接及特殊字符
    """
    if not text:
        return ""

    # 1. 去除 HTML 标签 (改进版正则)
    text = re.sub(r'<[^>]+>', '', text)

    # 2. 去除广告链接 (常见 http/https 链接)
    # text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', text)
    # Be careful not to remove all links if they are relevant, but for summary cleaning it is usually good.

    # 3. 替换常见的 HTML 实体
    text = text.replace('&nbsp;', ' ').replace('&quot;', '"').replace(
        '&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')

    # 4. 去除特殊字符（保留中文、英文、数字及常用标点）
    # text = re.sub(r'[^\u4e00-\u9fa5a-zA-Z0-9，。！？；：“”（）%、—\.\?\!\s]', '', text)

    # 5. 去除多余的空白字符和换行
    text = re.sub(r'\s+', ' ', text).strip()

    # 6. 去除首尾的特定噪声
    text = re.sub(r'^原标题：', '', text)

    return text
