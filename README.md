# CopilotKit + Pydantic AI Test Suite — Angular

A navigable, working test harness for the Angular section of the CopilotKit
Pydantic AI documentation — each guide is a route that runs the thing it describes.

| | |
|---|---|
| **CopilotKit packages** | `@copilotkit/angular` 0.3.1 · `@copilotkit/runtime` 1.67.1 |
| **AG-UI packages** | `@ag-ui/client` 0.0.57 (generic `HttpAgent`) |
| **Frontend** | Angular 22.1.1 · TypeScript 6.0 · Tailwind 4 · zoneless |
| **Runtime** | Node 24.16.0 · Copilot Runtime v2 Node listener on :8200 |
| **Backend** | Python 3.13 · `pydantic-ai-slim` 2.28.0 · Starlette 1.6.0 / uvicorn on :8000 |
| **Tracks** | <https://docs.copilotkit.ai/angular/pydantic-ai> |

---

## Architecture

Three processes, not two.

```
Browser (Angular 22, zoneless)
  │  @copilotkit/angular — provideCopilotKit, <copilot-chat>, signal APIs
  │  POST http://localhost:8200/api/copilotkit
  ▼
Copilot Runtime  ·  localhost:8200        ← Node, frontend/server.ts
  │  agents: { default, support } → new HttpAgent({ url })
  │  a2ui: {}  → A2UIMiddleware
  │  POST http://localhost:8000/          ← AG-UI over SSE
  ▼
Pydantic AI  ·  localhost:8000            ← Python / Starlette
  │  AGUIAdapter.dispatch_request(request, agent=agent)
  ▼
OpenAI  (gpt-4.1-mini)
```

- **Why three.** Unlike the React/Next quickstart, where the runtime lives inside
  the Next app as an API route, Angular has no server route to host it — so the
  Copilot Runtime is its own Node process.
- **Why `HttpAgent`.** Pydantic AI's `AGUIAdapter` serves the AG-UI protocol
  directly over SSE, so the generic `HttpAgent` from `@ag-ui/client` is the
  binding. There is no framework-specific wrapper to import.
- **Why two agent ids.** `default` and `support` both resolve to the same
  Pydantic AI process. `default` is what CopilotKit's prebuilt components use with
  no configuration; `support` exists so the Chat UI and Threads guides' snippets —
  written as `agentId="support"` — run exactly as published.
- **The model key never reaches the browser**, and never reaches the runtime
  either. Only the Python process holds it.

