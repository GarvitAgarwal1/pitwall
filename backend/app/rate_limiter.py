import asyncio
import time
from typing import Optional


class TokenBucket:
    """A single token bucket supporting refill over time."""

    def __init__(self, capacity: float, refill_rate: float) -> None:
        self.capacity = float(capacity)
        self.refill_rate = float(refill_rate)
        self.tokens = float(capacity)
        self.last_update = time.monotonic()

    def update(self, now: float) -> None:
        elapsed = now - self.last_update
        self.tokens = min(self.capacity, self.tokens + elapsed * self.refill_rate)
        self.last_update = now

    def wait_time_for_token(self) -> float:
        if self.tokens >= 1.0:
            return 0.0
        return (1.0 - self.tokens) / self.refill_rate

    def consume(self) -> bool:
        if self.tokens >= 1.0:
            self.tokens -= 1.0
            return True
        return False


class RateLimiter:
    """
    Dual token-bucket rate limiter enforcing both short-term burst limits
    (e.g., 3 requests per second) and long-term sustained limits
    (e.g., 30 requests per minute).
    """

    def __init__(
        self,
        max_per_second: float = 3.0,
        max_per_minute: float = 30.0,
    ) -> None:
        self.burst_bucket = TokenBucket(
            capacity=max_per_second,
            refill_rate=max_per_second,
        )
        self.sustained_bucket = TokenBucket(
            capacity=max_per_minute,
            refill_rate=max_per_minute / 60.0,
        )
        self._lock = asyncio.Lock()

    async def acquire(self) -> None:
        """Wait until a token is available in both buckets, then consume it."""
        while True:
            async with self._lock:
                now = time.monotonic()
                self.burst_bucket.update(now)
                self.sustained_bucket.update(now)

                wait_burst = self.burst_bucket.wait_time_for_token()
                wait_sustained = self.sustained_bucket.wait_time_for_token()
                wait_time = max(wait_burst, wait_sustained)

                if wait_time <= 0.0:
                    self.burst_bucket.consume()
                    self.sustained_bucket.consume()
                    return

            # Wait outside the lock to let other tasks inspect state
            await asyncio.sleep(wait_time)

    def try_acquire(self) -> bool:
        """Non-blocking attempt to acquire a token."""
        now = time.monotonic()
        self.burst_bucket.update(now)
        self.sustained_bucket.update(now)

        if self.burst_bucket.tokens >= 1.0 and self.sustained_bucket.tokens >= 1.0:
            self.burst_bucket.consume()
            self.sustained_bucket.consume()
            return True
        return False


# Singleton rate limiter instance for OpenF1
openf1_limiter = RateLimiter(max_per_second=3.0, max_per_minute=30.0)
