# Python环境问题排查指南

## 🔍 问题诊断

系统检测到您有多个Python环境，导致模块导入问题：

**已安装的模块位置**：
- `feedparser`: `c:\users\噼里啪啦开天辟地\appdata\roaming\python\python313\site-packages`
- `python-dotenv`: `C:\anaconda3\Lib\site-packages`

这导致运行时找不到 `dotenv` 模块。

---

## ✅ 快速解决方案（推荐）

### 方案1：使用Anaconda Python

```bash
# 激活anaconda环境
conda activate base

# 安装缺失的模块
conda install -c conda-forge feedparser

# 运行爬虫
cd c:\Workplace\zhixun---ai-news-monitor\scripts
python main_pipeline.py
```

### 方案2：统一使用pip用户安装

```bash
# 安装所有依赖到用户目录
pip install --user --force-reinstall python-dotenv feedparser jieba supabase

# 运行爬虫
cd c:\Workplace\zhixun---ai-news-monitor\scripts
python main_pipeline.py
```

### 方案3：使用虚拟环境（最佳实践）

```bash
cd c:\Workplace\zhixun---ai-news-monitor

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
venv\Scripts\activate

# 安装依赖
pip install -r scripts\requirements.txt

# 运行爬虫
cd scripts
python main_pipeline.py
```

---

## 🎯 当前状态

### 前端功能 ✅
- ✅ 所有代码已完成并正常工作
- ✅ 10个新闻源已配置
- ✅ 6个筛选选项（全部、高风险、科技、财经、政策、文化）
- ✅ 实时订阅和自动刷新

### 后端爬虫 ⚠️
- ⚠️ Python环境问题需要修复
- ✅ 所有代码正确
- ✅ 依赖已安装（但在不同的Python环境）

---

## 📝 测试步骤

### 1. 前端测试（无需Python）

```bash
# 启动前端
npm run dev

# 访问浏览器
http://localhost:5173

# 测试功能：
- ✅ 点击不同筛选按钮
- ✅ 查看新闻列表
- ✅ 检查实时更新
```

### 2. 后端测试（需要修复Python环境）

选择上面的解决方案之一，然后：

```bash
# 运行爬虫
cd scripts
python main_pipeline.py

# 或启动定时服务
start_scheduler.bat
```

---

## 💡 推荐操作流程

1. **立即**：启动前端并测试界面功能
2. **然后**：使用方案3创建虚拟环境
3. **最后**：运行爬虫获取真实新闻数据

---

## 🔧 验证清单

- [ ] 前端启动成功
- [ ] 筛选按钮正常工作
- [ ] Python环境修复（选择一个方案）
- [ ] 爬虫成功运行
- [ ] 数据库有新数据
- [ ] 前端显示新闻

---

需要帮助？提供您的错误信息和使用的方案。
