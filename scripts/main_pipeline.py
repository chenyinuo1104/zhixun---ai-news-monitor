import asyncio
import os
from dotenv import load_dotenv
from supabase import create_client, Client
import sys

# Set stdout to utf-8 to handle emojis usually, but for safety we will remove emojis in critical error paths or just accept we might need to change codepage.
# Actually, let's just use simple print statements.

# Import our migrated modules
import rss_crawler
import data_processor
import generate_summary

# Load env - explicit path
current_dir = os.getcwd()
env_path = os.path.join(current_dir, '.env')
print(f"Loading env from: {env_path}")
load_dotenv(dotenv_path=env_path, override=True)

url: str = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

if not url or not key:
    print("Error: SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_KEY/VITE_SUPABASE_ANON_KEY not found.")
    print(f"Current env keys: {list(os.environ.keys())}")
    exit()

print(f"Connecting to Supabase at: {url}")
supabase: Client = create_client(url, key)

def analyze_sentiment_simple(text):
    """
    Simple keyword-based sentiment analysis as a placeholder.
    In a real app, this would use a model.
    """
    positive_words = ['突破', '增长', '创新', '成功', '上涨', '利好', '支持', '发布']
    negative_words = ['下跌', '亏损', '失败', '制裁', '垄断', '风险', '警告', '被捕']
    
    score = 0
    for word in positive_words:
        if word in text:
            score += 1
    for word in negative_words:
        if word in text:
            score -= 1
            
    if score > 0:
        return 'positive'
    elif score < 0:
        return 'negative'
    else:
        return 'neutral'

async def main():
    print("Starting Pipeline...")
    
    # 1. Fetch
    print("Fetching news from RSS...")
    raw_news = rss_crawler.get_all_news()
    print(f"   Fetched {len(raw_news)} items.")
    
    # 2. Process & Insert
    print("Processing and saving...")
    
    count_new = 0
    for item in raw_news:
        # Clean
        title = data_processor.clean_text(item['title'])
        summary = data_processor.clean_text(item['summary'])
        
        if not title:
            continue
            
        # Analysis
        full_text = title + " " + summary
        tags = generate_summary.extract_keywords(full_text)
        sentiment = analyze_sentiment_simple(full_text)
        
        # Prepare for DB
        db_item = {
            "source": item['source'],
            "title": title[:200], # Truncate if too long
            "summary": summary[:500],
            "content": item.get('content', ''),  # 保存完整内容
            "link": item.get('link', ''),  # 保存原文链接
            "tags": tags,
            "sentiment": sentiment,
            "image_url": "https://picsum.photos/200/300?random=" + str(len(title)), # Placeholder image
            "is_high_risk": item.get('is_high_risk', sentiment == 'negative'), # 使用配置或基于情感分析
            "category": item.get('category', 'tech'), # 使用RSS源配置的category
            # 'created_at' will be auto-generated or we can parse item['published'] if we convert to ISO properly
        }
        
        try:
            # Check for duplicates (simple check by title)
            # In a real app we might use a unique constraint or hash
            existing = supabase.table('news').select('id').eq('title', title).execute()
            if existing.data:
                print(f"   Skipping duplicate: {title[:20]}...")
                continue
                
            supabase.table('news').insert(db_item).execute()
            print(f"   Saved: {title[:20]}...")
            count_new += 1
        except Exception as e:
            print(f"   Error saving {title[:20]}...: {e}")

    print(f"Pipeline finished! Added {count_new} new items.")

if __name__ == "__main__":
    asyncio.run(main())
