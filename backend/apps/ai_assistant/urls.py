from django.urls import path
from . import views

urlpatterns = [
    path('test/',     views.AITestView.as_view(),     name='ai-test'),
    path('settings/', views.AISettingsView.as_view(), name='ai-settings'),
]
