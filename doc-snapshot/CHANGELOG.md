# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-08-21

### 17:07 UTC — 3 pages, highest severity high

**High — Human-in-the-loop and interrupts**

`/angular/pydantic-ai/guides/human-in-the-loop` · route `/human-in-the-loop` · under “Human-in-the-loop and interrupts”

26 code lines, 3 headings, 26 prose lines changed. The number of fenced code blocks changed.

````diff
- | Interrupt | The backend agent emits an AG-UI interrupt | `injectInterrupt` |
+ | Interrupt | The backend agent emits an AG-UI interrupt | `AgentStore.interruptController`, `injectInterrupt` |
- ## Handle an interrupt
+ ## Handle an interrupt from the store
+ An interrupt is a state of one conversation: this agent, this thread, this run
+ is waiting for a decision. The store that already exposes that conversation's
+ messages and state exposes its pending interrupt too, so a component that holds
+ a store needs nothing else:
````

**Medium — Introduction**

`/angular/pydantic-ai` · routes `/`, `/doc-sync` · under “Run the backend, runtime, and Angular app”

1 heading, 11 prose lines changed.

````diff
+ <Step>
+ ### Open Inspector and confirm setup
+ 
+ Angular does not mount Inspector by default. First follow [Inspector for Angular](/angular/pydantic-ai/inspector). Then, on localhost, click the Inspector button.
+ 
+ 1. Open **Agents**, then **Agent**. Your agent is listed.
+ 2. Send a chat message. Open **Agents**, then **AG-UI Events**. Events are moving.
+ 3. Open **Threads**. The list is unlocked (Intelligence is on), or locked with Enable Intelligence (Intelligence is off).
````

**Medium — Quickstart**

`/angular/pydantic-ai/quickstart` · route `/quickstart` · under “Run the backend, runtime, and Angular app”

1 heading, 11 prose lines changed.

````diff
+ <Step>
+ ### Open Inspector and confirm setup
+ 
+ Angular does not mount Inspector by default. First follow [Inspector for Angular](/angular/pydantic-ai/inspector). Then, on localhost, click the Inspector button.
+ 
+ 1. Open **Agents**, then **Agent**. Your agent is listed.
+ 2. Send a chat message. Open **Agents**, then **AG-UI Events**. Events are moving.
+ 3. Open **Threads**. The list is unlocked (Intelligence is on), or locked with Enable Intelligence (Intelligence is off).
````

---

## 2026-08-18

### 07:02 UTC — 2 pages, highest severity high

**High — Human-in-the-loop and interrupts** · _local snapshot edit, not an upstream change_

`/angular/pydantic-ai/guides/human-in-the-loop` · route `/human-in-the-loop` · under “Register a decision tool” · in a `ts` block

2 code lines changed.

````diff
+ type HumanInTheLoopToolRenderer,
+ import { registerHumanInTheLoop } from "@copilotkit/angular";
````

**Low — Threads** · _local snapshot edit, not an upstream change_

`/angular/pydantic-ai/guides/threads-memory-attachments-headless` · routes `/threads`, `/memory`, `/attachments`, `/headless` · under “Resume a specific thread”

2 prose lines changed.

````diff
+ For a custom thread list, use `injectThreads`. Its inputs accept plain values
+ or signals.
````
