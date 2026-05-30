"""
重新分析数据库中已有的新闻，更新情感和分类
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# 导入分析模块
import sentiment_analyzer
import news_classifier

# 加载环境变量
current_dir = os.getcwd()
env_path = os.path.join(current_dir, '.env')
load_dotenv(dotenv_path=env_path, override=True)

url: str = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

if not url or not key:
    print("Error: SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_KEY/VITE_SUPABASE_ANON_KEY not found.")
    exit()

print(f"Connecting to Supabase at: {url}")
supabase: Client = create_client(url, key)

def reanalyze_all_news():
    """重新分析所有新闻"""
    print("=" * 60)
    print("开始重新分析数据库中的新闻")
    print("=" * 60)
    
    # 获取所有新闻
    print("\n1. 获取所有新闻...")
    try:
        result = supabase.table('news').select('id, title, content, sentiment, category').execute()
        news_items = result.data
        print(f"   共找到 {len(news_items)} 条新闻")
    except Exception as e:
        print(f"   ❌ 获取新闻失败: {e}")
        return
    
    # 重新分析每条新闻
    updated_count = 0
    error_count = 0
    
    print("\n2. 重新分析新闻...")
    for news in news_items:
        news_id = news['id']
        title = news['title']
        content = news.get('content', '')
        old_sentiment = news.get('sentiment', 'neutral')
        old_category = news.get('category', None)
        
        try:
            # 重新分析情感
            sentiment_result = sentiment_analyzer.analyze_news(title, content)
            new_sentiment = sentiment_result['sentiment']
            is_high_risk = sentiment_result['is_high_risk']
            
            # 重新分类
            new_category = news_classifier.classify_news(title, content)
            
            # 只有当情感或分类改变时才更新
            if new_sentiment != old_sentiment or new_category != old_category:
                # 更新数据库
                supabase.table('news').update({
                    'sentiment': new_sentiment,
                    'is_high_risk': is_high_risk,
                    'category': new_category
                }).eq('id', news_id).execute()
                
                print(f"   ✅ 更新: [{old_sentiment}→{new_sentiment}] {title[:40]}...")
                updated_count += 1
            else:
                print(f"   ⏭️  无变化: [{old_sentiment}] {title[:40]}...")
                
        except Exception as e:
            print(f"   ❌ 失败: {title[:30]} - {e}")
            error_count += 1
    
    # 输出统计
    print("\n" + "=" * 60)
    print(f"分析完成！")
    print(f"   ✅ 更新: {updated_count} 条")
    print(f"   ⏭️  无变化: {len(news_items) - updated_count - error_count} 条")
    print(f"   ❌ 错误: {error_count} 条")
    print("=" * 60)

if __name__ == "__main__":
    reanalyze_all_news()
