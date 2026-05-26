from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Booking
from .serializers import BookingSerializer


class BookingViewSet(viewsets.ModelViewSet):
    queryset           = Booking.objects.select_related('contact', 'car', 'assigned_agent')
    serializer_class   = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['status', 'assigned_agent', 'deposit_paid']
    search_fields      = ['customer_name', 'customer_phone', 'customer_email']
    ordering_fields    = ['created_at', 'pickup_date', 'total_price']
    ordering           = ['-created_at']

    @action(detail=True, methods=['post'], url_path='confirm')
    def confirm(self, request, pk=None):
        booking        = self.get_object()
        booking.status = 'confirmed'
        booking.save()
        return Response({'success': True, 'status': booking.status})

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        booking        = self.get_object()
        booking.status = 'cancelled'
        booking.save()
        return Response({'success': True, 'status': booking.status})

    @action(detail=True, methods=['post'], url_path='complete')
    def complete(self, request, pk=None):
        booking        = self.get_object()
        booking.status = 'completed'
        booking.save()
        return Response({'success': True, 'status': booking.status})

    @action(detail=False, methods=['get'], url_path='leads')
    def leads(self, request):
        leads = self.get_queryset().filter(status='lead')
        page  = self.paginate_queryset(leads)
        if page is not None:
            return self.get_paginated_response(BookingSerializer(page, many=True).data)
        return Response(BookingSerializer(leads, many=True).data)
