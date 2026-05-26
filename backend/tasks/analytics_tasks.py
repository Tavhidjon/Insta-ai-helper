import logging
from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task
def log_event(event_type: str, payload: dict):
    try:
        from apps.analytics.models import AnalyticsEvent
        AnalyticsEvent.objects.create(
            event_type = event_type,
            payload    = payload,
        )
    except Exception as e:
        logger.error(f'Analytics log error: {e}')
