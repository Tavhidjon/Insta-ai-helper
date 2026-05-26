import os
import logging
from typing import Dict, Any, Optional
from openai import OpenAI

from .language_detector import detect_language
from .intent_detector    import detect_intent, should_escalate
from .memory_manager     import MemoryManager
from .rag_engine         import RAGEngine

logger = logging.getLogger(__name__)

memory_manager = MemoryManager()
rag_engine     = RAGEngine()


class AIOrchestrator:

    def __init__(self):
        self.client     = OpenAI(api_key=os.environ.get('OPENAI_API_KEY', ''))
        self.model      = os.environ.get('AI_MODEL', 'gpt-4o')
        self.max_tokens = int(os.environ.get('AI_MAX_TOKENS', '500'))
        self.threshold  = float(os.environ.get('AI_CONFIDENCE_THRESHOLD', '0.7'))

    def load_system_prompt(self) -> str:
        try:
            from apps.ai_assistant.models import PromptVersion
            prompt = PromptVersion.objects.filter(is_active=True).first()
            if prompt:
                return prompt.content
        except Exception:
            pass

        prompt_path = os.path.join(
            os.path.dirname(__file__),
            'prompts', 'system_prompt_v1.txt'
        )
        try:
            with open(prompt_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception:
            return 'You are a helpful car rental assistant.'

    def process(self, message_text: str, conversation) -> Dict[str, Any]:
        logger.info(f'Processing message for conversation {conversation.id}')

        try:
            # Step 1: Detect language
            language = detect_language(message_text)
            contact  = conversation.contact
            if contact.language != language:
                contact.language = language
                contact.save(update_fields=['language'])

            # Step 2: Detect intent
            intent, confidence = detect_intent(message_text)
            logger.info(f'Intent: {intent} | Confidence: {confidence}')

            # Step 3: Check if should escalate
            if should_escalate(intent, confidence, self.threshold):
                return {
                    'response':   self._get_escalation_message(language),
                    'intent':     intent,
                    'confidence': confidence,
                    'escalate':   True,
                    'language':   language,
                }

            # Step 4: Load context + memory
            context = memory_manager.load_context(conversation)

            # Step 5: Get RAG context
            knowledge_context = rag_engine.retrieve(message_text)
            cars_context      = rag_engine.get_cars_context(intent)

            # Step 6: Build messages for LLM
            system_prompt = self.load_system_prompt()
            system_prompt = system_prompt.replace(
                '{cars_context}',         cars_context
            ).replace(
                '{knowledge_context}',    knowledge_context or 'No additional knowledge available.'
            ).replace(
                '{conversation_history}', memory_manager.format_history_for_prompt(context['history'])
            ).replace(
                '{customer_profile}',     memory_manager.format_profile_for_prompt(context['customer_profile'])
            )

            messages = [{'role': 'system', 'content': system_prompt}]

            # Add recent history
            for msg in context['history'][-6:]:
                messages.append({'role': msg['role'], 'content': msg['content']})

            # Add current message
            messages.append({'role': 'user', 'content': message_text})

            # Step 7: Call LLM
            response_text = self._call_llm(messages)

            # Step 8: Save memory
            memory_manager.save_context(conversation, response_text, intent)

            return {
                'response':   response_text,
                'intent':     intent,
                'confidence': confidence,
                'escalate':   False,
                'language':   language,
            }

        except Exception as e:
            logger.error(f'AI Orchestrator error: {e}', exc_info=True)
            return {
                'response':   self._get_fallback_message(),
                'intent':     'error',
                'confidence': 0.0,
                'escalate':   True,
                'language':   'en',
            }

    def _call_llm(self, messages: list) -> str:
        try:
            response = self.client.chat.completions.create(
                model       = self.model,
                messages    = messages,
                max_tokens  = self.max_tokens,
                temperature = 0.7,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f'LLM call failed: {e}')
            return self._get_fallback_message()

    def _get_escalation_message(self, language: str) -> str:
        messages = {
            'en': 'Let me connect you with one of our managers right away. Please hold on! ??',
            'ru': '?????? ??????? ??? ? ????? ??????????. ??????????, ?????????! ??',
            'tj': '????? ?????? ?? ???????? ?? ???????????. ?????? ??????? ?????! ??',
        }
        return messages.get(language, messages['en'])

    def _get_fallback_message(self) -> str:
        return 'Thank you for your message! Our team will get back to you shortly. ??'


# Singleton instance
orchestrator = AIOrchestrator()
