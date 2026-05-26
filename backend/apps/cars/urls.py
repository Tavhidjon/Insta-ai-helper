from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('brands',     views.BrandViewSet,    basename='brand')
router.register('categories', views.CategoryViewSet, basename='category')
router.register('',           views.CarViewSet,       basename='car')

urlpatterns = [
    path('', include(router.urls)),
]
