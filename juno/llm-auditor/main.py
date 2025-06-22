# main.py (FINAL VERSION)
from contextlib import asynccontextmanager
from fastapi import FastAPI
from pydantic import BaseModel
from google.adk.runners import InMemoryRunner
from fastapi.middleware.cors import CORSMiddleware

# Import your agents and the new resource loader function
from junoarb.agents.strategist import strategist_agent
from junoarb.agents.auditor import auditor_agent
from junoarb.agents.counselor import counselor_agent
from junoarb.junoarb_tool import load_resources

# This lifespan manager will run the `load_resources` function on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the model and index
    print("--- [API LIFESPAN] Application startup... ---")
    load_resources()
    yield
    # Clean up resources if needed on shutdown (not needed for this app)
    print("--- [API LIFESPAN] Application shutdown. ---")

app = FastAPI(
    title="JunoArb Legal Analysis Agent",
    description="An API for running a multi-agent legal workflow.",
    lifespan=lifespan # Attach the lifespan manager to the app
)

# CORS Middleware for connecting to your Firebase UI
origins = ["*"] # Allow all origins for the hackathon
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    prompt: str

async def run_turn(runner, session_id, input_text: str) -> str:
    from google.genai.types import Part, UserContent
    content = UserContent(parts=[Part(text=input_text)])
    response_parts = [
        part.text async for event in runner.run(session_id=session_id, new_message=content)
        if event.content and event.content.parts for part in event.content.parts
    ]
    return "".join(response_parts)

async def run_full_analysis(user_prompt: str):
    print("--- [API] Kicking off new analysis workflow ---")
    runner = InMemoryRunner(agent=strategist_agent)
    session = await runner.session_service.create_session(user_id="api_user", app_name="junoarb_fastapi")

    print("--- [API] Phase 1: Running Strategist... ---")
    strategist_output = await run_turn(runner, session.id, user_prompt)

    print("--- [API] Phase 2: Running Auditor... ---")
    runner.agent = auditor_agent
    auditor_output = await run_turn(runner, session.id, strategist_output)

    print("--- [API] Phase 3: Running Counselor... ---")
    runner.agent = counselor_agent
    counselor_output = await run_turn(runner, session.id, auditor_output)
    
    return {
        "strategist_report": strategist_output,
        "audit_report": auditor_output,
        "final_counsel": counselor_output,
    }

@app.post("/analyse")
async def analyse_prompt(request: AnalysisRequest):
    results = await run_full_analysis(request.prompt)
    return results