@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   新闻爬虫调度服务
echo ========================================
echo.
echo 📌 功能说明：
echo    - 每天凌晨 2:00 自动运行爬虫
echo    - 从 RSS 源获取最新新闻
echo    - 自动存入 Supabase 数据库
echo.
echo 💡 提示：
echo    - 按 Ctrl+C 可停止服务
echo    - 日志保存在 crawler_schedule.log
echo.
echo ========================================
echo.
echo 正在启动服务...
echo.
python scheduler_service.py
pause
