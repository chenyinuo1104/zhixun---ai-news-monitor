import feedparser
import json
import os
from datetime import datetime, timedelta
import time
from dotenv import load_dotenv
from supabase import create_client, Client
import requests
from bs4 import BeautifulSoup

# 导入错误处理模块
from error_handler import retry_on_failure, crawler_error_handler

# 加载环境变量
load_dotenv()

# Supabase 配置
SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Missing Supabase credentials in .env file.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 新闻源配置 - 精选5个优质源
RSS_FEEDS = {
    # 科技媒体
    "36氪": {
        "url": "https://36kr.com/feed",
        "category": "tech",
        "tags": ["科技", "创业"],
        "is_high_risk_source": False
    },
    "钛媒体": {
        "url": "https://www.tmtpost.com/rss.xml",
        "category": "tech",
        "tags": ["科技", "商业"],
        "is_high_risk_source": False
    },
    "爱范儿": {
        "url": "https://www.ifanr.com/feed",
        "category": "tech",
        "tags": ["科技", "数码"],
        "is_high_risk_source": False
    },
    "cnbeta": {
        "url": "https://www.cnbeta.com.tw/backend.php",
        "category": "tech",
        "tags": ["科技", "资讯"],
        "is_high_risk_source": False
    },
    
    # 人文社会
    "南方周末": {
        "url": "https://rsshub.app/infzm/2",
        "category": "culture",
        "tags": ["时事", "深度"],
        "is_high_risk_source": False
    },
}



