from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # API routes
    path('api/auth/',          include('apps.accounts.urls')),
    path('api/conversations/', include('apps.conversations.urls')),
    path('api/bookings/',      include('apps.bookings.urls')),
    path('api/cars/',          include('apps.cars.urls')),
    path('api/analytics/',     include('apps.analytics.urls')),
    path('api/ai/',            include('apps.ai_assistant.urls')),
    path('api/crm/',           include('apps.crm.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/knowledge/',     include('apps.knowledge_base.urls')),

    # Webhooks
    path('webhooks/',          include('webhooks.urls')),

    # Swagger docs
    path('api/schema/',  SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/',    SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/',   SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