---

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | 22+ (built on 24.16.0) | The Angular quickstart specifies Node 22. |
| npm | 10+ (built on 12.0.1) | Or pnpm/yarn. |
| Python | 3.13+ | Per `backend/.python-version`. |
| [`uv`](https://docs.astral.sh/uv/) | 0.11+ (built on 0.11.20) | Used for the backend. `pip` works too. |
| OpenAI API key | — | Required. |
| CopilotKit license key | — | **Optional.** Only affects the Threads and Memory routes. |

`@angular/cdk` must share your Angular major version. If you hit a
peer-dependency error, pin it explicitly (`@angular/cdk@^22` on Angular 22).

---

## Setup

**1. Install frontend deps**

```bash
cd frontend && npm install && cd ..
```

**2. Install backend deps**

```bash
cd backend && uv sync && cd ..
```

**3. Provide the model key**

`backend/main.py` does **not** load a `.env` file — there is no `python-dotenv`
call in it — so the key has to be in the environment of the shell that starts
the agent:

```bash
export OPENAI_API_KEY=sk-...
```

Put it in your shell profile, or prefix the run command with it, or add a
`load_dotenv()` to `main.py` if you prefer a `.env`.

**Environment variables**

| Variable | Where | What it does |
|---|---|---|
| `OPENAI_API_KEY` | shell for the **agent** | **Required.** The model key. |
| `PYDANTIC_AI_AGENT_URL` | shell for the **runtime** | Where the runtime finds the agent. Defaults to `http://localhost:8000/`. |
| `PORT` | shell for the **runtime** | Runtime port. Defaults to `8200`. |
| `COPILOTKIT_TELEMETRY_DISABLED` | shell for the **runtime** | Opt out of anonymous runtime telemetry. |

> The Angular app's `runtimeUrl` is hardcoded to
> `http://localhost:8200/api/copilotkit` in `frontend/src/app/app.config.ts`,
> following the quickstart. If you change `PORT`, change that too.

**Default ports:** frontend **4200**, runtime **8200**, agent **8000**.

---

## Running the project

Three processes. The two Node ones share a terminal; the Python agent gets its own.

**Terminal 1 — the agent:**

```bash
cd backend
uv run main.py
```

Success looks like:

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [37323] using StatReload
```

**Terminal 2 — the runtime and the app together:**

```bash
cd frontend
npm run dev
```

`dev` runs the Copilot Runtime and `ng serve` side by side under `concurrently`,
each line prefixed by which process wrote it. Success looks like:

```
[runtime] Copilot Runtime listening at http://localhost:8200/api/copilotkit
[runtime] Pydantic AI agent: http://localhost:8000/
[angular]   ➜  Local:   http://localhost:4200/
```

Ctrl-C stops both. `--kill-others` means a crash in either takes the other down
rather than leaving half a stack running.

To run them separately — different terminals, independent restarts:

```bash
npm run runtime   # Copilot Runtime only, :8200
npm start         # Angular dev server only, :4200
```

Open **<http://localhost:4200>**. The Introduction route probes both backends and
shows a connection panel — check it first if anything misbehaves.

---

## Verifying it works

**1. The runtime sees both agents:**

```bash
curl -s http://localhost:8200/api/copilotkit/info
```

Should list `default` and `support` under `agents`, with `"a2uiEnabled": true`.

**2. The agent is up.** It is POST-only, so a `GET` answering **405** is the
healthy response — it proves the process is listening:

```bash
curl -i http://localhost:8000/
# HTTP/1.1 405 Method Not Allowed
# allow: POST
```

The Introduction route's connection panel treats that 405 as green for exactly
this reason.

**3. End to end** — a real run through the whole stack:

```bash
curl -N -X POST http://localhost:8200/api/copilotkit/agent/default/run \
  -H 'Content-Type: application/json' \
  -d '{"threadId":"t1","runId":"r1","messages":[{"id":"m1","role":"user","content":"hi"}],
       "tools":[],"context":[],"state":{},"forwardedProps":{}}'
```

You should see AG-UI events stream back:

```
data: {"type":"RUN_STARTED",...}
data: {"type":"TEXT_MESSAGE_START",...}
data: {"type":"TEXT_MESSAGE_CONTENT","delta":"Hi"}
```

**4. In the browser** — open `/quickstart` and send `Can you tell me a joke?`
Tokens should stream in one at a time and render as markdown.

---

## Other commands

```bash
npm run build         # production build → dist/frontend
npm run gen:sources   # regenerate the on-page source map (auto-runs on start/build)
npm test              # Vitest
```

`scripts/generate-sources.ts` reads the real files off disk into
`src/app/lib/generated-sources.ts`, so the code shown on a route page is what
actually runs. Angular's esbuild pipeline has no `?raw` import, which is why this
is a prestart/prebuild step rather than an import.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Chat sends, nothing streams back | Runtime or agent process down | Check the Introduction route's connection panel; `curl http://localhost:8200/api/copilotkit/info`. |
| `/info` returns nothing | Runtime not started | `npm run runtime` from `frontend/`. |
| Agent exits immediately, or runs fail on the model call | No `OPENAI_API_KEY` in the agent's shell | `export OPENAI_API_KEY=sk-...` — `main.py` reads no `.env`. |
| `[Errno 98] Address already in use` | Another framework harness in this workspace (llamaIndex, agno, …) also defaults to :8000 | `ss -ltnp \| grep :8000` and check `ls -l /proc/<pid>/cwd` to see which one. Stop it, or run this agent elsewhere: `uv run uvicorn main:app --port 8001` plus `PYDANTIC_AI_AGENT_URL=http://localhost:8001/`. |
| Agent probe red / "unreachable" while :8000 **is** listening | A *different* project's backend holds the port — it answers 404 rather than 405 | Same check as above. A healthy Pydantic AI agent answers a `GET /` with **405** and `allow: POST`. |
| Connection errors mentioning `localhost` | DNS resolving to IPv6 while the server binds IPv4 | Use `127.0.0.1` in `PYDANTIC_AI_AGENT_URL`. |
| A run starts, then hangs forever | The agent called a browser tool with no registered handler, so no result returns | Every tool the agent can call needs a matching `registerFrontendTool` / `registerHumanInTheLoop` mounted. |
| Chat renders unstyled | Missing stylesheet | `@import "@copilotkit/angular/styles.css";` must be in `src/styles.css`. |
| CORS errors from the browser | Runtime CORS off | Keep `cors: true` in `createCopilotNodeListener`. |
| Thread list empty, drawer shows a lock | No license key | Expected — not a bug. |
| Source panels say "Source not generated" | Generated map is stale | `npm run gen:sources`. |
| Peer-dependency error on install | `@angular/cdk` major mismatch | Install the matching major, e.g. `@angular/cdk@^22`. |

