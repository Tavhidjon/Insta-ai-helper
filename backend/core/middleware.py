import time
import logging

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware:
    """Logs every request with timing."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.time()
        response = self.get_response(request)
        duration = time.time() - start

        logger.info(
            f'{request.method} {request.path} '
            f'status={response.status_code} '
            f'duration={duration:.3f}s '
            f'user={getattr(request.user, "id", "anon")}'
        )
        return response
