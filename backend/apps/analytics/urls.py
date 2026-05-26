from django.urls import path
from . import views

urlpatterns = [
    path('overview/', views.OverviewStatsView.as_view(), name='analytics-overview'),
    path('messages-over-time/', views.MessagesOverTimeView.as_view(), name='analytics-messages'),
    path('bookings-over-time/', views.BookingsOverTimeView.as_view(), name='analytics-bookings'),
    path('peak-hours/', views.PeakHoursView.as_view(), name='analytics-peak'),
    path('popular-cars/', views.PopularCarsView.as_view(), name='analytics-cars'),
    path('funnel/', views.ConversionFunnelView.as_view(), name='analytics-funnel'),
]
