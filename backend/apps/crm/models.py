from django.db import models
from django.conf import settings
from core.models import BaseModel, ActiveManager
from apps.instagram.models import InstagramContact


class Customer(BaseModel):
    SEGMENT_CHOICES = [
        ('cold',    'Cold'),
        ('warm',    'Warm'),
        ('hot',     'Hot'),
        ('vip',     'VIP'),
        ('lost',    'Lost'),
    ]

    contact      = models.OneToOneField(InstagramContact, on_delete=models.CASCADE, related_name='customer_profile')
    lead_score   = models.PositiveIntegerField(default=0)
    segment      = models.CharField(max_length=20, choices=SEGMENT_CHOICES, default='cold')
    tags         = models.JSONField(default=list, blank=True)
    total_rentals = models.PositiveIntegerField(default=0)
    total_spent  = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    preferred_cars = models.JSONField(default=list, blank=True)
    last_contact_at = models.DateTimeField(null=True, blank=True)
    follow_up_date  = models.DateField(null=True, blank=True)
    objects      = ActiveManager()

    class Meta:
        db_table = 'crm_customer'

    def __str__(self):
        return f'Customer: {self.contact.username} | Score: {self.lead_score}'


class CustomerNote(BaseModel):
    customer   = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='notes')
    agent      = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    content    = models.TextField()
    objects    = ActiveManager()

    class Meta:
        db_table = 'crm_note'

    def __str__(self):
        return f'Note for {self.customer} by {self.agent}'
