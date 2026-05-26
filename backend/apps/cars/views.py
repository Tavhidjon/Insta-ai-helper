from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Brand, Category, Car, CarImage, CarAvailability
from .serializers import (
    BrandSerializer, CategorySerializer,
    CarSerializer, CarListSerializer, CarAvailabilitySerializer,
)


class BrandViewSet(viewsets.ModelViewSet):
    queryset           = Brand.objects.all()
    serializer_class   = BrandSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields      = ['name']


class CategoryViewSet(viewsets.ModelViewSet):
    queryset           = Category.objects.all()
    serializer_class   = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields      = ['name']


class CarViewSet(viewsets.ModelViewSet):
    queryset           = Car.objects.select_related('brand', 'category').prefetch_related('images')
    permission_classes = [permissions.IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields   = ['status', 'brand', 'category', 'transmission', 'fuel_type', 'seats']
    search_fields      = ['name', 'model', 'plate_number']
    ordering_fields    = ['daily_price', 'year', 'created_at']
    ordering           = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return CarListSerializer
        return CarSerializer

    @action(detail=True, methods=['post'], url_path='upload-image')
    def upload_image(self, request, pk=None):
        car   = self.get_object()
        image = request.FILES.get('image')
        if not image:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
        is_primary = request.data.get('is_primary', False)
        if is_primary:
            car.images.update(is_primary=False)
        car_image = CarImage.objects.create(car=car, image=image, is_primary=is_primary)
        return Response({'success': True, 'image_id': str(car_image.id)})

    @action(detail=True, methods=['get'], url_path='availability')
    def availability(self, request, pk=None):
        car    = self.get_object()
        blocks = CarAvailability.objects.filter(car=car)
        return Response(CarAvailabilitySerializer(blocks, many=True).data)

    @action(detail=False, methods=['get'], url_path='available')
    def available_cars(self, request):
        cars = self.get_queryset().filter(status='available')
        page = self.paginate_queryset(cars)
        if page is not None:
            return self.get_paginated_response(CarListSerializer(page, many=True).data)
        return Response(CarListSerializer(cars, many=True).data)
