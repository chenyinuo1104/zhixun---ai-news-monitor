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

# 导入新增的模块
import sentiment_analyzer
import deduplication
from error_handler import ErrorHandler

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

# 创建错误处理实例
pipeline_error_handler = ErrorHandler("Pipeline")

# 创建去重检测器实例
dedup_checker = deduplication.DeduplicationChecker(similarity_threshold=0.85)

async def main():
    pipeline_error_handler.log_info("=" * 60)
    pipeline_error_handler.log_info("开始运行数据处理Pipeline")
    pipeline_error_handler.log_info("=" * 60)
    
    try:
        # 1. Fetch
        pipeline_error_handler.log_info("步骤1: 从RSS源抓取新闻...")
        raw_news = rss_crawler.get_all_news()
        pipeline_error_handler.log_info(f"   抓取到 {len(raw_news)} 条原始新闻")
        
        # 2. 获取数据库中最近的新闻用于去重检查
        pipeline_error_handler.log_info("步骤2: 加载现有新闻用于去重检查...")
        
        try:
            recent_news_data = supabase.table('news').select('title,link').order('created_at', desc=True).limit(200).execute()
            
            existing_titles = [item['title'] for item in recent_news_data.data] if recent_news_data.data else []
            existing_urls = [item['link'] for item in recent_news_data.data if item.get('link')] if recent_news_data.data else []
            
            pipeline_error_handler.log_info(f"   加载了 {len(existing_titles)} 条现有新闻标题")
            
        except Exception as e:
            pipeline_error_handler.log_error(e, "加载现有新闻失败，将跳过去重检查", critical=True)
            existing_titles = []
            existing_urls = []
        
        # 3. Process & Insert
        pipeline_error_handler.log_info("步骤3: 处理并保存新闻...")
        
        count_new = 0
        count_duplicate = 0
        count_error = 0
        
        for item in raw_news:
            try:
                # Clean
                title = data_processor.clean_text(item['title'])
                summary = data_processor.clean_text(item.get('summary', ''))
                content = item.get('content', '')
                link = item.get('link', '')
                
                if not title:
                    pipeline_error_handler.log_warning("标题为空，跳过此新闻", item.get('source', 'Unknown'))
                    continue
                
                # 去重检查
                dup_result = dedup_checker.check_duplicate(
                    title=title,
                    url=link,
                    existing_titles=existing_titles,
                    existing_urls=existing_urls
                )
                
                if dup_result['is_duplicate']:
                    count_duplicate += 1
                    print(f"   ⏭️  跳过重复: {title[:30]}... (原因: {dup_result['reason']})")
                    continue
                
                # 情感分析（使用新的智能分析器）
                sentiment_result = sentiment_analyzer.analyze_news(title, content)
                
                # 提取关键词
                full_text = title + " " + summary
                tags = generate_summary.extract_keywords(full_text)
                
                # Prepare for DB
                db_item = {
                    "source": item['source'],
                    "title": title[:200],  # Truncate if too long
                    "summary": summary[:500],
                    "content": content,
                    "link": link,
                    "tags": tags,
                    "sentiment": sentiment_result['sentiment'],
                    "image_url": "https://picsum.photos/200/300?random=" + str(len(title)),  # Placeholder image
                    "is_high_risk": sentiment_result['is_high_risk'],  # 使用智能分析结果
                    "category": item.get('category', 'tech'),
                }
                
                try:
                    supabase.table('news').insert(db_item).execute()
                    
                    # 显示详细的情感分析结果
                    emoji = "😊" if sentiment_result['sentiment'] == 'positive' else "😟" if sentiment_result['sentiment'] == 'negative' else "😐"
                    risk_flag = "⚠️" if sentiment_result['is_high_risk'] else "  "
                    
                    print(f"   ✅ {risk_flag} {emoji} [{sentiment_result['sentiment']}] {title[:40]}...")
                    
                    count_new += 1
                    
                    # 添加到已存在列表（避免同一批次的重复）
                    existing_titles.append(title)
                    if link:
                        existing_urls.append(link)
                        
                except Exception as e:
                    count_error += 1
                    pipeline_error_handler.log_error(e, f"保存新闻失败: {title[:30]}")
                    
            except Exception as e:
                count_error += 1
                pipeline_error_handler.log_error(e, f"处理新闻失败: {item.get('title', 'Unknown')[:30]}")
                continue

        # 输出统计信息
        print("\n" + "=" * 60)
        pipeline_error_handler.log_info("Pipeline处理完成！")
        print(f"   ✅ 新增: {count_new} 条")
        print(f"   ⏭️  去重过滤: {count_duplicate} 条")
        print(f"   ❌ 错误: {count_error} 条")
        print("=" * 60)
        
    except Exception as e:
        pipeline_error_handler.log_error(e, "Pipeline运行失败", critical=True)
        raise
    
    finally:
        # 输出错误摘要
        print(pipeline_error_handler.get_error_summary())
        
        # 同时输出爬虫的错误摘要
        if hasattr(rss_crawler, 'crawler_error_handler'):
            print(rss_crawler.crawler_error_handler.get_error_summary())

if __name__ == "__main__":
    asyncio.run(main())


