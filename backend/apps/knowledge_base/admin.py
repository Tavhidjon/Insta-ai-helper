from django.contrib import admin
from .models import KnowledgeDocument, KnowledgeChunk

@admin.register(KnowledgeDocument)
class KnowledgeDocumentAdmin(admin.ModelAdmin):
    list_display  = ['title', 'doc_type', 'status', 'chunk_count', 'uploaded_by']
    list_filter   = ['status', 'doc_type']
    search_fields = ['title']

@admin.register(KnowledgeChunk)
class KnowledgeChunkAdmin(admin.ModelAdmin):
    list_display  = ['document', 'chunk_index']
