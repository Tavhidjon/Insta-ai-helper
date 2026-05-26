from django.contrib import admin
from .models import DailyAnalytics, ConversionEvent


@admin.register(DailyAnalytics)
class DailyAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['date', 'total_messages', 'new_leads', 'bookings_created', 'conversion_rate_display']
    ordering = ['-date']

    def conversion_rate_display(self, obj):
        if obj.new_leads > 0:
            return f"{round((obj.bookings_completed / obj.new_leads) * 100, 1)}%"
        return "0%"
    conversion_rate_display.short_description = 'Conversion Rate'


@admin.register(ConversionEvent)
class ConversionEventAdmin(admin.ModelAdmin):
    list_display = ['event_type', 'created_at']
    list_filter = ['event_type']
    ordering = ['-created_at']
