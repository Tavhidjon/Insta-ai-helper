from django.db import models
from core.models import BaseModel, ActiveManager


class InstagramContact(BaseModel):
    """Represents a customer who messaged us on Instagram."""
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('ru', 'Russian'),
        ('tj', 'Tajik'),
    ]

    instagram_id  = models.CharField(max_length=100, unique=True)
    username      = models.CharField(max_length=150, blank=True)
    full_name     = models.CharField(max_length=200, blank=True)
    profile_pic   = models.URLField(blank=True)
    language      = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, default='en')
    phone         = models.CharField(max_length=30, blank=True)
    email         = models.EmailField(blank=True)
    is_blocked    = models.BooleanField(default=False)
    objects       = ActiveManager()

    class Meta:
        db_table = 'instagram_contact'

    def __str__(self):
        return f'@{self.username} ({self.instagram_id})'
