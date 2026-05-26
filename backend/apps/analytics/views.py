from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from services.analytics_service import (
    get_overview_stats,
    get_messages_over_time,
    get_bookings_over_time,
    get_peak_hours,
    get_popular_cars,
    get_conversion_funnel,
)


class OverviewStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        return Response(get_overview_stats(days))


class MessagesOverTimeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        return Response(get_messages_over_time(days))


class BookingsOverTimeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        return Response(get_bookings_over_time(days))


class PeakHoursView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(get_peak_hours())


class PopularCarsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(get_popular_cars())


class ConversionFunnelView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(get_conversion_funnel())
