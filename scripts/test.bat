@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   舆情看板功能测试
echo ========================================
echo.
echo 📌 请确保：
echo    1. 开发服务器已启动 (npm run dev)
echo    2. 浏览器已打开舆情看板页面
echo.
echo 按任意键开始插入测试数据...
pause >nul
echo.
echo 🚀 正在插入测试新闻...
echo.
python test_insert.py
echo.
echo ========================================
echo   测试完成！
echo ========================================
echo.
echo 💡 现在请检查浏览器：
echo    - 新闻应该自动出现（无需刷新）
echo    - 时间显示为"刚刚"
echo    - 打开 F12 查看控制台日志
echo.
pause
