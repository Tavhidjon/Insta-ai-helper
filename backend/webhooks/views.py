import json
import hmac
import hashlib
import os
import logging
from django.http      import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt

logger = logging.getLogger(__name__)


def verify_signature(request) -> bool:
    secret    = os.environ.get('META_APP_SECRET', '')
    if not secret:
        return True  # Skip verification in dev
    signature = request.headers.get('X-Hub-Signature-256', '')
    if not signature.startswith('sha256='):
        return False
    expected = hmac.new(
        secret.encode('utf-8'),
        request.body,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature[7:], expected)


@csrf_exempt
def webhook_verify(request):
    if request.method == 'GET':
        mode      = request.GET.get('hub.mode')
        token     = request.GET.get('hub.verify_token')
        challenge = request.GET.get('hub.challenge')
        verify_token = os.environ.get('META_VERIFY_TOKEN', 'myverifytoken')
        if mode == 'subscribe' and token == verify_token:
            logger.info('Webhook verified successfully')
            return HttpResponse(challenge, content_type='text/plain')
        return HttpResponse('Forbidden', status=403)
    return HttpResponse('Method not allowed', status=405)


@csrf_exempt
def webhook_receive(request):
    if request.method != 'POST':
        return HttpResponse('Method not allowed', status=405)

    if not verify_signature(request):
        return HttpResponse('Invalid signature', status=403)

    try:
        data = json.loads(request.body)
        logger.info(f'Webhook received: {data.get("object")}')

        if data.get('object') == 'instagram':
            for entry in data.get('entry', []):
                for messaging in entry.get('messaging', []):
                    _process_messaging_event(messaging)

        return JsonResponse({'status': 'ok'})
    except Exception as e:
        logger.error(f'Webhook error: {e}')
        return JsonResponse({'status': 'error'}, status=500)


def _process_messaging_event(messaging: dict):
    try:
        sender_id = messaging.get('sender', {}).get('id')
        message   = messaging.get('message', {})

        if not sender_id or not message:
            return

        text = message.get('text', '').strip()
        if not text:
            return

        msg_id = message.get('mid', '')

        logger.info(f'Message from {sender_id}: {text[:50]}')

        # Process via Celery task
        from tasks.ai_tasks import process_instagram_message
        process_instagram_message.delay(
            sender_id = sender_id,
            text      = text,
            msg_id    = msg_id,
        )

    except Exception as e:
        logger.error(f'Error processing messaging event: {e}')
