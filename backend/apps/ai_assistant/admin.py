from django.contrib import admin
from .models import PromptVersion, AISettings, ConversationMemory

@admin.register(PromptVersion)
class PromptVersionAdmin(admin.ModelAdmin):
    list_display  = ['name', 'version', 'model', 'language', 'is_active']
    list_filter   = ['is_active', 'language', 'model']

@admin.register(AISettings)
class AISettingsAdmin(admin.ModelAdmin):
    list_display  = ['ai_enabled', 'model', 'confidence_threshold', 'reply_delay_seconds']

@admin.register(ConversationMemory)
class ConversationMemoryAdmin(admin.ModelAdmin):
    list_display  = ['conversation', 'created_at']
