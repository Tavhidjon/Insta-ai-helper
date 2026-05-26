from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer


class ConversationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['status', 'ai_enabled', 'assigned_agent']
    search_fields      = ['contact__username', 'contact__full_name']
    ordering           = ['-last_message_at']
    serializer_class   = ConversationSerializer

    def get_queryset(self):
        return Conversation.objects.select_related(
            'contact', 'assigned_agent'
        ).prefetch_related('messages')

    @action(detail=True, methods=['post'], url_path='assign')
    def assign(self, request, pk=None):
        conversation = self.get_object()
        agent_id     = request.data.get('agent_id')
        conversation.assigned_agent_id = agent_id
        conversation.status            = 'assigned'
        conversation.save()
        return Response({'success': True, 'status': conversation.status})

    @action(detail=True, methods=['post'], url_path='toggle-ai')
    def toggle_ai(self, request, pk=None):
        conversation            = self.get_object()
        conversation.ai_enabled = not conversation.ai_enabled
        if not conversation.ai_enabled:
            conversation.status = 'human_required'
        else:
            conversation.status = 'ai_active'
        conversation.save()
        return Response({'success': True, 'ai_enabled': conversation.ai_enabled})

    @action(detail=True, methods=['post'], url_path='close')
    def close(self, request, pk=None):
        conversation        = self.get_object()
        conversation.status = 'closed'
        conversation.save()
        return Response({'success': True})

    @action(detail=True, methods=['get'], url_path='messages')
    def messages(self, request, pk=None):
        conversation = self.get_object()
        msgs         = conversation.messages.order_by('created_at')
        return Response(MessageSerializer(msgs, many=True).data)

    @action(detail=True, methods=['post'], url_path='send-message')
    def send_message(self, request, pk=None):
        conversation = self.get_object()
        content      = request.data.get('content', '').strip()
        if not content:
            return Response({'error': 'Message cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)
        msg = Message.objects.create(
            conversation  = conversation,
            direction     = 'outbound',
            content       = content,
            sent_by_agent = request.user,
            ai_generated  = False,
        )
        return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)


class MessageViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class   = MessageSerializer
    filter_backends    = [DjangoFilterBackend, OrderingFilter]
    filterset_fields   = ['direction', 'ai_generated', 'is_read']
    ordering           = ['created_at']

    def get_queryset(self):
        return Message.objects.select_related('conversation')
