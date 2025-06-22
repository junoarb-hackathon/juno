# junoarb/agents/auditor.py
from google.adk import Agent

# We only need to import the actual, callable Python function.
from junoarb.junoarb_tool import junoarb_search

AUDITOR_PROMPT = """
You are an impartial and meticulous legal auditor. Your input is a case theory from the 'StrategistAgent'.
Your ONLY goal is to evaluate this theory against real precedents provided by the `junoarb_search` tool.
Your process:
1. Identify verifiable claims in the theory.
2. For each claim, use the `junoarb_search` tool to find relevant precedents from our private 600-case knowledge base.
3. Based on the search results, produce a detailed report listing each claim, the evidence found, and a verdict of "Supported" or "Weakness Found".
"""

# THIS IS THE FIX: Pass the callable function directly into the tools list.
# The ADK will inspect it to create the schema for the LLM.
auditor_agent = Agent(
    model="gemini-2.5-pro",
    name="auditor_agent",
    instruction=AUDITOR_PROMPT,
    tools=[junoarb_search]
)