---

## Project structure

```
pydantic-ai/
├── README.md
│
├── frontend/                  # Angular 22 app + the Copilot Runtime process
│   ├── AGENTS.md              # Angular style rules this repo's own code follows
│   ├── server.ts              # ★ CopilotRuntime + HttpAgent binding  → :8200
│   ├── scripts/
│   │   └── generate-sources.ts  # ★ reads real files → generated-sources.ts
│   └── src/
│       ├── styles.css         # CopilotKit stylesheet + the guides' CSS verbatim
│       └── app/
│           ├── app.config.ts        # ★ provideCopilotKit, a2ui, openGenerativeUI
│           ├── app.routes.ts        # doc routes in chrome, demo routes outside it
│           ├── lib/
│           │   ├── nav-config.ts    # ★ single source of truth: routes, docs, status
│           │   └── generated-sources.ts   # GENERATED — do not edit
│           ├── components/          # harness chrome (nav, header, source, health)
│           ├── features/            # ★ the doc code that actually runs
│           └── pages/               # one page per doc route + demos.ts + status
│
└── backend/                   # Python agent — Pydantic AI over AG-UI  → :8000
    ├── pyproject.toml
    └── main.py                # ★ Agent + AGUIAdapter on POST /
```

Routes with a live feature are split in two: `<route>` holds the notes, pass/fail
criteria, and the exact source; `<route>/demo` holds just the running feature with
no page chrome. Demo routes share the app-root provider, so a conversation started
in one continues in another.

---

## Current state

Verified locally on 2026-08-13: `npm run build` ✅ · runtime registers `default`
and `support` ✅ · agent answers on :8000 ✅ · **live end-to-end run streaming
AG-UI events through the full stack** ✅.

**The backend is currently a stub.** `backend/main.py` is
`Agent('openai:gpt-4.1-mini', instructions='Be fun!')` — no tools, no state, no
deferred/approval-gated tools. So plain chat and browser-side tools work, but the
routes that need a backend counterpart do not have one yet:

| Route | Needs in `main.py` |
|---|---|
| `/frontend-tools-generative-ui` | a `getWeather(city)` tool — the renderer name must match the tool name exactly, including case |
| `/shared-state` | agent-visible, agent-updatable state matching `{ notes, priority }` |
| `/human-in-the-loop` (interrupt half) | a deferred or approval-gated tool that emits an AG-UI interrupt |

Those route pages still describe the tools and state as if they existed — they
came from the Agno harness this was converted from. Treat their prose as the
target to build toward, not a description of the current backend.

---

## References

**Getting Started** — [Angular + Pydantic AI quickstart](https://docs.copilotkit.ai/angular/pydantic-ai/quickstart)

**Guides** — [Chat UI and customization](https://docs.copilotkit.ai/angular/pydantic-ai/guides/chat-ui) · [Frontend tools and generative UI](https://docs.copilotkit.ai/angular/pydantic-ai/guides/frontend-tools-generative-ui) · [A2UI](https://docs.copilotkit.ai/angular/pydantic-ai/guides/a2ui) · [Voice and multimodal](https://docs.copilotkit.ai/angular/pydantic-ai/guides/voice-multimodal) · [Human-in-the-loop and interrupts](https://docs.copilotkit.ai/angular/pydantic-ai/guides/human-in-the-loop) · [Shared state and agent context](https://docs.copilotkit.ai/angular/pydantic-ai/guides/shared-state) · [Threads, memory, attachments, and headless UI](https://docs.copilotkit.ai/angular/pydantic-ai/guides/threads-memory-attachments-headless)

**Backend** — [Copilot Runtime](https://docs.copilotkit.ai/angular/pydantic-ai/backend/copilot-runtime)

**External** — [Pydantic AI docs](https://ai.pydantic.dev/) · [Pydantic AI AG-UI](https://ai.pydantic.dev/ag-ui/) · [AG-UI protocol](https://ag-ui.com) · [Angular API reference](https://docs.copilotkit.ai/reference/angular)
