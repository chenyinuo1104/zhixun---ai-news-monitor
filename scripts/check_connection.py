"""检查 Supabase 数据库连接与新闻数据量。"""
import os
import sys

from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

if not url or not key:
    print("[错误] 未找到数据库配置。请在 .env 中设置：")
    print("   VITE_SUPABASE_URL=https://你的项目.supabase.co")
    print("   VITE_SUPABASE_ANON_KEY=你的anon密钥")
    sys.exit(1)

print(f"连接地址: {url}")
print(f"Key 前缀: {key[:12]}...")

try:
    from supabase import create_client

    client = create_client(url, key)
    result = client.table("news").select("id,title,created_at", count="exact").order("created_at", desc=True).limit(5).execute()
    total = result.count if result.count is not None else len(result.data or [])

    print(f"\n[成功] 连接成功！news 表共有 {total} 条记录")

    if result.data:
        print("\n最新 5 条新闻：")
        for i, item in enumerate(result.data, 1):
            print(f"  {i}. {item.get('title', '无标题')}")
    else:
        print("\n[提示] 数据库已连接，但 news 表为空。可运行爬虫写入数据：")
        print("   cd scripts && py main_pipeline.py")

except Exception as exc:
    print(f"\n[失败] 连接失败: {exc}")
    print("\n请检查：")
    print("  1. 登录 https://supabase.com 确认项目未暂停/删除")
    print("  2. Settings -> API 复制 Project URL 和 anon public key")
    print("  3. 在 SQL Editor 执行 supabase/schema.sql 建表")
    sys.exit(1)
