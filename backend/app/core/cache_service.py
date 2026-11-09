import json
import time
from typing import Any, Optional
from app.core.config import settings

class CacheService:
    """
    Dịch vụ quản lý bộ nhớ đệm hiệu năng cao:
    - Đấu nối máy chủ Redis nếu REDIS_URL khả dụng.
    - Tự động Fallback sang bộ nhớ đệm In-Memory kèm TTL nếu Redis chưa online.
    """

    _redis_client = None
    _memory_cache = {}
    _memory_expiry = {}

    @classmethod
    def _get_client(cls):
        if cls._redis_client is None:
            try:
                import redis
                client = redis.from_url(settings.REDIS_URL, decode_responses=True, socket_timeout=2)
                client.ping()
                cls._redis_client = client
                print("Connected to Redis cache server at:", settings.REDIS_URL)
            except Exception as e:
                cls._redis_client = False
                print(f"Redis not available, fallback to In-Memory TTL Cache (Reason: {e})")
        return cls._redis_client

    @classmethod
    def get(cls, key: str) -> Optional[Any]:
        client = cls._get_client()
        if client:
            try:
                val = client.get(key)
                if val:
                    return json.loads(val)
            except Exception:
                pass
            return None
        
        # Memory Cache Fallback
        now = time.time()
        if key in cls._memory_cache:
            if now < cls._memory_expiry.get(key, 0):
                return cls._memory_cache[key]
            else:
                del cls._memory_cache[key]
                if key in cls._memory_expiry:
                    del cls._memory_expiry[key]
        return None

    @classmethod
    def set(cls, key: str, value: Any, ttl: int = 3600) -> bool:
        client = cls._get_client()
        serialized = json.dumps(value, ensure_ascii=False)
        if client:
            try:
                client.setex(key, ttl, serialized)
                return True
            except Exception:
                pass
        
        # Memory Cache Fallback
        cls._memory_cache[key] = value
        cls._memory_expiry[key] = time.time() + ttl
        
        # Giới hạn kích thước cache trong RAM tối đa 500 mục
        if len(cls._memory_cache) > 500:
            oldest = next(iter(cls._memory_cache))
            del cls._memory_cache[oldest]
            if oldest in cls._memory_expiry:
                del cls._memory_expiry[oldest]
        return True

    @classmethod
    def delete(cls, key: str) -> bool:
        client = cls._get_client()
        if client:
            try:
                client.delete(key)
            except Exception:
                pass
        if key in cls._memory_cache:
            del cls._memory_cache[key]
        if key in cls._memory_expiry:
            del cls._memory_expiry[key]
        return True

    @classmethod
    def flush(cls):
        client = cls._get_client()
        if client:
            try:
                client.flushdb()
            except Exception:
                pass
        cls._memory_cache.clear()
        cls._memory_expiry.clear()
