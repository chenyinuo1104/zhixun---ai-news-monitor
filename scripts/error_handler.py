"""
错误处理和重试机制模块
提供统一的重试装饰器和错误日志记录
"""
import functools
import time
import logging
from typing import Callable, Any, Optional
import traceback

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('crawler.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)


class RetryException(Exception):
    """重试失败异常"""
    pass


def retry_on_failure(
    max_attempts: int = 3,
    delay: float = 1.0,
    backoff: float = 2.0,
    exceptions: tuple = (Exception,),
    on_retry: Optional[Callable] = None
):
    """
    重试装饰器
    
    Args:
        max_attempts: 最大尝试次数
        delay: 初始延迟时间（秒）
        backoff: 延迟倍数（指数退避）
        exceptions: 需要重试的异常类型
        on_retry: 重试时的回调函数
        
    Usage:
        @retry_on_failure(max_attempts=3, delay=1.0)
        def fetch_data():
            # 可能失败的操作
            pass
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            current_delay = delay
            last_exception = None
            
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    
                    if attempt == max_attempts:
                        logger.error(
                            f"函数 {func.__name__} 在 {max_attempts} 次尝试后失败: {str(e)}"
                        )
                        break
                    
                    logger.warning(
                        f"函数 {func.__name__} 第 {attempt}/{max_attempts} 次尝试失败: {str(e)}"
                    )
                    logger.warning(f"   将在 {current_delay:.1f} 秒后重试...")
                    
                    if on_retry:
                        try:
                            on_retry(attempt, e)
                        except Exception as callback_error:
                            logger.error(f"重试回调函数失败: {callback_error}")
                    
                    time.sleep(current_delay)
                    current_delay *= backoff
                except Exception as e:
                    # 不在重试列表中的异常，直接抛出
                    logger.error(f"函数 {func.__name__} 遇到不可重试的异常: {type(e).__name__}: {str(e)}")
                    raise
            
            # 所有重试都失败
            raise RetryException(
                f"函数 {func.__name__} 在 {max_attempts} 次尝试后仍然失败"
            ) from last_exception
        
        return wrapper
    return decorator


class ErrorHandler:
    """统一错误处理器"""
    
    def __init__(self, name: str = "system"):
        self.name = name
        self.error_count = 0
        self.errors = []
        
    def log_error(self, error: Exception, context: str = "", critical: bool = False):
        """
        记录错误
        
        Args:
            error: 异常对象
            context: 错误上下文信息
            critical: 是否为严重错误
        """
        self.error_count += 1
        
        error_info = {
            'type': type(error).__name__,
            'message': str(error),
            'context': context,
            'traceback': traceback.format_exc(),
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        self.errors.append(error_info)
        
        if critical:
            logger.critical(f"[{self.name}] 严重错误 - {context}: {error}")
            logger.critical(f"堆栈跟踪:\n{error_info['traceback']}")
        else:
            logger.error(f"[{self.name}] 错误 - {context}: {error}")
    
    def log_warning(self, message: str, context: str = ""):
        """记录警告"""
        logger.warning(f"[{self.name}] 警告 - {context}: {message}")
    
    def log_info(self, message: str):
        """记录信息"""
        logger.info(f"[{self.name}] {message}")
    
    def get_error_summary(self) -> str:
        """获取错误摘要"""
        if self.error_count == 0:
            return f"[{self.name}] 运行正常，无错误"
        
        summary = f"\n{'='*60}\n"
        summary += f"[{self.name}] 错误统计\n"
        summary += f"{'='*60}\n"
        summary += f"总错误数: {self.error_count}\n\n"
        
        # 统计错误类型
        error_types = {}
        for error in self.errors:
            error_type = error['type']
            error_types[error_type] = error_types.get(error_type, 0) + 1
        
        summary += "错误类型分布:\n"
        for error_type, count in sorted(error_types.items(), key=lambda x: x[1], reverse=True):
            summary += f"  - {error_type}: {count} 次\n"
        
        summary += f"\n最近 5 个错误:\n"
        for i, error in enumerate(self.errors[-5:], 1):
            summary += f"\n{i}. [{error['timestamp']}] {error['type']}\n"
            summary += f"   上下文: {error['context']}\n"
            summary += f"   信息: {error['message']}\n"
        
        summary += f"{'='*60}\n"
        return summary
    
    def clear_errors(self):
        """清除错误记录"""
        self.error_count = 0
        self.errors.clear()


class HealthChecker:
    """系统健康检查器"""
    
    def __init__(self):
        self.checks = []
        self.status = {}
    
    def add_check(self, name: str, check_func: Callable) -> None:
        """添加健康检查项"""
        self.checks.append((name, check_func))
    
    def run_checks(self) -> dict:
        """运行所有健康检查"""
        results = {
            'healthy': True,
            'checks': {},
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        }
        
        for name, check_func in self.checks:
            try:
                result = check_func()
                results['checks'][name] = {
                    'status': 'pass' if result else 'fail',
                    'details': result if isinstance(result, dict) else {'ok': result}
                }
                
                if not result:
                    results['healthy'] = False
                    
            except Exception as e:
                results['checks'][name] = {
                    'status': 'error',
                    'error': str(e)
                }
                results['healthy'] = False
                logger.error(f"健康检查 '{name}' 失败: {e}")
        
        self.status = results
        return results
    
    def get_status_summary(self) -> str:
        """获取健康状态摘要"""
        if not self.status:
            return "尚未运行健康检查"
        
        summary = f"\n{'='*60}\n"
        summary += "系统健康状态\n"
        summary += f"{'='*60}\n"
        summary += f"整体状态: {'✅ 健康' if self.status['healthy'] else '❌ 异常'}\n"
        summary += f"检查时间: {self.status['timestamp']}\n\n"
        
        for name, result in self.status['checks'].items():
            status_emoji = '✅' if result['status'] == 'pass' else '❌'
            summary += f"{status_emoji} {name}: {result['status']}\n"
            
            if result['status'] == 'error':
                summary += f"   错误: {result.get('error', '未知')}\n"
        
        summary += f"{'='*60}\n"
        return summary


# 创建全局实例
crawler_error_handler = ErrorHandler("Crawler")
system_health_checker = HealthChecker()


# 用于测试
if __name__ == "__main__":
    print("=" * 60)
    print("错误处理和重试机制测试")
    print("=" * 60)
    
    # 测试重试装饰器
    @retry_on_failure(max_attempts=3, delay=0.5, exceptions=(ValueError, ConnectionError))
    def test_retry_success():
        """第二次尝试成功"""
        if not hasattr(test_retry_success, 'attempt'):
            test_retry_success.attempt = 0
        test_retry_success.attempt += 1
        
        if test_retry_success.attempt < 2:
            raise ValueError("模拟失败")
        return "成功！"
    
    @retry_on_failure(max_attempts=3, delay=0.5)
    def test_retry_failure():
        """总是失败"""
        raise ConnectionError("模拟网络错误")
    
    # 测试1: 重试后成功
    print("\n测试1: 重试后成功")
    try:
        result = test_retry_success()
        print(f"✅ 结果: {result}")
    except Exception as e:
        print(f"❌ 失败: {e}")
    
    # 测试2: 重试后仍失败
    print("\n测试2: 重试后仍失败")
    try:
        result = test_retry_failure()
        print(f"结果: {result}")
    except RetryException as e:
        print(f"✅ 预期的失败: {e}")
    
    # 测试3: 错误处理器
    print("\n测试3: 错误处理器")
    handler = ErrorHandler("测试")
    
    try:
        raise ValueError("测试错误1")
    except Exception as e:
        handler.log_error(e, "测试场景1")
    
    try:
        raise ConnectionError("测试错误2")
    except Exception as e:
        handler.log_error(e, "测试场景2", critical=True)
    
    print(handler.get_error_summary())
