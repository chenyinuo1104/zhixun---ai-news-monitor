# 🔧 修复 Supabase RLS 策略问题

## 问题
保存新闻时出现错误：`code: '42501', message: 'new row violates row-level security policy for table "news"'`

## 原因
Supabase 数据库的 `news` 表启用了 Row Level Security (RLS)，但没有允许插入数据的策略。

## 解决方案

### 方法1：在 Supabase Dashboard 执行（推荐）

1. 登录 Supabase Dashboard: https://supabase.com
2. 选择你的项目
3. 点击左侧 `SQL Editor`
4. 复制并执行以下 SQL：

```sql
-- 为 news 表添加允许插入的策略
CREATE POLICY "Allow public insert for news crawler"
ON news
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 允许所有人读取新闻
CREATE POLICY "Allow public read"
ON news
FOR SELECT
TO anon, authenticated
USING (true);
```

5. 点击 `Run` 执行

### 方法2：使用 SQL 文件

在项目目录中有 `supabase/fix_rls_policy.sql` 文件，包含完整的修复SQL。

### 验证修复

运行爬虫：
```bash
cd scripts
python main_pipeline.py
```

应该看到：
```
[*] Fetching news from: 新华社 (http://...)
[+] Successfully fetched 20 items from 新华社
   ✅ Saved: ...
Pipeline finished! Added 20 new items.
```

## 技术说明

RLS（Row Level Security）是 PostgreSQL 的安全特性，控制谁可以访问表中的哪些行。

我们创建的策略允许：
- `anon` 用户（使用 anon key 的客户端）可以插入和读取
- `authenticated` 用户也可以插入和读取

这样爬虫（使用 anon key）就可以正常保存新闻了。
