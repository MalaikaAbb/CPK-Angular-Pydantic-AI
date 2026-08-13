from pydantic_ai import Agent
from pydantic_ai.ui.ag_ui import AGUIAdapter
from starlette.applications import Starlette
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.routing import Route

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

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)