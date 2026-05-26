from django.db import models
from django.conf import settings
from core.models import BaseModel, ActiveManager


class PromptVersion(BaseModel):
    name       = models.CharField(max_length=200)
    content    = models.TextField()
    version    = models.PositiveIntegerField(default=1)
    is_active  = models.BooleanField(default=False)
    model      = models.CharField(max_length=100, default='gpt-4o')
    language   = models.CharField(max_length=5, default='en')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    objects    = ActiveManager()

    class Meta:
        db_table = 'ai_prompt_version'

    def __str__(self):
        return f'{self.name} v{self.version} ({"active" if self.is_active else "inactive"})'


class AISettings(BaseModel):
    ai_enabled         = models.BooleanField(default=True)
    model              = models.CharField(max_length=100, default='gpt-4o')
    max_tokens         = models.PositiveIntegerField(default=1000)
    confidence_threshold = models.FloatField(default=0.7)
    reply_delay_seconds = models.PositiveIntegerField(default=2)
    business_hours_start = models.TimeField(default='09:00')
    business_hours_end   = models.TimeField(default='22:00')
    fallback_message   = models.TextField(blank=True)
    tone               = models.CharField(max_length=50, default='professional')
    objects            = ActiveManager()

    class Meta:
        db_table = 'ai_settings'

    def __str__(self):
        return f'AI Settings (enabled={self.ai_enabled})'


class ConversationMemory(BaseModel):
    conversation = models.OneToOneField('conversations.Conversation', on_delete=models.CASCADE, related_name='memory')
    summary      = models.TextField(blank=True)
    key_facts    = models.JSONField(default=dict, blank=True)
    embedding    = models.JSONField(null=True, blank=True)

    class Meta:
        db_table = 'ai_conversation_memory'

    def __str__(self):
        return f'Memory for conversation {self.conversation_id}'
