import os
import asyncio
from supabase import create_client, Client
from dotenv import load_dotenv

# 1. 加载配置 (Load Configuration)
# 这行代码会自动读取项目根目录下的 .env 文件里的数据库密码
load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("❌ 错误: 没找到 SUPABASE_URL 或 SUPABASE_KEY。请检查 .env 文件")
    exit()

# 2. 连接数据库 (Connect to Database)
supabase: Client = create_client(url, key)

async def main():
    print("🚀 开始运行爬虫...")

    # ==========================================
    # 👉 第一步：在这里放入你的爬虫代码
    # (Step 1: Put your crawler code here)
    # ==========================================
    
    # 示例数据 (Mock Data) - 请用你的真实爬虫数据替换这里
    print("🕷️  正在抓取新闻...")
    
    # 假设这是你爬取到的数据列表
    crawled_data = [
        {
            "source": "AI Daily",
            "title": "DeepMind 发布新一代 AI 编程助手",
            "tags": ["AI", "编程"],
            "sentiment": "positive", # 情感分析结果: positive(积极), neutral(中性), negative(消极)
            "image_url": "https://picsum.photos/200/300",
            "is_high_risk": False,
            "category": "tech"
        },
        {
            "source": "TechCrunch",
            "title": "某科技巨头面临新的反垄断调查",
            "tags": ["商业", "法律"],
            "sentiment": "negative",
            "image_url": "https://picsum.photos/200/301",
            "is_high_risk": True,
            "category": "finance"
        }
    ]

    # ==========================================
    # 👉 第二步：保存数据到数据库
    # (Step 2: Save to database)
    # ==========================================
    
    print(f"📥 准备保存 {len(crawled_data)} 条新闻...")
    
    for news_item in crawled_data:
        try:
            # 插入数据
            data, count = supabase.table('news').insert(news_item).execute()
            print(f"✅ 成功保存: {news_item['title']}")
        except Exception as e:
            print(f"❌ 保存失败: {news_item['title']}")
            print(e)

    print("🎉 所有任务完成！请刷新网页查看。")

if __name__ == "__main__":
    asyncio.run(main())
