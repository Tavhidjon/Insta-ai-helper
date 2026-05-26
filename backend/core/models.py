import uuid
from django.db import models
from django.contrib.auth import get_user_model


class BaseModel(models.Model):
    """
    Abstract base model with UUID primary key,
    timestamps, and soft delete support.
    Every model in this project inherits from this.
    """
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        abstract = True
        ordering = ['-created_at']

    def soft_delete(self):
        from django.utils import timezone
        self.deleted_at = timezone.now()
        self.is_deleted = True
        self.save(update_fields=['deleted_at', 'is_deleted'])

    def restore(self):
        self.deleted_at = None
        self.is_deleted = False
        self.save(update_fields=['deleted_at', 'is_deleted'])


class ActiveManager(models.Manager):
    """Returns only non-deleted records."""
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)
