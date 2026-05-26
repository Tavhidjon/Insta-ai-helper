from django.urls import path
from . import views

urlpatterns = [
    path('instagram/',        views.webhook_receive, name='webhook_receive'),
    path('instagram/verify/', views.webhook_verify,  name='webhook_verify'),
]
