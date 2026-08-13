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
import { CopilotRuntime } from "@copilotkit/runtime/v2";
import { createCopilotNodeListener } from "@copilotkit/runtime/v2/node";
import { HttpAgent } from "@ag-ui/client";

// backend/main.py mounts the AG-UI adapter on POST / of the Starlette app.
const agentUrl =
  process.env["PYDANTIC_AI_AGENT_URL"] ?? "http://localhost:8000/";

const runtime = new CopilotRuntime({
  agents: {
    default: new HttpAgent({ url: agentUrl }),
    support: new HttpAgent({ url: agentUrl }),
  },
  a2ui: {},
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
