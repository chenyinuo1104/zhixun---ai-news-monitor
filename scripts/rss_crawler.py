import feedparser
import json
import os
from datetime import datetime
import time
from dotenv import load_dotenv
from supabase import create_client, Client

# 加载环境变量
load_dotenv()

# Supabase 配置
SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Missing Supabase credentials in .env file.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 新闻源配置 - 新华社
RSS_FEEDS = {
    "新华社": {
        "url": "http://www.news.cn/politics/news_politics.xml",
        "category": "policy",
        "tags": ["时政", "新闻"],
        "is_high_risk_source": False
    },
}




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
            
            # 简单的摘要截断
            summary = entry.get("summary", "")
            if len(summary) > 500:
                summary = summary[:497] + "..."

            news_item = {
                "source": feed_name,
                "title": entry.get("title", ""),
                # "link": entry.get("link", ""), # Database 'news' table missing 'link' column currently
                "summary": summary,
                "tags": default_tags,  # 使用配置的标签
                "sentiment": "neutral", # Default sentiment
                "category": category,   # 使用配置的分类
                "is_high_risk": is_high_risk_source  # 使用配置的风险级别
                # "published": published, # Database uses created_at
            }
            news_list.append(news_item)

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
