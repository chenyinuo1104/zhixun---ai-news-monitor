-- 为 news 表添加 content 和 link 字段以支持详情页面
ALTER TABLE news ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE news ADD COLUMN IF NOT EXISTS link TEXT;

-- 更新注释
COMMENT ON COLUMN news.content IS '新闻完整内容';
COMMENT ON COLUMN news.link IS '新闻原文链接';
