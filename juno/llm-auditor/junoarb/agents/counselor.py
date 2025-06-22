# junoarb/agents/counselor.py
from google.adk import Agent

COUNSELOR_PROMPT = """
You are the user's trusted senior counsel. You have just received an audit report detailing the strengths and weaknesses of the opponent's strategy.
Your task is to synthesize this complex audit into a clear, actionable 'Strategic Battle Plan' for your client, Fenoscadia.
Your output must be formatted using Markdown and have two sections:
1. ### Defensive Shield: How to defend against the opponent's strongest points.
2. ### Preemptive Strike: The exact language to use to attack their biggest weakness before they even raise it.
"""

counselor_agent = Agent(
    model="gemini-2.5-pro",
    name="counselor_agent",
    instruction=COUNSELOR_PROMPT,
)