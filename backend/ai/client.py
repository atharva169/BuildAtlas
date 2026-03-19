"""Gemini AI client — async wrapper with fallback."""
import json
import logging
from typing import AsyncGenerator

logger = logging.getLogger(__name__)

# Try to import google.generativeai, fallback gracefully
try:
    import google.generativeai as genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False
    logger.warning("google-generativeai not installed. AI features will use defaults.")

from backend.ai.prompts import (
    RISK_NARRATIVE_PROMPT,
    DELAY_MITIGATION_PROMPT,
    MATERIAL_SWAP_PROMPT,
    COPILOT_SYSTEM_PROMPT,
)


class AIClient:
    """Async Gemini API wrapper with graceful fallback."""

    def __init__(self, api_key: str = ""):
        self.api_key = api_key
        self.model = None
        if HAS_GENAI and api_key and api_key != "your-gemini-api-key-here":
            try:
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel("gemini-2.0-flash")
                logger.info("Gemini AI client initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini: {e}")

    @property
    def is_available(self) -> bool:
        return self.model is not None

    async def generate(self, prompt: str) -> str:
        """Generate text from prompt. Returns empty string on failure."""
        if not self.is_available:
            return ""
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return ""

    async def generate_risk_narratives(self, context: dict) -> dict:
        """Generate risk narratives. Returns {risk_id: narrative}."""
        if not self.is_available:
            return {}
        prompt = RISK_NARRATIVE_PROMPT.format(
            project_type=context.get("project_type", "residential"),
            city=context.get("city", ""),
            num_floors=context.get("num_floors", 2),
            risk_items_json=json.dumps(context.get("risks", []), indent=2),
        )
        text = await self.generate(prompt)
        try:
            # Try to parse JSON from the response
            text = text.strip()
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            return json.loads(text)
        except (json.JSONDecodeError, IndexError):
            return {}

    async def generate_delay_mitigations(self, phase_name: str,
                                          delay_days: int,
                                          cascade_json: str) -> list:
        if not self.is_available:
            return []
        prompt = DELAY_MITIGATION_PROMPT.format(
            phase_name=phase_name,
            delay_days=delay_days,
            cascade_json=cascade_json,
        )
        text = await self.generate(prompt)
        try:
            text = text.strip()
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            return json.loads(text)
        except (json.JSONDecodeError, IndexError):
            return []

    async def generate_swap_reasoning(self, swap_data: dict) -> str:
        if not self.is_available:
            return swap_data.get("notes", "")
        prompt = MATERIAL_SWAP_PROMPT.format(**swap_data)
        return await self.generate(prompt) or swap_data.get("notes", "")

    async def stream_copilot(self, context: dict,
                              message: str) -> AsyncGenerator[str, None]:
        """Stream copilot response token by token."""
        if not self.is_available:
            yield "AI copilot requires a Gemini API key. Please set GEMINI_API_KEY in backend/.env"
            return

        system = COPILOT_SYSTEM_PROMPT.format(
            project_context_json=json.dumps(context, indent=2) if context else "{}"
        )
        try:
            response = self.model.generate_content(
                [system, f"User question: {message}"],
                stream=True,
            )
            for chunk in response:
                if chunk.text:
                    yield chunk.text
        except Exception as e:
            logger.error(f"Copilot stream error: {e}")
            yield f"Sorry, I encountered an error: {str(e)}"


def get_ai_client(api_key: str = "") -> AIClient:
    return AIClient(api_key)
