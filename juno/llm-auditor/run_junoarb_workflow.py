# run_junoarb_workflow.py (Interactive ADK-Native Orchestrator)
import dotenv
from google.adk.runners import InMemoryRunner
from google.genai.types import Part, UserContent

# Import our newly architected agents
from junoarb.agents.strategist import strategist_agent
from junoarb.agents.auditor import auditor_agent
from junoarb.agents.counselor import counselor_agent

dotenv.load_dotenv()

def run_agent_turn(runner, session_id, user_input_text: str):
    """
    A helper function to run a single TURN for an agent 
    within an EXISTING session.
    """
    if not user_input_text:
        return "[Skipped]"
        
    content = UserContent(parts=[Part(text=user_input_text)])
    
    response_parts = []
    # Note: We pass the existing session_id to the runner
    for event in runner.run(session_id=session_id, new_message=content):
        if event.content and event.content.parts:
            for part in event.content.parts:
                # Using print(part.text, end="") can give a nice streaming effect
                print(part.text, end="", flush=True)
                response_parts.append(part.text)
    
    print() # Adds a newline after the streamed response
    return "".join(response_parts)


if __name__ == '__main__':
    # --- Setup ---
    # Create ONE runner and ONE session for the entire interactive workflow.
    # We initialize the runner with the first agent in the chain.
    runner = InMemoryRunner(agent=strategist_agent)
    session = runner.session_service.create_session(user_id="hackathon_user")

    print("--- [JUNOARB ADK INTERACTIVE WORKFLOW ACTIVATED] ---")
    print("You will be prompted to provide input for each agent. Press Enter to use the previous agent's output or type your own.\n")

    # --- [Phase 1: Strategist] ---
    print("="*50)
    print("[Phase 1] The Strategist will draft the opponent's likely case.")
    user_prompt = input("Please provide the initial legal scenario for the Strategist:\n> ")
    
    print("\n--- Strategist's Response ---")
    strategist_output = run_agent_turn(runner, session.id, user_prompt)
    

    # --- [Phase 2: Auditor] ---
    print("\n" + "="*50)
    print("[Phase 2] The Auditor will cross-examine the strategy for weaknesses.")
    # Switch the active agent within the runner
    runner.agent = auditor_agent
    user_prompt = input("Enter the theory for the Auditor to verify (or press Enter to use the Strategist's full response):\n> ")
    
    # If the user just presses Enter, use the previous agent's output
    if not user_prompt:
        user_prompt = strategist_output

    print("\n--- Auditor's Report ---")
    auditor_output = run_agent_turn(runner, session.id, user_prompt)

    
    # --- [Phase 3: Counselor] ---
    print("\n" + "="*50)
    print("[Phase 3] The Counselor will synthesize everything into a battle plan.")
    # Switch the active agent again
    runner.agent = counselor_agent
    user_prompt = input("Enter the findings for the Counselor to act on (or press Enter to use the Auditor's full report):\n> ")

    if not user_prompt:
        user_prompt = auditor_output
        
    print("\n--- Your Strategic Battle Plan ---")
    counselor_output = run_agent_turn(runner, session.id, user_prompt)
    print("\n" + "="*50)
    print("Workflow complete.")