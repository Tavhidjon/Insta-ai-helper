import logging
from typing import Dict, List, Any

logger = logging.getLogger(__name__)


class MemoryManager:

    def load_context(self, conversation) -> Dict[str, Any]:
        try:
            messages = conversation.messages.order_by('-created_at')[:20]
            messages = list(reversed(messages))

            history = []
            for msg in messages:
                role    = 'user' if msg.direction == 'inbound' else 'assistant'
                history.append({'role': role, 'content': msg.content})

            contact  = conversation.contact
            profile  = {
                'username':  contact.username,
                'full_name': contact.full_name,
                'language':  contact.language,
                'phone':     contact.phone,
            }

            try:
                customer = contact.customer_profile
                profile.update({
                    'lead_score':    customer.lead_score,
                    'segment':       customer.segment,
                    'total_rentals': customer.total_rentals,
                })
            except Exception:
                pass

            return {
                'history':         history,
                'customer_profile': profile,
            }
        except Exception as e:
            logger.error(f'Error loading context: {e}')
            return {'history': [], 'customer_profile': {}}

    def format_history_for_prompt(self, history: List[Dict]) -> str:
        if not history:
            return 'No previous messages.'
        lines = []
        for msg in history[-10:]:
            role = 'Customer' if msg['role'] == 'user' else 'Assistant'
            lines.append(f'{role}: {msg["content"]}')
        return '\n'.join(lines)

    def format_profile_for_prompt(self, profile: Dict) -> str:
        if not profile:
            return 'New customer, no profile data.'
        parts = []
        if profile.get('full_name'):
            parts.append(f'Name: {profile["full_name"]}')
        if profile.get('phone'):
            parts.append(f'Phone: {profile["phone"]}')
        if profile.get('language'):
            parts.append(f'Language: {profile["language"]}')
        if profile.get('segment'):
            parts.append(f'Segment: {profile["segment"]}')
        if profile.get('total_rentals'):
            parts.append(f'Previous rentals: {profile["total_rentals"]}')
        return '\n'.join(parts) if parts else 'New customer.'

    def save_context(self, conversation, response: str, intent: str):
        try:
            from apps.ai_assistant.models import ConversationMemory
            memory, created = ConversationMemory.objects.get_or_create(
                conversation=conversation
            )
            key_facts = memory.key_facts or {}
            if intent:
                key_facts['last_intent'] = intent
            memory.key_facts = key_facts
            memory.save()
        except Exception as e:
            logger.error(f'Error saving context: {e}')
