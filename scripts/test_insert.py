#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
快速测试脚本 - 插入测试新闻数据
用于验证实时订阅和分类筛选功能
"""

import os
import sys
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# 加载环境变量
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(project_root, '.env')
print(f"📁 加载环境变量: {env_path}")
load_dotenv(dotenv_path=env_path, override=True)

# 连接 Supabase
url = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

if not url or not key:
    print("❌ 错误: 未找到 Supabase 配置")
    sys.exit(1)

print(f"🔗 连接到 Supabase: {url}")
supabase: Client = create_client(url, key)

# 测试数据
test_news = [
    {
        "source": "TechNews",
        "title": "🆕 实时测试: DeepMind 发布最新 AI 编程工具",
        "tags": ["AI", "编程", "科技"],
        "sentiment": "positive",
        "image_url": "https://picsum.photos/200/300?random=tech1",
        "is_high_risk": False,
        "category": "tech",
        "summary": "这是一条刚刚插入的测试新闻，用于验证实时订阅功能"
    },
    {
        "source": "SecurityAlert",
        "title": "⚠️ 高风险测试: 某大型平台发现严重安全漏洞",
        "tags": ["安全", "漏洞"],
        "sentiment": "negative",
        "image_url": "https://picsum.photos/200/300?random=risk1",
        "is_high_risk": True,
        "category": "tech",
        "summary": "这是一条高风险新闻，用于测试高风险筛选功能"
    },
    {
        "source": "CultureDaily",
        "title": "🎨 人文测试: 传统文化与现代科技的融合展览开幕",
        "tags": ["文化", "艺术"],
        "sentiment": "positive",
        "image_url": "https://picsum.photos/200/300?random=culture1",
        "is_high_risk": False,
        "category": "culture",
        "summary": "这是一条人文类新闻，用于测试分类筛选功能"
    }
]

print("\n" + "="*60)
print("🚀 开始插入测试数据...")
print("="*60 + "\n")

for i, news_item in enumerate(test_news, 1):
    try:
        result = supabase.table('news').insert(news_item).execute()
        print(f"✅ [{i}/{len(test_news)}] 成功插入: {news_item['title'][:30]}...")
        print(f"   分类: {news_item['category']} | 高风险: {news_item['is_high_risk']}")
        print()
    except Exception as e:
        print(f"❌ [{i}/{len(test_news)}] 插入失败: {news_item['title'][:30]}...")
        print(f"   错误: {e}")
        print()

print("="*60)
print("✨ 测试数据插入完成！")
print("="*60)
print("\n📌 请检查浏览器中的舆情看板页面：")
print("   1. 新闻应该自动出现（无需刷新页面）")
print("   2. 时间显示为'刚刚'")
print("   3. 点击'高风险'按钮应该只显示高风险新闻")
print("   4. 点击'科技'或'人文'应该显示对应分类")
print("\n💡 提示: 打开浏览器开发者工具(F12)查看控制台日志\n")
