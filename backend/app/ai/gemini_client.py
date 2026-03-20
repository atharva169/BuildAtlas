"""
BuildAtlas GenAI — Gemini API Client
Handles all LLM interactions: risk narratives, copilot chat, material reasoning,
and reverse-planning recommendations.  Includes retry logic and template fallbacks.
"""

from __future__ import annotations

import json
import logging
import os
from typing import Optional

logger = logging.getLogger("buildatlas.gemini")

# System prompt templates — context variables injected at call time
SYSTEM_PROMPTS: dict[str, str] = {
    "risk_narrative": (
        "You are a senior Indian construction risk consultant. "
        "Given this risk data for a {project_type} project in {city} ({floors} floors, {builtup_sqft} sqft):\n\n"
        "Risk: {risk_title} (Score: {score}/10, Category: {category})\n\n"
        "Write exactly 2 sentences:\n"
        "1. Why this risk matters for THIS specific project.\n"
        "2. One concrete mitigation action with Indian construction context.\n"
        "Be direct. Reference specific ₹ amounts, IS codes, or RERA sections when relevant. "
        "Do not use bullet points."
    ),
    "copilot": (
        "You are BuildAtlas AI Copilot — a senior construction expert for Indian projects.\n\n"
        "ACTIVE PROJECT:\n{project_context}\n\n"
        "Answer the user's question in 3–5 sentences. Be specific — reference their actual numbers. "
        "If an IS code is relevant, cite the specific clause (e.g., IS 456 Clause 26.3). "
        "Use Indian construction terms (lakh, crore, sqft, cum, rmt). "
        "If you don't know, say so clearly."
    ),
    "material_reasoning": (
        "Given this material substitution for a {project_type} project in {city}:\n"
        "From: {from_material} ({from_is_code})\n"
        "To: {to_material} ({to_is_code})\n\n"
        "Write one sentence on IS code structural implications and one sentence on practical "
        "installation notes. Keep it under 50 words total."
    ),
    "reverse_planning": (
        "Given 3 build configurations for a budget of ₹{budget_lakhs}L in {city}:\n"
        "{configs}\n\n"
        "In 2–3 sentences explain which option you recommend and why, considering "
        "long-term value, maintenance costs, and India-specific construction realities."
    ),
    "project_report": (
        "You are a senior Indian construction consultant generating a professional project feasibility report.\n\n"
        "PROJECT DATA:\n{project_data}\n\n"
        "Generate a structured feasibility report in markdown with EXACTLY these sections:\n\n"
        "# Project Feasibility Report: {project_name}\n\n"
        "## 1. Executive Summary\n"
        "(3-4 sentences summarizing the project, key findings, and overall recommendation)\n\n"
        "## 2. Cost Analysis\n"
        "(Interpret P10/P50/P90 bands. Explain what drives variance. Recommend contingency %)\n\n"
        "## 3. Schedule & Monsoon Impact\n"
        "(Analyse the timeline, monsoon overlap, critical path risks, and mitigation)\n\n"
        "## 4. Top Risks & AI Mitigation Strategies\n"
        "(List top 3 risks with scores, explain each, provide actionable mitigations with IS code refs)\n\n"
        "## 5. Material Recommendations\n"
        "(Recommend optimal materials for this city/quality grade, cite IS codes)\n\n"
        "## 6. Compliance Summary\n"
        "(List key RERA, municipal, and IS code requirements for this project)\n\n"
        "## 7. AI Recommendation\n"
        "(Final go/no-go recommendation with 2-3 specific action items for the builder)\n\n"
        "Use Indian construction terms (lakh, crore, sqft). Cite specific IS codes. Be data-driven and professional."
    ),
}

