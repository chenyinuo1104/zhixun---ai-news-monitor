@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   快速运行爬虫 - 获取新闻
echo ========================================
echo.
echo 正在运行爬虫，从10个新闻源获取最新内容...
echo.

cd /d %~dp0

REM 尝试使用python运行
python main_pipeline.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️  Python环境可能有问题
    echo 💡 解决方案：
    echo    1. 确保已安装Python依赖：pip install -r requirements.txt
    echo    2. 或者使用：python -m pip install feedparser python-dotenv jieba
    echo.
)

echo.
pause
