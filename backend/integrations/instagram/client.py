import os
import httpx
import logging

logger = logging.getLogger(__name__)

GRAPH_API_URL = 'https://graph.facebook.com/v19.0'


class InstagramClient:

    def __init__(self):
        self.access_token = os.environ.get('INSTAGRAM_ACCESS_TOKEN', '')
        self.page_id      = os.environ.get('INSTAGRAM_PAGE_ID', '')

    def send_message(self, recipient_id: str, message: str) -> bool:
        if not self.access_token:
            logger.warning('No Instagram access token configured')
            return False
        try:
            url     = f'{GRAPH_API_URL}/me/messages'
            payload = {
                'recipient': {'id': recipient_id},
                'message':   {'text': message},
                'messaging_type': 'RESPONSE',
            }
            params   = {'access_token': self.access_token}
            response = httpx.post(url, json=payload, params=params, timeout=10)

            if response.status_code == 200:
                logger.info(f'Message sent to {recipient_id}')
                return True
            else:
                logger.error(f'Failed to send message: {response.text}')
                return False
        except Exception as e:
            logger.error(f'Instagram send error: {e}')
            return False

    def get_user_profile(self, user_id: str) -> dict:
        if not self.access_token:
            return {}
        try:
            url    = f'{GRAPH_API_URL}/{user_id}'
            params = {
                'fields':       'name,profile_pic',
                'access_token': self.access_token,
            }
            response = httpx.get(url, params=params, timeout=10)
            if response.status_code == 200:
                return response.json()
            return {}
        except Exception as e:
            logger.error(f'Error fetching profile: {e}')
            return {}


instagram_client = InstagramClient()
