# 📰 新闻源配置说明

本文档说明了系统中配置的所有新闻源及其分类。

---

## 📊 新闻源总览

系统当前配置了 **10个** RSS 新闻源，分为 4 大类别：

| 类别 | 数量 | 说明 |
|------|------|------|
| 科技 (tech) | 5个 | 科技新闻、创业、数码 |
| 财经 (finance) | 1个 | 财经、金融、市场 |
| 政策 (policy) | 1个 | 时政、政策 |
| 文化 (culture) | 1个 | 人文、文化、艺术 |

---

## 🔧 科技类新闻源 (5个)

### 1. CNBeta
- **URL**: https://www.cnbeta.com.tw/backend.php
- **分类**: tech
- **标签**: 科技、硬件
- **说明**: 知名科技资讯网站，涵盖硬件、软件、互联网、科学等

### 2. 36氪
- **URL**: https://36kr.com/feed
- **分类**: tech
- **标签**: 创业、科技
- **说明**: 科技创业媒体，关注创业公司、投融资、商业模式

### 3. 爱范儿
- **URL**: https://www.ifanr.com/feed
- **分类**: tech
- **标签**: 科技、数码
- **说明**: 消费科技媒体，报道数码产品、创新趋势

### 4. 虎嗅
- **URL**: https://www.huxiu.com/rss/0.xml
- **分类**: tech
- **标签**: 科技、商业
- **说明**: 深度商业科技媒体，关注科技商业分析

### 5. 钛媒体
- **URL**: https://www.tmtpost.com/rss.xml
- **分类**: tech
- **标签**: 科技、创新
- **说明**: 科技财经媒体，关注科技创新和产业趋势

---

## 💰 财经类新闻源 (1个)

### 6. 第一财经
- **URL**: https://www.yicai.com/rss/rss.xml
- **分类**: finance
- **标签**: 财经、市场
- **说明**: 权威财经媒体，覆盖财经、金融、市场动态

---

## 📋 政策类新闻源 (1个)

### 7. 人民网
- **URL**: http://www.people.com.cn/rss/politics.xml
- **分类**: policy
- **标签**: 政策、时事
- **说明**: 权威时政新闻，国内政策、时事要闻

---

## 🎨 文化类新闻源 (1个)

### 8. 三联生活周刊
- **URL**: https://www.lifeweek.com.cn/feed
- **分类**: culture
- **标签**: 文化、人文
- **说明**: 知名文化杂志，深度人文、文化、生活报道

---

## ⚙️ 如何添加新的新闻源

编辑 `scripts/rss_crawler.py`，在 `RSS_FEEDS` 字典中添加：

```python
RSS_FEEDS = {
    # ... 现有配置 ...
    
    "新源名称": {
        "url": "RSS源的URL",
        "category": "tech",  # tech/finance/policy/culture
        "tags": ["标签1", "标签2"],
        "is_high_risk_source": False  # 是否为高风险新闻源
    },
}
```

### 可用的分类 (category)

- `tech` - 科技
- `finance` - 财经
- `policy` - 政策
- `culture` - 文化

### 建议的其他RSS源

**科技类**:
- IT之家: `https://www.ithome.com/rss/`
- GeekPark: `https://www.geekpark.net/rss`
- TechWeb: `http://www.techweb.com.cn/rss/allnews.xml`

**财经类**:
- 财新网: `https://www.caixin.com/rss/`
- 华尔街见闻: 需要API
- 新浪财经: `https://finance.sina.com.cn/roll/finance_roll.shtml`

**综合新闻**:
- 新华网: `http://www.news.cn/politics/news_politics.xml`
- 央视网: `http://news.cctv.com/rss/china.xml`

---

## 🧪 测试新闻源

运行测试脚本检查所有新闻源是否正常：

```bash
cd scripts
python test_feeds.py
```

测试脚本会：
- ✅ 检查每个源是否可访问
- ✅ 显示获取的新闻数量
- ✅ 按分类统计
- ✅ 列出失败的源

---

## 📝 注意事项

1. **RSS源稳定性**: 某些RSS源可能不稳定或失效，定期检查
2. **访问频率**: 代码中已加入 `time.sleep(1)` 避免请求过快
3. **分类准确性**: 确保新闻源的分类与实际内容匹配
4. **标签相关性**: 标签应该准确描述新闻源的主题

---

## 🔄 自动分类逻辑

系统会根据新闻源配置自动设置：
- **category**: 新闻分类（在前端筛选时使用）
- **tags**: 新闻标签（在新闻卡片上显示）
- **is_high_risk**: 是否标记为高风险新闻

这样前端的筛选功能（全部/高风险/科技/人文/财经）就可以正确工作了！
