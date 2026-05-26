from django.contrib import admin
from .models import Customer, CustomerNote

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display  = ['contact', 'lead_score', 'segment', 'total_rentals', 'total_spent']
    list_filter   = ['segment']
    search_fields = ['contact__username']

@admin.register(CustomerNote)
class CustomerNoteAdmin(admin.ModelAdmin):
    list_display  = ['customer', 'agent', 'created_at']
