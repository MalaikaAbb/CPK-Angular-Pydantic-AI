# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

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
