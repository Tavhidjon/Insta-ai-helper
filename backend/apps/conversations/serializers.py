from rest_framework import serializers
from .models import Conversation, Message
from apps.instagram.models import InstagramContact


class InstagramContactSerializer(serializers.ModelSerializer):
    class Meta:
        model  = InstagramContact
        fields = ['id', 'instagram_id', 'username', 'full_name', 'profile_pic', 'language', 'phone']


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Message
        fields = [
            'id', 'conversation', 'direction', 'message_type',
            'content', 'ai_generated', 'ai_confidence', 'ai_intent',
            'is_read', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class ConversationSerializer(serializers.ModelSerializer):
    contact      = InstagramContactSerializer(read_only=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model  = Conversation
        fields = [
            'id', 'contact', 'status', 'ai_enabled',
            'unread_count', 'last_message_at', 'last_message',
            'assigned_agent', 'tags', 'created_at',
        ]

    def get_last_message(self, obj):
        msg = obj.messages.order_by('-created_at').first()
        if msg:
            return {'content': msg.content, 'direction': msg.direction, 'created_at': msg.created_at}
        return None
