import feedparser
import json
import os
from datetime import datetime
import time
from dotenv import load_dotenv
from supabase import create_client, Client
import requests
from bs4 import BeautifulSoup

# 加载环境变量
load_dotenv()

# Supabase 配置
SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Missing Supabase credentials in .env file.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 新闻源配置 - 扩展多个分类
RSS_FEEDS = {
    # 政策类
    "新华社": {
        "url": "http://www.news.cn/politics/news_politics.xml",
        "category": "policy",
        "tags": ["时政", "新闻"],
        "is_high_risk_source": False
    },
    
    # 科技类
    "36氪": {
        "url": "https://36kr.com/feed",
        "category": "tech",
        "tags": ["科技", "创业"],
        "is_high_risk_source": False
    },
    "InfoQ": {
        "url": "https://www.infoq.cn/feed",
        "category": "tech",
        "tags": ["技术", "开发"],
        "is_high_risk_source": False
    },
    "极客公园": {
        "url": "http://www.geekpark.net/rss",
        "category": "tech",
        "tags": ["科技", "创新"],
        "is_high_risk_source": False
    },
    
    # 财经类
    "新浪财经": {
        "url": "https://finance.sina.com.cn/roll/index.d.html",
        "category": "finance",
        "tags": ["财经", "金融"],
        "is_high_risk_source": False
    },
    "网易财经": {
        "url": "http://money.163.com/special/002557S6/rss_news.xml",
        "category": "finance",
        "tags": ["财经", "市场"],
        "is_high_risk_source": False
    },
    
    # 人文类
    "澎湃新闻": {
        "url": "https://www.thepaper.cn/rss",
        "category": "culture",
        "tags": ["人文", "社会"],
        "is_high_risk_source": False
    },
    "知乎日报": {
        "url": "https://daily.zhihu.com/rss",
        "category": "culture",
        "tags": ["知识", "文化"],
        "is_high_risk_source": False
    },
}


def fetch_article_content(url):
    """
    抓取新闻页面的完整正文内容
    url: 新闻原文链接
    返回: 正文内容字符串,如果抓取失败返回空字符串
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.encoding = response.apparent_encoding
        
        if response.status_code != 200:
            print(f"   ⚠️  页面访问失败: {url} (状态码: {response.status_code})")
            return ""
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 移除script、style等无关标签
        for tag in soup(['script', 'style', 'nav', 'header', 'footer', 'aside']):
            tag.decompose()
        
        # 尝试多种常见的正文容器选择器
        content = ""
        
        # 新华社文章结构
        article_body = soup.find('div', {'id': 'detail'}) or \
                      soup.find('div', {'class': 'article'}) or \
                      soup.find('div', {'class': 'content'}) or \
                      soup.find('article') or \
                      soup.find('div', {'class': 'post-content'})
        
        if article_body:
            # 提取所有段落
            paragraphs = article_body.find_all('p')
            content = '\n\n'.join([p.get_text().strip() for p in paragraphs if p.get_text().strip()])
        
        # 如果没有找到内容,尝试提取所有p标签
        if not content:
            paragraphs = soup.find_all('p')
            content = '\n\n'.join([p.get_text().strip() for p in paragraphs if len(p.get_text().strip()) > 20])
        
        return content.strip() if content else ""
        
    except Exception as e:
        print(f"   ❌ 抓取内容失败 {url}: {str(e)}")
        return ""



def fetch_news(feed_config, feed_name):
    """
    抓取指定 RSS 源的新闻
    feed_config: 包含 url, category, tags, is_high_risk_source 的字典
    feed_name: 新闻源名称
    """
    feed_url = feed_config["url"]
    category = feed_config["category"]
    default_tags = feed_config["tags"]
    is_high_risk_source = feed_config.get("is_high_risk_source", False)
    
    print(f"[*] Fetching news from: {feed_name} ({feed_url})")
    try:
        feed = feedparser.parse(feed_url)
        news_list = []

        for entry in feed.entries:
            # Handle different time formats or current time if missing
            published = entry.get("published", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
            
            # 获取新闻链接
            link = entry.get("link", "")
            
            # RSS的summary作为摘要
            rss_summary = entry.get("summary", "")
            
            # 截取摘要(200字符)
            summary = rss_summary
            if len(summary) > 200:
                summary = summary[:197] + "..."
            
            # 抓取完整正文内容
            print(f"   📄 抓取正文: {entry.get('title', '')[:30]}...")
            full_content = fetch_article_content(link) if link else ""
            
            # 如果抓取失败,使用RSS的summary作为内容
            if not full_content:
                full_content = rss_summary
                print(f"   ⚠️  使用RSS摘要作为内容")

            news_item = {
                "source": feed_name,
                "title": entry.get("title", ""),
                "link": link,
                "summary": summary,
                "content": full_content,  # 保存完整抓取的内容
                "tags": default_tags,
                "sentiment": "neutral",
                "category": category,
                "is_high_risk": is_high_risk_source
            }
            news_list.append(news_item)
            
            # 避免请求过快被封
            time.sleep(1)

        print(
            f"[+] Successfully fetched {len(news_list)} items from {feed_name}")
        return news_list
    except Exception as e:
        print(f"[!] Error fetching {feed_name}: {str(e)}")
        return []

def get_all_news():
    all_news = []
    for name, config in RSS_FEEDS.items():
        news = fetch_news(config, name)
        all_news.extend(news)
        time.sleep(1)  # 避免请求过快
    return all_news

def save_to_supabase(news_items):
    print(f"📥 Saving {len(news_items)} news items to Supabase...")
    count_success = 0
    for item in news_items:
        try:
            # Check for duplicates based on title (optional, simple check)
            # For now, just insert.
            supabase.table('news').insert(item).execute()
            print(f"   ✅ Saved: {item['title'][:30]}...")
            count_success += 1
        except Exception as e:
            print(f"   ❌ Failed to save {item['title'][:30]}: {e}")
    print(f"🎉 API Sync Complete. Saved {count_success}/{len(news_items)} items.")

if __name__ == "__main__":
    news = get_all_news()
    if news:
        save_to_supabase(news)
    else:
        print("No news fetched.")
