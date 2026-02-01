#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
测试脚本 - 验证扩展的新闻源配置
测试所有新闻源是否可以正常访问和抓取
"""

import sys
import os

# 添加当前目录到路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from rss_crawler import RSS_FEEDS, fetch_news

def test_all_feeds():
    """测试所有新闻源"""
    print("=" * 70)
    print("🧪 开始测试所有新闻源")
    print("=" * 70)
    print()
    
    total_feeds = len(RSS_FEEDS)
    success_count = 0
    fail_feeds = []
    
    for i, (name, config) in enumerate(RSS_FEEDS.items(), 1):
        print(f"[{i}/{total_feeds}] 测试: {name}")
        print(f"    分类: {config['category']}")
        print(f"    标签: {', '.join(config['tags'])}")
        print(f"    URL: {config['url']}")
        
        try:
            news = fetch_news(config, name)
            if news:
                print(f"    ✅ 成功获取 {len(news)} 条新闻")
                # 显示第一条新闻标题
                if news:
                    print(f"    示例: {news[0]['title'][:50]}...")
                success_count += 1
            else:
                print(f"    ⚠️  未获取到新闻（RSS可能为空）")
                fail_feeds.append((name, "No news returned"))
        except Exception as e:
            print(f"    ❌ 错误: {str(e)}")
            fail_feeds.append((name, str(e)))
        
        print()
    
    # 总结
    print("=" * 70)
    print("📊 测试总结")
    print("=" * 70)
    print(f"总数: {total_feeds}")
    print(f"成功: {success_count}")
    print(f"失败: {len(fail_feeds)}")
    print()
    
    if fail_feeds:
        print("❌ 失败的源:")
        for name, error in fail_feeds:
            print(f"   - {name}: {error}")
    else:
        print("✅ 所有新闻源测试通过！")
    
    print()
    
    # 按分类统计
    print("📈 按分类统计:")
    categories = {}
    for name, config in RSS_FEEDS.items():
        cat = config['category']
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(name)
    
    for cat, feeds in categories.items():
        cat_name = {
            'tech': '科技',
            'finance': '财经',
            'policy': '政策',
            'culture': '文化'
        }.get(cat, cat)
        print(f"   {cat_name}: {len(feeds)} 个源")
        for feed in feeds:
            print(f"      - {feed}")
    
    print()
    print("=" * 70)

if __name__ == "__main__":
    test_all_feeds()
