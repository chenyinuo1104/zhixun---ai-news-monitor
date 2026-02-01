# 🤖 定时自动爬取新闻 - 使用指南

本项目提供了两种自动化新闻爬取方案，按需选择使用。

---

## 方案一：本地后台调度服务（推荐）

### ✨ 特点
- ✅ 完全免费
- ✅ 配置简单
- ✅ 每天凌晨2点自动运行
- ✅ 完整的日志记录
- ✅ 适合本地开发和小型部署

### 📋 前置要求
- Python 3.8+
- 已配置 `.env` 文件（Supabase 凭证）

### 🚀 快速开始

#### 1. 安装依赖

```bash
cd scripts
pip install -r requirements.txt
```

这会安装 `schedule` 库（用于任务调度）。

#### 2. 启动服务

**Windows 用户**:
```bash
cd scripts
start_scheduler.bat
```

**Linux/macOS 用户**:
```bash
cd scripts
python scheduler_service.py
```

#### 3. 验证运行

启动后，你会看到：
```
🚀 新闻爬虫调度服务启动
📁 工作目录: C:\...\scripts
📝 日志文件: C:\...\scripts\crawler_schedule.log
⏰ 已配置定时任务: 每天 02:00 执行
✨ 调度服务运行中...
💡 按 Ctrl+C 停止服务
```

### ⚙️ 自定义调度时间

编辑 `scheduler_service.py`，修改第 64 行：

```python
# 每天凌晨2点运行（默认）
schedule.every().day.at("02:00").do(run_crawler)

# 或者每4小时运行一次
# schedule.every(4).hours.do(run_crawler)

# 或者每30分钟运行一次（测试用）
# schedule.every(30).minutes.do(run_crawler)
```

### 📝 查看日志

所有执行记录保存在 `crawler_schedule.log`:

```bash
cd scripts
type crawler_schedule.log    # Windows
cat crawler_schedule.log     # Linux/macOS
```

### 🔄 后台运行（可选）

**Windows - 使用 NSSM 注册为服务**:
```bash
# 下载 NSSM: https://nssm.cc/download
nssm install NewsScheduler "C:\Python\python.exe" "C:\path\to\scripts\scheduler_service.py"
nssm start NewsScheduler
```

**Linux - 使用 systemd**:

创建 `/etc/systemd/system/news-scheduler.service`:
```ini
[Unit]
Description=News Crawler Scheduler
After=network.target

[Service]
Type=simple
User=your_username
WorkingDirectory=/path/to/scripts
ExecStart=/usr/bin/python3 /path/to/scripts/scheduler_service.py
Restart=always

[Install]
WantedBy=multi-user.target
```

启动服务:
```bash
sudo systemctl enable news-scheduler
sudo systemctl start news-scheduler
```

---

## 方案二：GitHub Actions（云端自动化）

### ✨ 特点
- ✅ 完全自动化，无需本地机器运行
- ✅ 高可用性
- ✅ 自动记录执行日志
- ✅ 适合开源项目和长期维护

### 📋 前置要求
- GitHub 仓库（公开或私有均可）
- GitHub Actions 权限

### 🚀 配置步骤

#### 1. 已创建工作流文件

文件位置：`.github/workflows/crawl-news.yml`

配置内容：
- ⏰ 每天 UTC 18:00（北京时间凌晨 2:00）自动运行
- 🔧 支持手动触发

#### 2. 配置 GitHub Secrets

进入你的 GitHub 仓库：

1. 点击 `Settings` → `Secrets and variables` → `Actions`
2. 点击 `New repository secret`
3. 添加以下 Secrets：

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | 你的 Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | 你的 Supabase Anon Key |

#### 3. 启用 GitHub Actions

1. 进入仓库的 `Actions` 标签页
2. 如果是第一次使用，点击 `I understand my workflows, go ahead and enable them`
3. 找到 "Auto Crawl News" 工作流

#### 4. 测试运行

