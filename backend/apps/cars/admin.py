from django.contrib import admin
from .models import Brand, Category, Car, CarImage, CarAvailability

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display  = ['name']
    search_fields = ['name']

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display  = ['name', 'description']
    search_fields = ['name']

class CarImageInline(admin.TabularInline):
    model = CarImage
    extra = 1

@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display  = ['name', 'brand', 'category', 'year', 'daily_price', 'status']
    list_filter   = ['status', 'brand', 'category', 'transmission', 'fuel_type']
    search_fields = ['name', 'model', 'plate_number']
    inlines       = [CarImageInline]
