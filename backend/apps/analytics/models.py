import uuid
from django.db import models
from core.models import BaseModel


class DailyAnalytics(BaseModel):
    """
    Pre-aggregated daily analytics snapshot.
    Computed by Celery beat every night at midnight.
    """
    date = models.DateField(unique=True)

    # Messaging
    total_messages = models.IntegerField(default=0)
    ai_messages = models.IntegerField(default=0)
    human_messages = models.IntegerField(default=0)
    unique_conversations = models.IntegerField(default=0)

    # Leads & bookings
    new_leads = models.IntegerField(default=0)
    bookings_created = models.IntegerField(default=0)
    bookings_completed = models.IntegerField(default=0)
    revenue_estimated = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # AI performance
    avg_response_time_seconds = models.FloatField(default=0)
    ai_handoff_count = models.IntegerField(default=0)
    ai_confidence_avg = models.FloatField(default=0)

    class Meta:
        ordering = ['-date']
        verbose_name = 'Daily Analytics'
        verbose_name_plural = 'Daily Analytics'

    def __str__(self):
        return f"Analytics {self.date}"


class ConversionEvent(BaseModel):
    """
    Tracks each step of the customer conversion funnel.
    """
    EVENT_TYPES = [
        ('message_received', 'Message Received'),
        ('intent_detected', 'Intent Detected'),
        ('car_recommended', 'Car Recommended'),
        ('booking_started', 'Booking Started'),
        ('booking_completed', 'Booking Completed'),
        ('handoff_triggered', 'Handoff Triggered'),
    ]

    conversation_id = models.UUIDField(null=True, blank=True)
    customer_id = models.UUIDField(null=True, blank=True)
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES)
    metadata = models.JSONField(default=dict)
    created_at_hour = models.IntegerField(default=0)  # 0-23 for peak hours chart

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['event_type', 'created_at']),
        ]