# Fallback templates when Gemini is unavailable
FALLBACK_TEMPLATES: dict[str, str] = {
    "risk_narrative": (
        "This risk could impact project timelines and costs for your {city} project. "
        "Consider consulting with local experts and building contingency into your budget."
    ),
    "copilot": (
        "I'm currently unable to connect to the AI service. Please try again shortly. "
        "In the meantime, refer to IS 456:2000 and CPWD General Specifications 2022 for guidance."
    ),
    "material_reasoning": (
        "This material substitution may affect structural calculations per the applicable IS code. "
        "Consult your structural engineer before making this change."
    ),
    "reverse_planning": (
        "Based on your budget and timeline, the standard grade offers the best balance of "
        "quality, cost, and construction speed for most Indian residential projects."
    ),
    "project_report": (
        "# Project Feasibility Report\n\n"
        "## Executive Summary\nThis project appears feasible based on the provided parameters. "
        "A detailed AI-generated report requires the Gemini API connection.\n\n"
        "## Recommendation\nProceed with standard specifications and maintain a 15% contingency buffer."
    ),
}


class GeminiClient:
    """Async-compatible Gemini API client with retry and fallback logic."""

    def __init__(self) -> None:
        """Initialise the Gemini client. Lazy-loads the SDK."""
        self._api_key: Optional[str] = os.getenv("GEMINI_API_KEY")
        self._model = None
        self._available = False

        if self._api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self._api_key)
                self._model = genai.GenerativeModel("gemini-1.5-flash")
                self._available = True
                logger.info("Gemini client initialised with gemini-1.5-flash")
            except Exception as exc:
                logger.warning("Gemini SDK init failed: %s — using fallbacks", exc)
        else:
            logger.info("GEMINI_API_KEY not set — LLM features will use fallback templates")

    @property
    def is_available(self) -> bool:
        """Whether Gemini API is configured and ready."""
        return self._available

    async def generate(self, prompt_key: str, context: dict) -> str:
        """
        Generate text using the specified prompt template and context variables.
        Falls back to template text if Gemini is unavailable or errors.
        """
        template = SYSTEM_PROMPTS.get(prompt_key, "")
        if not template:
            return "Unknown prompt key."

        try:
            prompt = template.format(**context)
        except KeyError as e:
            logger.error("Missing context variable for prompt '%s': %s", prompt_key, e)
            return FALLBACK_TEMPLATES.get(prompt_key, "Unable to generate response.").format(**{k: context.get(k, "N/A") for k in ("city",)})

        if not self._available or not self._model:
            logger.debug("Gemini unavailable — returning fallback for '%s'", prompt_key)
            try:
                return FALLBACK_TEMPLATES.get(prompt_key, "AI service unavailable.").format(**context)
            except KeyError:
                return FALLBACK_TEMPLATES.get(prompt_key, "AI service unavailable.")

        # Attempt generation with retry
        for attempt in range(3):
            try:
                response = self._model.generate_content(prompt)
                if response and response.text:
                    return response.text.strip()
                logger.warning("Empty Gemini response on attempt %d", attempt + 1)
            except Exception as exc:
                logger.warning("Gemini call failed (attempt %d): %s", attempt + 1, exc)
                if attempt == 2:
                    break
                import asyncio
                await asyncio.sleep(1.5 * (attempt + 1))  # exponential backoff

        try:
            return FALLBACK_TEMPLATES.get(prompt_key, "AI service temporarily unavailable.").format(**context)
        except KeyError:
            return FALLBACK_TEMPLATES.get(prompt_key, "AI service temporarily unavailable.")

    def build_project_context_string(self, project_data: dict) -> str:
        """Format project data as a readable context string for LLM prompts."""
        parts = [
            f"Project: {project_data.get('project_name', 'N/A')}",
            f"City: {project_data.get('city', 'N/A')}",
            f"Type: {project_data.get('project_type', 'N/A')}",
            f"Floors: {project_data.get('floors', 'N/A')}",
            f"Built-up Area: {project_data.get('builtup_sqft', 'N/A')} sqft",
            f"Quality: {project_data.get('quality', 'N/A')}",
            f"Start: {project_data.get('start_month', 'N/A')}/{project_data.get('start_year', 'N/A')}",
            f"Soil: {project_data.get('soil_type', 'N/A')}",
            f"Vastu: {'Yes' if project_data.get('vastu') else 'No'}",
        ]
        if project_data.get("budget_lakhs"):
            parts.append(f"Budget: ₹{project_data['budget_lakhs']}L")
        return "\n".join(parts)