**手动触发**:
1. 进入 `Actions` → `Auto Crawl News`
2. 点击 `Run workflow` → `Run workflow`
3. 等待执行完成
4. 查看执行日志

**查看定时执行**:
- 工作流会在每天北京时间凌晨 2:00 自动运行
- 查看执行历史：`Actions` 标签页

#### 5. 查看日志

在每次运行的详情页中：
1. 点击执行记录
2. 查看 "Run news crawler" 步骤的日志
3. 如果有错误，可以下载 `crawler-logs` artifacts

---

## 🔍 常见问题

### Q1: 服务可以同时运行吗？

**可以！** 两种方案可以同时使用：
- 本地服务用于开发和测试
- GitHub Actions 用于生产和备份

但建议避免同时在完全相同的时间运行，以减少数据库压力。

### Q2: 如何验证爬虫正常运行？

**方法1 - 查看日志**:
```bash
# 本地服务
cat scripts/crawler_schedule.log

# GitHub Actions
进入 Actions 标签页查看执行记录
```

**方法2 - 检查数据库**:
- 登录 Supabase 控制台
- 查看 `news` 表的最新数据
- 检查 `created_at` 时间戳

**方法3 - 前端验证**:
- 打开舆情看板页面
- 查看时间显示为"刚刚"或"X分钟前"的新闻

### Q3: 爬虫执行失败怎么办？

**检查步骤**:
1. 查看日志文件中的错误信息
2. 确认 `.env` 配置正确
3. 测试手动运行：`python scripts/main_pipeline.py`
4. 检查网络连接和 RSS 源是否可访问

### Q4: 如何调整爬取频率？

**本地服务**:
编辑 `scheduler_service.py` 第 64-70 行

**GitHub Actions**:
编辑 `.github/workflows/crawl-news.yml` 第 6 行的 cron 表达式

Cron 表达式示例：
```yaml
# 每天凌晨2点
- cron: '0 18 * * *'  # UTC 18:00 = 北京时间 02:00

# 每12小时
- cron: '0 */12 * * *'

# 每周一凌晨2点
- cron: '0 18 * * 1'
```

### Q5: 如何停止服务？

**本地服务**:
- 在终端按 `Ctrl+C`
- 如果注册为系统服务：
  - Windows: `nssm stop NewsScheduler`
  - Linux: `sudo systemctl stop news-scheduler`

**GitHub Actions**:
- 删除或禁用 `.github/workflows/crawl-news.yml`
- 或者注释掉 `schedule` 触发器

---

## 📊 监控和维护

### 推荐监控指标

1. **执行成功率** - 查看爬虫是否正常运行
2. **新闻数量** - 每次爬取的新闻数量
3. **执行时间** - 单次执行耗时
4. **错误日志** - 记录异常情况

### 日志示例

```
[2026-02-01 02:00:00] [INFO] ============================================================
[2026-02-01 02:00:00] [INFO] 开始执行爬虫任务
[2026-02-01 02:00:00] [INFO] ============================================================
[2026-02-01 02:00:05] [INFO] 执行输出:
Fetching news from RSS...
   Fetched 15 items.
Processing and saving...
   Saved: DeepMind 发布新...
...
Pipeline finished! Added 12 new items.
[2026-02-01 02:00:05] [SUCCESS] ✅ 爬虫任务执行成功
```

---

## 🎯 最佳实践

1. **定期查看日志**：每周检查一次执行日志
2. **测试新爬虫源**：先手动测试，确认无误后加入定时任务
3. **备份配置**：定期备份 `.env` 和配置文件
4. **监控数据库**：注意 Supabase 存储空间使用情况
5. **版本控制**：将配置文件（不含敏感信息）提交到 Git

---

## 🆘 获取帮助

如果遇到问题：

1. 查看日志文件
2. 检查 Supabase 连接
3. 确认 Python 环境和依赖
4. 查看 GitHub Actions 执行详情

需要更多帮助？请提供：
- 错误日志
- 执行环境（OS、Python 版本）
- 具体的错误信息

---

Happy Automation! 🎉
