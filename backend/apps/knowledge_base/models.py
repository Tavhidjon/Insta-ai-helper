from django.db import models
from django.conf import settings
from core.models import BaseModel, ActiveManager


class KnowledgeDocument(BaseModel):
    STATUS_CHOICES = [
        ('pending',    'Pending'),
        ('processing', 'Processing'),
        ('indexed',    'Indexed'),
        ('failed',     'Failed'),
    ]

    title          = models.CharField(max_length=300)
    file           = models.FileField(upload_to='knowledge/', null=True, blank=True)
    content        = models.TextField(blank=True)
    doc_type       = models.CharField(max_length=50, blank=True)
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    chunk_count    = models.PositiveIntegerField(default=0)
    uploaded_by    = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    objects        = ActiveManager()

    class Meta:
        db_table = 'knowledge_document'

    def __str__(self):
        return self.title


class KnowledgeChunk(BaseModel):
    document   = models.ForeignKey(KnowledgeDocument, on_delete=models.CASCADE, related_name='chunks')
    content    = models.TextField()
    chunk_index = models.PositiveIntegerField()
    embedding  = models.JSONField(null=True, blank=True)

    class Meta:
        db_table = 'knowledge_chunk'
        ordering = ['chunk_index']

    def __str__(self):
        return f'Chunk {self.chunk_index} of {self.document.title}'
