"""
临时测试脚本：插入各分类的模拟新闻数据用于测试前端分类功能
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 各分类的测试新闻数据
test_news = [
    # 科技类
    {
        "source": "36氪",
        "title": "OpenAI发布GPT-5，性能提升显著",
        "summary": "OpenAI今日宣布发布GPT-5模型，在多项基准测试中表现出色...",
        "content": "OpenAI今日宣布发布GPT-5模型，在多项基准测试中表现出色，特别是在推理和创意写作方面有显著提升。",
        "link": "https://example.com/news1",
        "tags": ["AI", "科技", "GPT"],
        "sentiment": "positive",
        "image_url": "https://picsum.photos/200/300?random=101",
        "category": "tech",
        "is_high_risk": False
    },
    {
        "source": "极客公园",
        "title": "苹果Vision Pro国行版即将发布",
        "summary": "消息称苹果Vision Pro将于下月在中国发布，售价预计28000元起...",
        "content": "据可靠消息，苹果Vision Pro将于下月在中国正式发布，售价预计28000元起。",
        "link": "https://example.com/news2",
        "tags": ["苹果", "VR", "科技"],
        "sentiment": "neutral",
        "image_url": "https://picsum.photos/200/300?random=102",
        "category": "tech",
        "is_high_risk": False
    },
    {
        "source": "InfoQ",
        "title": "Rust语言成为Linux内核第二官方语言",
        "summary": "Linux基金会宣布Rust成为内核开发的第二官方语言...",
        "content": "Linux基金会正式宣布Rust成为Linux内核开发的第二官方语言，这标志着系统编程进入新时代。",
        "link": "https://example.com/news3",
        "tags": ["编程", "Rust", "Linux"],
        "sentiment": "positive",
        "image_url": "https://picsum.photos/200/300?random=103",
        "category": "tech",
        "is_high_risk": False
    },
    
    # 财经类
    {
        "source": "新浪财经",
        "title": "央行宣布降准0.5个百分点",
        "summary": "中国人民银行今日宣布下调金融机构存款准备金率0.5个百分点...",
        "content": "中国人民银行今日宣布，为支持实体经济发展，决定下调金融机构存款准备金率0.5个百分点。",
        "link": "https://example.com/news4",
        "tags": ["金融", "央行", "货币政策"],
        "sentiment": "positive",
        "image_url": "https://picsum.photos/200/300?random=104",
        "category": "finance",
        "is_high_risk": False
    },
    {
        "source": "网易财经",
        "title": "A股三大指数集体上涨，沪指涨1.2%",
        "summary": "今日A股三大指数集体上涨，沪指涨1.2%，深成指涨1.5%...",
        "content": "今日A股市场表现强劲，三大指数集体上涨，沪指收涨1.2%，深成指涨1.5%，创业板指涨1.8%。",
        "link": "https://example.com/news5",
        "tags": ["股市", "A股", "市场"],
        "sentiment": "positive",
        "image_url": "https://picsum.photos/200/300?random=105",
        "category": "finance",
        "is_high_risk": False
    },
    {
        "source": "新浪财经",
        "title": "某大型房企暴雷，债务违约风险加剧",
        "summary": "某大型房地产企业宣布债务重组，多只债券面临违约风险...",
        "content": "某大型房地产企业今日宣布启动债务重组程序，多只债券面临违约风险，引发市场关注。",
        "link": "https://example.com/news6",
        "tags": ["房地产", "债务", "风险"],
        "sentiment": "negative",
        "image_url": "https://picsum.photos/200/300?random=106",
        "category": "finance",
        "is_high_risk": True
    },
    
    # 政策类
    {
        "source": "新华社",
        "title": "国务院发布数字经济发展规划",
        "summary": "国务院印发《数字经济发展规划（2026-2030年）》...",
        "content": "国务院日前印发《数字经济发展规划（2026-2030年）》，明确了未来5年数字经济发展的主要目标。",
        "link": "https://example.com/news7",
        "tags": ["政策", "数字经济", "规划"],
        "sentiment": "positive",
        "image_url": "https://picsum.photos/200/300?random=107",
        "category": "policy",
        "is_high_risk": False
    },
    {
        "source": "新华社",
        "title": "新版网络安全法实施细则发布",
        "summary": "工信部发布新版网络安全法实施细则，加强数据保护监管...",
        "content": "工信部今日发布新版网络安全法实施细则，进一步加强对个人信息和重要数据的保护监管。",
        "link": "https://example.com/news8",
        "tags": ["网络安全", "法规", "数据保护"],
        "sentiment": "neutral",
        "image_url": "https://picsum.photos/200/300?random=108",
        "category": "policy",
        "is_high_risk": False
    },
    
    # 人文类
    {
        "source": "澎湃新闻",
        "title": "故宫博物院推出数字展览新体验",
        "summary": "故宫博物院利用AR技术打造沉浸式文物展览...",
        "content": "故宫博物院今日宣布推出全新数字展览体验，利用AR技术让观众近距离感受文物魅力。",
        "link": "https://example.com/news9",
        "tags": ["文化", "博物馆", "科技"],
        "sentiment": "positive",
        "image_url": "https://picsum.photos/200/300?random=109",
        "category": "culture",
        "is_high_risk": False
    },
    {
        "source": "知乎日报",
        "title": "如何理解元宇宙对传统文化的影响",
        "summary": "元宇宙技术为传统文化传播带来新机遇...",
        "content": "元宇宙技术的发展为传统文化的保护和传播带来了新的机遇和挑战，专家解读其深远影响。",
        "link": "https://example.com/news10",
        "tags": ["文化", "元宇宙", "传统"],
        "sentiment": "neutral",
        "image_url": "https://picsum.photos/200/300?random=110",
        "category": "culture",
        "is_high_risk": False
    },
]

print("📥 开始插入测试新闻数据...")
count = 0
for item in test_news:
    try:
        # 检查是否已存在
        existing = supabase.table('news').select('id').eq('title', item['title']).execute()
        if existing.data:
            print(f"   ⏭️  跳过重复: {item['title'][:30]}...")
            continue
        
        supabase.table('news').insert(item).execute()
        print(f"   ✅ 已插入: {item['title'][:30]}... [分类: {item['category']}]")
        count += 1
    except Exception as e:
        print(f"   ❌ 插入失败: {item['title'][:30]}... - {e}")

print(f"\n🎉 测试数据插入完成！成功插入 {count}/{len(test_news)} 条")
print(f"\n📊 分类统计:")
print(f"   科技: {len([n for n in test_news if n['category'] == 'tech'])} 条")
print(f"   财经: {len([n for n in test_news if n['category'] == 'finance'])} 条")
print(f"   政策: {len([n for n in test_news if n['category'] == 'policy'])} 条")
print(f"   人文: {len([n for n in test_news if n['category'] == 'culture'])} 条")
print(f"   高风险: {len([n for n in test_news if n['is_high_risk']])} 条")
