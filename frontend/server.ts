/**
 * Copilot Runtime for this harness.
 *
 * Shape comes from the Angular quickstart's Node runtime server
 * (https://docs.copilotkit.ai/angular/pydantic-ai/quickstart), with the agent
 * bound over plain AG-UI to the Pydantic AI backend
 * (https://ai.pydantic.dev/ag-ui/) — the Angular/Pydantic AI quickstart defers
 * the backend step to "register this backend as the `default` agent".
 *
 * Pydantic AI's `AGUIAdapter` serves the AG-UI protocol directly over SSE, so
 * the generic `HttpAgent` from `@ag-ui/client` is the binding — there is no
 * framework-specific wrapper to import.
 *
 * `default` and `support` resolve to the same Pydantic AI process. `support`
 * exists so the doc snippets that use `agentId="support"` (Chat UI, Threads)
 * run verbatim.
 *
 * `a2ui: {}` enables A2UIMiddleware for every registered agent, per
 * https://docs.copilotkit.ai/angular/pydantic-ai/backend/copilot-runtime
 */
import { createServer } from "node:http";
import { CopilotKitIntelligence, CopilotRuntime } from "@copilotkit/runtime/v2";
import { createCopilotNodeListener } from "@copilotkit/runtime/v2/node";
import { HttpAgent } from "@ag-ui/client";

// backend/main.py mounts the AG-UI adapter on POST / of the Starlette app.
const agentUrl =
  process.env["PYDANTIC_AI_AGENT_URL"] ?? "http://localhost:8000/";

// Create the Intelligence client with your project API key. Keep this key on the server.
const intelligence = new CopilotKitIntelligence({
  apiKey: process.env["CPK_INTELLIGENCE_API_KEY"]!,
});

async function authenticateApplicationUser(
  _request: Request,
): Promise<{ id: string; name: string } | null> {
  return { id: "local-user", name: "Local user" };
}

const runtime = new CopilotRuntime({
  agents: {
    default: new HttpAgent({ url: agentUrl }),
    support: new HttpAgent({ url: agentUrl }),
    // The Sub-agents supervisor, mounted by backend/main.py at /subagents/.
    // `subagents` is the agent id the Angular Showcase uses for this demo.
    // https://docs.copilotkit.ai/angular/pydantic-ai/multi-agent/subagents
    subagents: new HttpAgent({ url: new URL("subagents/", agentUrl).href }),
  },
  a2ui: {},
  intelligence,
  // Identify the user from a verified session or token
  identifyUser: async (request) => {
    const user = await authenticateApplicationUser(request);
    if (!user) throw new Error("Unauthorized");
    return { id: user.id, name: user.name };
  },
});

const port = Number(process.env["PORT"] ?? 8200);

createServer(
  createCopilotNodeListener({
    runtime,
    basePath: "/api/copilotkit",
    cors: true,
  }),
).listen(port, () => {
  console.log(
    `Copilot Runtime listening at http://localhost:${port}/api/copilotkit`,
  );
  console.log(`Pydantic AI agent: ${agentUrl}`);
});