@retry_on_failure(max_attempts=3, delay=2.0, exceptions=(requests.RequestException, ConnectionError, TimeoutError))
def fetch_article_content(url):
    """
    抓取新闻页面的完整正文内容和图片
    url: 新闻原文链接
    返回: 字典 {'content': 正文内容, 'images': [图片URL列表]}
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.encoding = response.apparent_encoding
        
        if response.status_code != 200:
            crawler_error_handler.log_warning(
                f"页面访问失败 (状态码: {response.status_code})", 
                url
            )
            return {"content": "", "images": []}
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 移除script、style等无关标签
        for tag in soup(['script', 'style', 'nav', 'header', 'footer', 'aside']):
            tag.decompose()
        
        # 尝试多种常见的正文容器选择器
        content = ""
        images = []
        
        # 新华社文章结构
        article_body = soup.find('div', {'id': 'detail'}) or \
                      soup.find('div', {'class': 'article'}) or \
                      soup.find('div', {'class': 'content'}) or \
                      soup.find('article') or \
                      soup.find('div', {'class': 'post-content'})
        
        if article_body:
            # 提取图片
            img_tags = article_body.find_all('img')
            for img in img_tags:
                img_url = img.get('src') or img.get('data-src') or img.get('data-original')
                if img_url:
                    # 处理相对路径
                    if img_url.startswith('//'):
                        img_url = 'https:' + img_url
                    elif img_url.startswith('/'):
                        from urllib.parse import urlparse
                        parsed = urlparse(url)
                        img_url = f"{parsed.scheme}://{parsed.netloc}{img_url}"
                    
                    # 过滤掉太小的图片（通常是图标）
                    width = img.get('width', '')
                    height = img.get('height', '')
                    
                    # 跳过明显的小图标
                    if width and height:
                        try:
                            if int(width) < 100 and int(height) < 100:
                                continue
                        except:
                            pass
                    
                    if img_url and img_url.startswith('http'):
                        images.append(img_url)
            
            # 提取所有段落
            paragraphs = article_body.find_all('p')
            content = '\n\n'.join([p.get_text().strip() for p in paragraphs if p.get_text().strip()])
        
        # 如果没有找到内容,尝试提取所有p标签
        if not content:
            paragraphs = soup.find_all('p')
            content = '\n\n'.join([p.get_text().strip() for p in paragraphs if len(p.get_text().strip()) > 20])
        
        # 如果article_body没找到图片，尝试全局查找
        if not images:
            all_imgs = soup.find_all('img')
            for img in all_imgs[:5]:  # 最多提取前5张
                img_url = img.get('src') or img.get('data-src')
                if img_url:
                    if img_url.startswith('//'):
                        img_url = 'https:' + img_url
                    elif img_url.startswith('/'):
                        from urllib.parse import urlparse
                        parsed = urlparse(url)
                        img_url = f"{parsed.scheme}://{parsed.netloc}{img_url}"
                    
                    if img_url and img_url.startswith('http'):
                        images.append(img_url)
        
        return {
            "content": content.strip() if content else "",
            "images": images
        }
        
    except requests.RequestException as e:
        crawler_error_handler.log_error(e, f"网络请求失败: {url}")
        raise  # 重新抛出以触发重试
    except Exception as e:
        crawler_error_handler.log_error(e, f"内容抓取失败: {url}")
        return {"content": "", "images": []}




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
    
    crawler_error_handler.log_info(f"开始抓取: {feed_name} ({feed_url})")
    
    # 计算前一天的时间范围
    now = datetime.now()
    yesterday_start = (now - timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    yesterday_end = (now - timedelta(days=1)).replace(hour=23, minute=59, second=59, microsecond=999999)
    
    crawler_error_handler.log_info(f"   时间筛选: {yesterday_start.strftime('%Y-%m-%d %H:%M')} 至 {yesterday_end.strftime('%Y-%m-%d %H:%M')}")

    
    try:
        feed = feedparser.parse(feed_url)
        
        # 检查RSS源是否有效
        if not feed.entries:
            crawler_error_handler.log_warning(
                f"RSS源返回空数据或解析失败", 
                f"{feed_name} - {feed_url}"
            )
            return []
        
        news_list = []
        skipped_old = 0
        skipped_future = 0

        for entry in feed.entries:
            try:
                # 解析发布时间
                published_time = None
                published_str = entry.get("published", "") or entry.get("updated", "")
                
                if published_str:
                    try:
                        # 尝试解析时间
                        if hasattr(entry, 'published_parsed') and entry.published_parsed:
                            published_time = datetime(*entry.published_parsed[:6])
                        elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
                            published_time = datetime(*entry.updated_parsed[:6])
                        else:
                            # 尝试其他格式
                            from dateutil import parser
                            published_time = parser.parse(published_str)
                    except Exception as e:
                        crawler_error_handler.log_warning(
                            f"时间解析失败: {published_str}",
                            f"{feed_name}"
                        )
                        # 如果无法解析时间，跳过此新闻
                        continue
                
                # 时间筛选：只保留前一天的新闻
                if published_time:
                    if published_time < yesterday_start:
                        skipped_old += 1
                        continue  # 太旧，跳过
                    if published_time > yesterday_end:
                        skipped_future += 1
                        continue  # 太新（今天的），跳过
                else:
                    # 没有时间信息，跳过
                    continue
                
                # 获取新闻链接
                link = entry.get("link", "")
                
                # RSS的summary作为摘要
                rss_summary = entry.get("summary", "")
                
                # 截取摘要(200字符)
                summary = rss_summary
                if len(summary) > 200:
                    summary = summary[:197] + "..."
                
                # 抓取完整正文内容
                title = entry.get('title', '')
                print(f"   📄 [{published_time.strftime('%m-%d %H:%M')}] {title[:30]}...")
                
                article_data = {"content": "", "images": []}
                if link:
                    try:
                        article_data = fetch_article_content(link)
                    except Exception as e:
                        # fetch_article_content内部已记录错误，这里只记录提示
                        crawler_error_handler.log_warning(
                            f"重试后仍失败，将使用RSS摘要", 
                            f"{feed_name} - {title[:30]}"
                        )
                
                # 如果抓取失败,使用RSS的summary作为内容
                full_content = article_data.get("content", "")
                if not full_content:
                    full_content = rss_summary
                    print(f"   ⚠️  使用RSS摘要作为内容")
                
                # 提取图片
                images = article_data.get("images", [])
                
                # 尝试从RSS entry中获取图片（media:content 或 enclosure）
                if not images:
                    # 检查media:content（36氪等媒体常用）
                    if hasattr(entry, 'media_content') and entry.media_content:
                        for media in entry.media_content:
                            if 'url' in media:
                                images.append(media['url'])
                    
                    # 检查enclosure（podcast/图片附件）
                    if hasattr(entry, 'enclosures') and entry.enclosures:
                        for enclosure in entry.enclosures:
                            if enclosure.get('type', '').startswith('image/'):
                                images.append(enclosure.get('href', ''))
                    
                    # 检查media:thumbnail
                    if hasattr(entry, 'media_thumbnail') and entry.media_thumbnail:
                        for thumb in entry.media_thumbnail:
                            if 'url' in thumb:
                                images.append(thumb['url'])
                
                # 选择第一张图片作为缩略图
                image_url = images[0] if images else f"https://picsum.photos/400/300?random={hash(title) % 1000}"

                news_item = {
                    "source": feed_name,
                    "title": title,
                    "link": link,
                    "summary": summary,
                    "content": full_content,  # 保存完整抓取的内容
                    "tags": default_tags,
                    "sentiment": "neutral",
                    "category": category,
                    "is_high_risk": is_high_risk_source,
                    "image_url": image_url,  # 第一张图片作为缩略图
                    "images": images  # 所有图片的数组
                }
                news_list.append(news_item)
                
                # 避免请求过快被封
                time.sleep(1)

                
            except Exception as e:
                crawler_error_handler.log_error(
                    e, 
                    f"处理单条新闻失败 - {feed_name}: {entry.get('title', 'Unknown')[:30]}"
                )
                continue  # 跳过这条新闻，继续处理下一条

        # 输出筛选统计
        if skipped_old > 0 or skipped_future > 0:
            print(f"   ⏩ 已跳过: {skipped_old} 条旧新闻, {skipped_future} 条新新闻")
        
        crawler_error_handler.log_info(
            f"成功抓取 {len(news_list)} 条新闻: {feed_name}"
        )
        return news_list
        
    except Exception as e:
        crawler_error_handler.log_error(e, f"抓取RSS源失败: {feed_name}", critical=True)
        return []

def get_all_news():
    all_news = []
    for name, config in RSS_FEEDS.items():
        news = fetch_news(config, name)
        all_news.extend(news)
        time.sleep(1)  # 避免请求过快
    return all_news

def save_to_supabase(news_items):
    """保存新闻到Supabase，带错误处理"""
    crawler_error_handler.log_info(f"开始保存 {len(news_items)} 条新闻到数据库")
    
    count_success = 0
    count_failed = 0
    
    for item in news_items:
        try:
            # Check for duplicates based on title (optional, simple check)
            # For now, just insert.
            supabase.table('news').insert(item).execute()
            print(f"   ✅ Saved: {item['title'][:30]}...")
            count_success += 1
        except Exception as e:
            count_failed += 1
            crawler_error_handler.log_error(
                e, 
                f"保存新闻失败: {item['title'][:30]}"
            )
    
    crawler_error_handler.log_info(
        f"保存完成: 成功 {count_success}/{len(news_items)} 条, 失败 {count_failed} 条"
    )
    
    if count_failed > 0:
        print(f"\n⚠️  有 {count_failed} 条新闻保存失败，请查看日志")

if __name__ == "__main__":
    crawler_error_handler.log_info("=" * 60)
    crawler_error_handler.log_info("开始运行RSS爬虫")
    crawler_error_handler.log_info("=" * 60)
    
    news = get_all_news()
    
    if news:
        save_to_supabase(news)
    else:
        crawler_error_handler.log_warning("未抓取到任何新闻", "Main")
    
    # 输出错误摘要
    print(crawler_error_handler.get_error_summary())
    
    crawler_error_handler.log_info("=" * 60)
    crawler_error_handler.log_info("爬虫运行结束")
    crawler_error_handler.log_info("=" * 60)

