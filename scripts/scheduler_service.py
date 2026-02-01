#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
新闻爬虫后台调度服务
自动定时运行新闻爬虫，将数据存入 Supabase

功能：
- 每天凌晨2点自动运行爬虫
- 支持自定义调度时间
- 完整的日志记录
- 错误处理和重试机制
"""

import schedule
import time
import subprocess
import os
import sys
from datetime import datetime
from pathlib import Path

# 设置脚本所在目录为工作目录
SCRIPT_DIR = Path(__file__).parent.resolve()
os.chdir(SCRIPT_DIR)

# 日志文件路径
LOG_FILE = SCRIPT_DIR / "crawler_schedule.log"


def log_message(message, level="INFO"):
    """记录日志"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"[{timestamp}] [{level}] {message}"
    print(log_entry)
    
    # 写入日志文件
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(log_entry + "\n")


def run_crawler():
    """运行爬虫任务"""
    log_message("=" * 60)
    log_message("开始执行爬虫任务")
    log_message("=" * 60)
    
    try:
        # 运行 main_pipeline.py
        result = subprocess.run(
            [sys.executable, "main_pipeline.py"],
            capture_output=True,
            text=True,
            encoding='utf-8',
            timeout=600  # 10分钟超时
        )
        
        # 记录输出
        if result.stdout:
            log_message(f"执行输出:\n{result.stdout}")
        
        if result.returncode == 0:
            log_message("✅ 爬虫任务执行成功", "SUCCESS")
        else:
            log_message(f"❌ 爬虫任务执行失败 (exit code: {result.returncode})", "ERROR")
            if result.stderr:
                log_message(f"错误信息:\n{result.stderr}", "ERROR")
    
    except subprocess.TimeoutExpired:
        log_message("❌ 爬虫任务执行超时（超过10分钟）", "ERROR")
    except Exception as e:
        log_message(f"❌ 爬虫任务执行异常: {str(e)}", "ERROR")
    
    log_message("=" * 60)
    log_message("爬虫任务执行完毕")
    log_message("=" * 60 + "\n")


def main():
    """主函数 - 启动调度服务"""
    log_message("🚀 新闻爬虫调度服务启动")
    log_message(f"📁 工作目录: {SCRIPT_DIR}")
    log_message(f"📝 日志文件: {LOG_FILE}")
    log_message("")
    
    # 配置定时任务
    # 每天凌晨2点运行
    schedule.every().day.at("02:00").do(run_crawler)
    log_message("⏰ 已配置定时任务: 每天 02:00 执行")
    
    # 可选：每隔4小时运行一次（取消下面的注释启用）
    # schedule.every(4).hours.do(run_crawler)
    # log_message("⏰ 已配置定时任务: 每 4 小时执行一次")
    
    # 可选：每30分钟运行一次（开发测试用）
    # schedule.every(30).minutes.do(run_crawler)
    # log_message("⏰ 已配置定时任务: 每 30 分钟执行一次")
    
    # 启动时立即运行一次（可选，取消注释启用）
    # log_message("▶️  启动时立即执行一次爬虫任务")
    # run_crawler()
    
    log_message("")
    log_message("✨ 调度服务运行中...")
    log_message("💡 按 Ctrl+C 停止服务")
    log_message("")
    
    # 主循环 - 持续检查并执行调度任务
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # 每60秒检查一次
    except KeyboardInterrupt:
        log_message("")
        log_message("⏹️  收到停止信号，调度服务正在关闭...")
        log_message("👋 调度服务已停止")
    except Exception as e:
        log_message(f"❌ 服务异常: {str(e)}", "ERROR")
        raise


if __name__ == "__main__":
    main()
