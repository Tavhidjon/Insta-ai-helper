from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display  = ['id', 'customer_name', 'customer_phone', 'car', 'status', 'pickup_date', 'return_date']
    list_filter   = ['status']
    search_fields = ['customer_name', 'customer_phone', 'customer_email']
