from django.contrib import admin
from .models import Conversation, Message

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display  = ['id', 'contact', 'status', 'assigned_agent', 'last_message_at']
    list_filter   = ['status', 'ai_enabled']
    search_fields = ['contact__username', 'contact__instagram_id']

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display  = ['conversation', 'direction', 'ai_generated', 'ai_confidence', 'created_at']
    list_filter   = ['direction', 'ai_generated', 'message_type']
    search_fields = ['content']
