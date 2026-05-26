from django.contrib import admin
from .models import InstagramContact

@admin.register(InstagramContact)
class InstagramContactAdmin(admin.ModelAdmin):
    list_display  = ['username', 'instagram_id', 'language', 'is_blocked']
    list_filter   = ['language', 'is_blocked']
    search_fields = ['username', 'instagram_id', 'full_name']
