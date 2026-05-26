from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('notes',    views.CustomerNoteViewSet, basename='note')
router.register('',         views.CustomerViewSet,     basename='customer')

urlpatterns = [path('', include(router.urls))]
