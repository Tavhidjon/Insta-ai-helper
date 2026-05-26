from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('login/',           views.LoginView.as_view(),          name='login'),
    path('register/',        views.RegisterView.as_view(),        name='register'),
    path('logout/',          views.LogoutView.as_view(),          name='logout'),
    path('me/',              views.MeView.as_view(),              name='me'),
    path('change-password/', views.ChangePasswordView.as_view(),  name='change-password'),
    path('users/',           views.UserListView.as_view(),        name='user-list'),
    path('token/refresh/',   TokenRefreshView.as_view(),          name='token-refresh'),
]
