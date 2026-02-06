-- 为news表添加images字段以存储多张图片URL
-- 运行此SQL之前请确保已连接到Supabase数据库

-- 添加images字段（文本数组类型）
ALTER TABLE news 
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- 添加注释
COMMENT ON COLUMN news.images IS '新闻正文中的所有图片URL列表';

-- 更新现有数据：如果image_url存在，将其复制到images数组
UPDATE news 
SET images = ARRAY[image_url]::text[]
WHERE image_url IS NOT NULL AND image_url != '' AND images = '{}';
