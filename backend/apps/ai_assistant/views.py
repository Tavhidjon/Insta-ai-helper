from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
import os
from openai import OpenAI


class AITestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        message = request.data.get('message', '')
        prompt  = request.data.get('prompt', '')
        if not message:
            return Response({'error': 'Message required'}, status=400)
        try:
            client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY', ''))
            res = client.chat.completions.create(
                model    = os.environ.get('AI_MODEL', 'gpt-4o'),
                messages = [
                    {'role': 'system', 'content': prompt or 'You are a car rental assistant.'},
                    {'role': 'user',   'content': message},
                ],
                max_tokens  = 300,
                temperature = 0.7,
            )
            return Response({'response': res.choices[0].message.content.strip()})
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class AISettingsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from .models import AISettings
        settings = AISettings.objects.first()
        if not settings:
            return Response({'ai_enabled': True, 'model': 'gpt-4o'})
        return Response({
            'ai_enabled':            settings.ai_enabled,
            'model':                 settings.model,
            'max_tokens':            settings.max_tokens,
            'confidence_threshold':  settings.confidence_threshold,
            'reply_delay_seconds':   settings.reply_delay_seconds,
            'tone':                  settings.tone,
            'fallback_message':      settings.fallback_message,
        })
