import logging
from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def process_instagram_message(self, sender_id: str, text: str, msg_id: str):
    try:
        from apps.instagram.models   import InstagramContact
        from apps.conversations.models import Conversation, Message
        from ai.orchestrator          import orchestrator
        from integrations.instagram.client import instagram_client

        # Get or create contact
        contact, created = InstagramContact.objects.get_or_create(
            instagram_id=sender_id,
            defaults={'username': sender_id}
        )

        if created:
            profile = instagram_client.get_user_profile(sender_id)
            if profile:
                contact.full_name = profile.get('name', '')
                contact.save(update_fields=['full_name'])

        # Get or create active conversation
        conversation = Conversation.objects.filter(
            contact=contact,
            status__in=['ai_active', 'human_required']
        ).first()

        if not conversation:
            conversation = Conversation.objects.create(
                contact    = contact,
                status     = 'ai_active',
                ai_enabled = True,
            )

        # Save inbound message (avoid duplicates)
        if msg_id and Message.objects.filter(instagram_msg_id=msg_id).exists():
            logger.info(f'Duplicate message {msg_id}, skipping')
            return

        Message.objects.create(
            conversation     = conversation,
            direction        = 'inbound',
            content          = text,
            instagram_msg_id = msg_id or None,
            ai_generated     = False,
        )

        # Update conversation timestamp
        from django.utils import timezone
        conversation.last_message_at = timezone.now()
        conversation.unread_count   += 1
        conversation.save(update_fields=['last_message_at', 'unread_count'])

        # If AI is disabled, skip AI response
        if not conversation.ai_enabled:
            logger.info(f'AI disabled for conversation {conversation.id}')
            return

        # Run AI orchestrator
        result   = orchestrator.process(text, conversation)
        response = result.get('response', '')
        escalate = result.get('escalate', False)
        intent   = result.get('intent', '')
        confidence = result.get('confidence', 0.0)

        if escalate:
            conversation.status     = 'human_required'
            conversation.ai_enabled = False
            conversation.save(update_fields=['status', 'ai_enabled'])
            from tasks.notification_tasks import notify_human_takeover
            notify_human_takeover.delay(str(conversation.id))

        # Save AI response message
        Message.objects.create(
            conversation = conversation,
            direction    = 'outbound',
            content      = response,
            ai_generated = True,
            ai_confidence = confidence,
            ai_intent    = intent,
        )

        # Send to Instagram
        instagram_client.send_message(sender_id, response)

        # Log analytics event
        from tasks.analytics_tasks import log_event
        log_event.delay('message_received', {
            'conversation_id': str(conversation.id),
            'intent':          intent,
            'confidence':      confidence,
            'escalated':       escalate,
        })

        logger.info(f'AI response sent to {sender_id}: {response[:50]}')

    except Exception as e:
        logger.error(f'Error processing message: {e}', exc_info=True)
        raise self.retry(exc=e, countdown=60)
