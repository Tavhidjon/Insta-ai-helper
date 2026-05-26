import logging
from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task
def notify_human_takeover(conversation_id: str):
    try:
        from apps.conversations.models import Conversation
        from apps.accounts.models      import User
        from apps.notifications.models import Notification

        conversation = Conversation.objects.get(id=conversation_id)
        admins       = User.objects.filter(role__in=['admin', 'manager'])

        for admin in admins:
            Notification.objects.create(
                recipient  = admin,
                channel    = 'dashboard',
                notif_type = 'human_takeover',
                title      = 'Human takeover required',
                message    = f'Conversation with @{conversation.contact.username} needs human attention.',
                payload    = {'conversation_id': conversation_id},
            )
        logger.info(f'Human takeover notifications sent for {conversation_id}')
    except Exception as e:
        logger.error(f'Notification error: {e}')


@shared_task
def notify_new_lead(booking_id: str):
    try:
        from apps.bookings.models      import Booking
        from apps.accounts.models      import User
        from apps.notifications.models import Notification

        booking = Booking.objects.get(id=booking_id)
        admins  = User.objects.filter(role__in=['admin', 'manager'])

        for admin in admins:
            Notification.objects.create(
                recipient  = admin,
                channel    = 'dashboard',
                notif_type = 'new_lead',
                title      = 'New booking lead',
                message    = f'New lead from {booking.customer_name or "unknown"}',
                payload    = {'booking_id': booking_id},
            )
    except Exception as e:
        logger.error(f'Lead notification error: {e}')
