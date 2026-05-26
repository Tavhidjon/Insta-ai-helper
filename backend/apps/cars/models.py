from django.db import models
from core.models import BaseModel, ActiveManager


class Brand(BaseModel):
    name    = models.CharField(max_length=100, unique=True)
    logo    = models.ImageField(upload_to='brands/', null=True, blank=True)
    objects = ActiveManager()

    class Meta:
        db_table = 'cars_brand'

    def __str__(self):
        return self.name


class Category(BaseModel):
    name        = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    objects     = ActiveManager()

    class Meta:
        db_table = 'cars_category'

    def __str__(self):
        return self.name


class Car(BaseModel):
    TRANSMISSION_CHOICES = [
        ('automatic', 'Automatic'),
        ('manual',    'Manual'),
    ]
    FUEL_CHOICES = [
        ('petrol',   'Petrol'),
        ('diesel',   'Diesel'),
        ('electric', 'Electric'),
        ('hybrid',   'Hybrid'),
    ]
    STATUS_CHOICES = [
        ('available',   'Available'),
        ('rented',      'Rented'),
        ('maintenance', 'Maintenance'),
        ('inactive',    'Inactive'),
    ]

    brand        = models.ForeignKey(Brand,    on_delete=models.PROTECT, related_name='cars')
    category     = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='cars')
    name         = models.CharField(max_length=200)
    model        = models.CharField(max_length=100)
    year         = models.PositiveIntegerField()
    transmission = models.CharField(max_length=20, choices=TRANSMISSION_CHOICES)
    fuel_type    = models.CharField(max_length=20, choices=FUEL_CHOICES)
    seats        = models.PositiveIntegerField(default=5)
    color        = models.CharField(max_length=50, blank=True)
    plate_number = models.CharField(max_length=20, unique=True, blank=True)
    daily_price  = models.DecimalField(max_digits=10, decimal_places=2)
    weekly_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    deposit      = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    features     = models.JSONField(default=list, blank=True)
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    description  = models.TextField(blank=True)
    objects      = ActiveManager()

    class Meta:
        db_table = 'cars_car'
        indexes  = [
            models.Index(fields=['status']),
            models.Index(fields=['category']),
            models.Index(fields=['daily_price']),
        ]

    def __str__(self):
        return f'{self.brand.name} {self.name} {self.year}'


class CarImage(BaseModel):
    car       = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='images')
    image     = models.ImageField(upload_to='cars/')
    is_primary = models.BooleanField(default=False)
    order     = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'cars_image'
        ordering = ['order']


class CarAvailability(BaseModel):
    car        = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='availability')
    start_date = models.DateField()
    end_date   = models.DateField()
    reason     = models.CharField(max_length=200, blank=True)

    class Meta:
        db_table = 'cars_availability'
