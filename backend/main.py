from pydantic_ai import Agent
from pydantic_ai.ui import StateDeps
from pydantic_ai.ui.ag_ui import AGUIAdapter
from starlette.applications import Starlette
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.routing import Route

# Sub-agents supervisor, verbatim from
# https://docs.copilotkit.ai/angular/pydantic-ai/multi-agent/subagents
from agents.subagents import SubagentsState
from agents.subagents import agent as subagents_agent

agent = Agent('openai:gpt-4.1-mini', instructions='Be fun!')


@agent.tool_plain
async def getWeather(location: str = "Everywhere ever") -> str:
    """Get the weather for a given location. Ensure location is fully spelled out."""
    return f"The weather in {location} is sunny."


async def run_agent(request: Request) -> Response:
    return await AGUIAdapter.dispatch_request(request, agent=agent)


# Allow the Angular app to call this server from the browser.
#
# The chat does not need this: the browser only ever talks to the Copilot
# Runtime, which reaches this agent server-side, where CORS does not apply.
# It is here so the harness's connection check can read this endpoint directly
# and report a real status code instead of failing as "unreachable". A GET
# answers 405 (this route is POST-only), which is the healthy response.
cors = Middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",  # ng serve
        "http://localhost:4000",  # SSR build — npm run serve:ssr:frontend
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app = Starlette(
    routes=[Route("/", run_agent, methods=["POST"])],
    middleware=[cors],
)


# The Sub-agents guide defines the supervisor but not how it is served. This
# helper and the mount below are the showcase's own
# (showcase/integrations/pydantic-ai/src/agent_server.py), which serves the
# supervisor at `/subagents` with a fresh `StateDeps(SubagentsState())` per
# request, so concurrent runs cannot overwrite each other's state.
def mount_agent(path, agent_obj, state_type=None):
    async def endpoint(request: Request) -> Response:
        deps = StateDeps(state_type()) if state_type is not None else None
        return await AGUIAdapter.dispatch_request(request, agent=agent_obj, deps=deps)

    sub = Starlette()
    sub.router.add_route("/", endpoint, methods=["POST"], name="run_agent")
    app.mount(path, sub)


mount_agent("/subagents", subagents_agent, SubagentsState)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)