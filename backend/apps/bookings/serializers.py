from rest_framework import serializers
from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    duration_days = serializers.ReadOnlyField()
    contact_username = serializers.CharField(source='contact.username', read_only=True)
    car_name = serializers.CharField(source='car.name', read_only=True)

    class Meta:
        model  = Booking
        fields = [
            'id', 'contact', 'contact_username', 'conversation',
            'car', 'car_name', 'status', 'customer_name',
            'customer_phone', 'customer_email', 'pickup_location',
            'pickup_date', 'return_date', 'budget', 'preferred_car_type',
            'total_price', 'deposit_paid', 'duration_days', 'notes',
            'assigned_agent', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']
