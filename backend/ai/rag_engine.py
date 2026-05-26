import logging
from typing import List

logger = logging.getLogger(__name__)


class RAGEngine:

    def retrieve(self, query: str, top_k: int = 3) -> str:
        try:
            from apps.knowledge_base.models import KnowledgeChunk
            chunks = KnowledgeChunk.objects.filter(
                document__status='indexed'
            ).order_by('?')[:top_k]

            if not chunks:
                return ''

            texts = [chunk.content for chunk in chunks]
            return '\n\n'.join(texts)

        except Exception as e:
            logger.error(f'RAG retrieval error: {e}')
            return ''

    def get_cars_context(self, intent: str = None) -> str:
        try:
            from apps.cars.models import Car
            cars = Car.objects.filter(
                status='available'
            ).select_related('brand', 'category')[:10]

            if not cars:
                return 'No cars currently available.'

            lines = ['Available cars:']
            for car in cars:
                line = (
                    f'- {car.brand.name} {car.name} {car.year} | '
                    f'{car.transmission} | {car.fuel_type} | '
                    f'{car.seats} seats | '
                    f'/day'
                )
                if car.weekly_price:
                    line += f' | /week'
                lines.append(line)

            return '\n'.join(lines)

        except Exception as e:
            logger.error(f'Error getting cars context: {e}')
            return 'Car information temporarily unavailable.'
