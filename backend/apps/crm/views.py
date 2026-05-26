from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Customer, CustomerNote
from .serializers import CustomerSerializer, CustomerNoteSerializer


class CustomerViewSet(viewsets.ModelViewSet):
    queryset           = Customer.objects.select_related('contact')
    serializer_class   = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['segment']
    search_fields      = ['contact__username', 'contact__full_name', 'contact__phone']
    ordering_fields    = ['lead_score', 'total_spent', 'created_at']
    ordering           = ['-lead_score']


class CustomerNoteViewSet(viewsets.ModelViewSet):
    queryset           = CustomerNote.objects.select_related('customer', 'agent')
    serializer_class   = CustomerNoteSerializer
    permission_classes = [permissions.IsAuthenticated]
