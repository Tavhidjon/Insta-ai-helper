from rest_framework import serializers
from .models import Brand, Category, Car, CarImage, CarAvailability


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Brand
        fields = ['id', 'name', 'logo', 'created_at']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Category
        fields = ['id', 'name', 'description', 'created_at']


class CarImageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = CarImage
        fields = ['id', 'image', 'is_primary', 'order']


class CarAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model  = CarAvailability
        fields = ['id', 'start_date', 'end_date', 'reason']


class CarSerializer(serializers.ModelSerializer):
    brand_name    = serializers.CharField(source='brand.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    images        = CarImageSerializer(many=True, read_only=True)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model  = Car
        fields = [
            'id', 'name', 'model', 'year', 'brand', 'brand_name',
            'category', 'category_name', 'transmission', 'fuel_type',
            'seats', 'color', 'plate_number', 'daily_price', 'weekly_price',
            'deposit', 'features', 'status', 'description',
            'images', 'primary_image', 'created_at',
        ]

    def get_primary_image(self, obj):
        image = obj.images.filter(is_primary=True).first()
        if image:
            return CarImageSerializer(image).data
        first = obj.images.first()
        return CarImageSerializer(first).data if first else None


class CarListSerializer(serializers.ModelSerializer):
    brand_name    = serializers.CharField(source='brand.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model  = Car
        fields = [
            'id', 'name', 'model', 'year', 'brand_name', 'category_name',
            'transmission', 'fuel_type', 'seats', 'daily_price',
            'weekly_price', 'status', 'primary_image',
        ]

    def get_primary_image(self, obj):
        image = obj.images.filter(is_primary=True).first() or obj.images.first()
        return CarImageSerializer(image).data if image else None
