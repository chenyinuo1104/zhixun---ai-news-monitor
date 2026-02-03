-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  position text,
  department text,
  constraint username_length check (char_length(username) >= 3)
);

-- NEWS TABLE
create table news (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  source text not null,
  title text not null,
  summary text,
  content text,
  link text,
  tags text[] default '{}',
  sentiment text check (sentiment in ('positive', 'neutral', 'negative')),
  image_url text,
  is_high_risk boolean default false,
  category text
);

-- TRENDS TABLE
create table trends (
  id uuid default uuid_generate_v4() primary key,
  rank integer not null,
  name text not null,
  volume text not null,
  growth integer not null,
  category text, -- 'ai', 'chip', 'digitization', 'metaverse', etc.
  color text
);

-- CHAT MESSAGES TABLE
create table chat_messages (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  content text not null,
  is_ai boolean default false
);

-- SUBSCRIPTIONS TABLE
create table subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  icon text,
  bg_color text
);

-- ROW LEVEL SECURITY (RLS)
alter table profiles enable row level security;
alter table news enable row level security;
alter table trends enable row level security;
alter table chat_messages enable row level security;
alter table subscriptions enable row level security;

-- POLICIES

-- Profiles: Public read, User update own
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- News: Public read
create policy "News are viewable by everyone."
  on news for select
  using ( true );

-- Trends: Public read
create policy "Trends are viewable by everyone."
  on trends for select
  using ( true );

-- Chat Messages: User read/write own
create policy "Users can read own chat messages."
  on chat_messages for select
  using ( auth.uid() = user_id );

create policy "Users can insert own chat messages."
  on chat_messages for insert
  with check ( auth.uid() = user_id );

-- Subscriptions: User read/write own
create policy "Users can read own subscriptions."
  on subscriptions for select
  using ( auth.uid() = user_id );

create policy "Users can insert own subscriptions."
  on subscriptions for insert
  with check ( auth.uid() = user_id );


-- MOCK DATA INSERTS

-- Mock News
insert into news (source, title, tags, sentiment, image_url, is_high_risk, category) values
('TechDaily', '某大型云服务商因垄断行为面临反垄断诉讼', ARRAY['科技'], 'negative', 'https://picsum.photos/100/100?random=1', true, 'tech'),
('GlobalFinance', '央行宣布下调存款准备金率0.5个百分点', ARRAY['金融', '政策'], 'positive', 'https://picsum.photos/100/100?random=2', false, 'finance'),
('AI Weekly', '新一代大规模语言模型发布，性能提升', ARRAY['AI', '科技'], 'positive', 'https://picsum.photos/100/100?random=3', false, 'tech'),
('PolicyWatch', '关于加强数据安全管理的最新指导意见', ARRAY['政策', '安全'], 'neutral', 'https://picsum.photos/100/100?random=4', false, 'policy');

-- Mock Trends
insert into trends (rank, name, volume, growth, color) values
(1, '人工智能', '98.4k', 12, 'from-yellow-300 to-yellow-500'),
(2, '新能源车', '85.2k', 8, 'from-slate-300 to-slate-400'),
(3, '消费复苏', '76.1k', 0, 'from-orange-300 to-orange-400'),
(4, '全球贸易', '54.2k', -5, 'from-slate-100 to-slate-200');

