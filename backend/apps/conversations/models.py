from django.db import models
from django.conf import settings
from core.models import BaseModel, ActiveManager
from apps.instagram.models import InstagramContact


class Conversation(BaseModel):
    STATUS_CHOICES = [
        ('ai_active',       'AI Active'),
        ('human_required',  'Human Required'),
        ('assigned',        'Assigned'),
        ('closed',          'Closed'),
        ('booking_completed','Booking Completed'),
    ]

    contact         = models.ForeignKey(InstagramContact, on_delete=models.CASCADE, related_name='conversations')
    assigned_agent  = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_conversations')
    status          = models.CharField(max_length=30, choices=STATUS_CHOICES, default='ai_active')
    last_message_at = models.DateTimeField(null=True, blank=True)
    ai_enabled      = models.BooleanField(default=True)
    unread_count    = models.PositiveIntegerField(default=0)
    tags            = models.JSONField(default=list, blank=True)
    objects         = ActiveManager()

    class Meta:
        db_table = 'conversations_conversation'
        indexes  = [
            models.Index(fields=['status']),
            models.Index(fields=['last_message_at']),
        ]

    def __str__(self):
        return f'Conv #{self.id} - {self.contact.username} [{self.status}]'


class Message(BaseModel):
    DIRECTION_CHOICES = [
        ('inbound',  'Inbound'),
        ('outbound', 'Outbound'),
    ]
    TYPE_CHOICES = [
        ('text',  'Text'),
        ('image', 'Image'),
        ('audio', 'Audio'),
        ('video', 'Video'),
    ]

    conversation     = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    direction        = models.CharField(max_length=10, choices=DIRECTION_CHOICES)
    message_type     = models.CharField(max_length=10, choices=TYPE_CHOICES, default='text')
    content          = models.TextField()
    instagram_msg_id = models.CharField(max_length=200, blank=True, unique=True, null=True)
    sent_by_agent    = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    ai_generated     = models.BooleanField(default=False)
    ai_confidence    = models.FloatField(null=True, blank=True)
    ai_intent        = models.CharField(max_length=100, blank=True)
    is_read          = models.BooleanField(default=False)
    metadata         = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'conversations_message'
        ordering = ['created_at']
        indexes  = [
            models.Index(fields=['conversation', 'created_at']),
            models.Index(fields=['instagram_msg_id']),
        ]

    def __str__(self):
        return f'{self.direction} | {self.content[:50]}'
