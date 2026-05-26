from django.db import models
from django.conf import settings
from core.models import BaseModel


class Notification(BaseModel):
    CHANNEL_CHOICES = [
        ('email',     'Email'),
        ('telegram',  'Telegram'),
        ('dashboard', 'Dashboard'),
    ]
    TYPE_CHOICES = [
        ('new_lead',       'New Lead'),
        ('booking_request','Booking Request'),
        ('human_takeover', 'Human Takeover'),
        ('ai_failure',     'AI Failure'),
        ('general',        'General'),
    ]

    recipient    = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    channel      = models.CharField(max_length=20, choices=CHANNEL_CHOICES)
    notif_type   = models.CharField(max_length=30, choices=TYPE_CHOICES)
    title        = models.CharField(max_length=300)
    message      = models.TextField()
    payload      = models.JSONField(default=dict, blank=True)
    is_read      = models.BooleanField(default=False)
    sent_at      = models.DateTimeField(null=True, blank=True)
    is_sent      = models.BooleanField(default=False)

    class Meta:
        db_table = 'notifications_notification'
        indexes  = [
            models.Index(fields=['recipient', 'is_read']),
        ]

    def __str__(self):
        return f'{self.notif_type} ? {self.recipient} via {self.channel}'
