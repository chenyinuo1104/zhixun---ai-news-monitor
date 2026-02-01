-- 修复 Supabase RLS 策略，允许插入新闻数据
-- 
-- 问题：Error code '42501' - new row violates row-level security policy
-- 解决：为 news 表添加允许匿名插入的策略

-- 1. 启用 RLS（如果还没启用）
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- 2. 删除可能存在的旧策略
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON news;
DROP POLICY IF EXISTS "Enable insert for all users" ON news;

-- 3. 创建新策略：允许所有人插入（适用于新闻爬虫）
CREATE POLICY "Allow public insert for news crawler"
ON news
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 4. 允许所有人读取新闻（前端需要）
DROP POLICY IF EXISTS "Enable read for all users" ON news;
CREATE POLICY "Allow public read"
ON news
FOR SELECT
TO anon, authenticated
USING (true);

-- 验证策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'news';
