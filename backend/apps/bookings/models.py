from django.db import models
from django.conf import settings
from core.models import BaseModel, ActiveManager
from apps.instagram.models import InstagramContact
from apps.conversations.models import Conversation
from apps.cars.models import Car


class Booking(BaseModel):
    STATUS_CHOICES = [
        ('lead',      'Lead'),
        ('pending',   'Pending'),
        ('confirmed', 'Confirmed'),
        ('active',    'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    contact          = models.ForeignKey(InstagramContact, on_delete=models.CASCADE, related_name='bookings')
    conversation     = models.ForeignKey(Conversation, on_delete=models.SET_NULL, null=True, blank=True)
    car              = models.ForeignKey(Car, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    assigned_agent   = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    status           = models.CharField(max_length=20, choices=STATUS_CHOICES, default='lead')

    # Customer info collected by AI
    customer_name    = models.CharField(max_length=200, blank=True)
    customer_phone   = models.CharField(max_length=30, blank=True)
    customer_email   = models.EmailField(blank=True)

    # Rental details
    pickup_location  = models.CharField(max_length=300, blank=True)
    pickup_date      = models.DateTimeField(null=True, blank=True)
    return_date      = models.DateTimeField(null=True, blank=True)
    budget           = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    preferred_car_type = models.CharField(max_length=100, blank=True)

    # Pricing
    total_price      = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    deposit_paid     = models.BooleanField(default=False)

    notes            = models.TextField(blank=True)
    objects          = ActiveManager()

    class Meta:
        db_table = 'bookings_booking'
        indexes  = [
            models.Index(fields=['status']),
            models.Index(fields=['pickup_date']),
            models.Index(fields=['contact']),
        ]

    def __str__(self):
        return f'Booking #{self.id} - {self.customer_name} [{self.status}]'

    @property
    def duration_days(self):
        if self.pickup_date and self.return_date:
            return (self.return_date - self.pickup_date).days
        return None
