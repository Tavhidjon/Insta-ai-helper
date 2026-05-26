from rest_framework import serializers
from .models import Customer, CustomerNote
from apps.instagram.models import InstagramContact


class InstagramContactSerializer(serializers.ModelSerializer):
    class Meta:
        model  = InstagramContact
        fields = ['id', 'instagram_id', 'username', 'full_name', 'phone', 'language']


class CustomerSerializer(serializers.ModelSerializer):
    contact = InstagramContactSerializer(read_only=True)

    class Meta:
        model  = Customer
        fields = [
            'id', 'contact', 'lead_score', 'segment', 'tags',
            'total_rentals', 'total_spent', 'follow_up_date',
            'last_contact_at', 'created_at',
        ]


class CustomerNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = CustomerNote
        fields = ['id', 'customer', 'agent', 'content', 'created_at']
