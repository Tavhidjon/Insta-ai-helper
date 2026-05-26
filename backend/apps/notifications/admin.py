from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display  = ['recipient', 'channel', 'notif_type', 'title', 'is_read', 'is_sent']
    list_filter   = ['channel', 'notif_type', 'is_read']
