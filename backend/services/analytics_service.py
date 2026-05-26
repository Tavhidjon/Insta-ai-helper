from datetime import timedelta
from django.utils import timezone
from django.db.models import Count, Q
from django.db.models.functions import TruncDate, TruncHour


def get_overview_stats(days=30):
    from apps.conversations.models import Conversation, Message
    from apps.bookings.models import Booking
    from apps.crm.models import Customer
    since = timezone.now() - timedelta(days=days)
    total_conversations = Conversation.objects.filter(created_at__gte=since).count()
    total_messages = Message.objects.filter(created_at__gte=since).count()
    total_leads = Booking.objects.filter(created_at__gte=since).count()
    completed_bookings = Booking.objects.filter(created_at__gte=since, status='completed').count()
    new_customers = Customer.objects.filter(created_at__gte=since).count()
    handoffs = Conversation.objects.filter(created_at__gte=since, status='human_required').count()
    conversion_rate = round((completed_bookings / total_leads) * 100, 1) if total_leads > 0 else 0
    handoff_rate = round((handoffs / total_conversations) * 100, 1) if total_conversations > 0 else 0
    return {
        'total_conversations': total_conversations,
        'total_messages': total_messages,
        'total_leads': total_leads,
        'completed_bookings': completed_bookings,
        'new_customers': new_customers,
        'conversion_rate': conversion_rate,
        'handoff_rate': handoff_rate,
        'handoffs': handoffs,
    }


def get_messages_over_time(days=30):
    from apps.conversations.models import Message
    since = timezone.now() - timedelta(days=days)
    qs = (
        Message.objects.filter(created_at__gte=since)
        .annotate(date=TruncDate('created_at'))
        .values('date')
        .annotate(total=Count('id'), ai=Count('id', filter=Q(sender_type='ai')), human=Count('id', filter=Q(sender_type__in=['agent','customer'])))
        .order_by('date')
    )
    return [{'date': str(r['date']), 'total': r['total'], 'ai': r['ai'], 'human': r['human']} for r in qs]


def get_bookings_over_time(days=30):
    from apps.bookings.models import Booking
    since = timezone.now() - timedelta(days=days)
    qs = (
        Booking.objects.filter(created_at__gte=since)
        .annotate(date=TruncDate('created_at'))
        .values('date')
        .annotate(total=Count('id'))
        .order_by('date')
    )
    return [{'date': str(r['date']), 'bookings': r['total']} for r in qs]


def get_peak_hours():
    from apps.conversations.models import Message
    since = timezone.now() - timedelta(days=30)
    qs = (
        Message.objects.filter(created_at__gte=since)
        .annotate(hour=TruncHour('created_at'))
        .values('hour')
        .annotate(count=Count('id'))
        .order_by('hour')
    )
    slots = {h: 0 for h in range(24)}
    for r in qs:
        if r['hour']:
            slots[r['hour'].hour] = r['count']
    return [{'hour': h, 'messages': slots[h]} for h in range(24)]


def get_popular_cars(limit=5):
    from apps.bookings.models import Booking
    qs = (
        Booking.objects.filter(car__isnull=False)
        .values('car__name', 'car__brand__name')
        .annotate(total=Count('id'))
        .order_by('-total')[:limit]
    )
    return [{'car': str(r['car__brand__name']) + ' ' + str(r['car__name']), 'bookings': r['total']} for r in qs]


def get_conversion_funnel():
    from apps.conversations.models import Message
    from apps.bookings.models import Booking
    since = timezone.now() - timedelta(days=30)
    messages = Message.objects.filter(created_at__gte=since).count()
    leads = Booking.objects.filter(created_at__gte=since).count()
    completed = Booking.objects.filter(created_at__gte=since, status='completed').count()
    return [
        {'stage': 'Messages', 'value': messages},
        {'stage': 'Leads', 'value': leads},
        {'stage': 'Completed', 'value': completed},
    ]
