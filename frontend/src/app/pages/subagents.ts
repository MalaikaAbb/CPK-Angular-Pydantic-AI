import { Component } from '@angular/core';

import { RouteHeader } from '../components/route-header';
import { Callout, Panel, SourceCode, TryIt } from '../components/ui';

@Component({
  selector: 'app-subagents-page',
  imports: [RouteHeader, Panel, Callout, TryIt, SourceCode],
  template: `
    <app-route-header path="/subagents" />

    <div class="space-y-6">
      <ui-try-it>
        <p class="mt-1 text-slate-700">
          Open the demo and send
          <em>Write a short paragraph on solar panels.</em>
        </p>
        <p class="mt-2 text-slate-700">
          <strong>Pass:</strong> a Researcher, Writer, and Critic card appears
          in the transcript as each sub-agent runs, and the delegation log on
          the left grows to 3 calls, each carrying that sub-agent's output.
          <strong>Fail:</strong> the cards render but the log stays empty — the
          supervisor's <code>delegations</code> state is not reaching the
          browser. No cards and a discovery error means the
          <code>subagents</code> agent is not registered; check
          <code>/api/copilotkit/info</code>.
        </p>
      </ui-try-it>

      <ui-panel heading="Backend — supervisor and sub-agents">
        <p class="text-sm text-slate-700">
          <code>backend/agents/subagents.py</code> is the guide's complete
          snippet, unchanged. Each sub-agent is its own PydanticAI
          <code>Agent</code> on <code>gpt-5-mini</code>; each delegation tool
          appends a <code>running</code> entry to
          <code>ctx.deps.state.delegations</code>, runs the sub-agent, then
          marks the entry <code>completed</code> or <code>failed</code>.
          <code>backend/main.py</code> mounts the supervisor at
          <code>POST /subagents/</code> with its own
          <code>StateDeps(SubagentsState())</code> per request, and
          <code>server.ts</code> registers it under the key
          <code>subagents</code>.
        </p>
      </ui-panel>

      <ui-panel heading="Register the supervisor">
        <ui-source path="server.ts" />
      </ui-panel>

      <ui-panel heading="Rendering a live delegation log">
        <ui-source
          path="src/app/features/subagents/subagents-chat.component.ts"
        />
      </ui-panel>

      <ui-panel heading="Reading the delegations slot">
        <ui-source path="src/app/features/subagents/subagent-model.ts" />
      </ui-panel>

      <ui-panel heading="One renderer per sub-agent tool">
        <ui-source
          path="src/app/features/subagents/subagent-renderer-config.ts"
        />
      </ui-panel>

      <ui-panel heading="Transcript card and delegation log">
        <ui-source path="src/app/features/subagents/subagent-cards.ts" />
      </ui-panel>

      <ui-callout title="Not in the guide — taken from the showcase source">
        The guide's Python is complete; what it leaves out is how the
        supervisor is served. <code>mount_agent</code> and the
        <code>/subagents</code> mount in <code>backend/main.py</code> are the
        showcase's own (<code>showcase/integrations/pydantic-ai/src/agent_server.py</code>).
        On the frontend, the <code>subagents</code> agent id,
        <code>readDelegations</code>, <code>subAgentRendererConfig</code>,
        and both card components come from the Angular Showcase the guide
        quotes.
      </ui-callout>

      <ui-callout tone="warn" title="Verified broken — the delegation log never fills">
        In a run on 12 Oct 2026 the supervisor called
        <code>research_agent</code>, <code>writing_agent</code> and
        <code>critique_agent</code> and finished normally, but the stream
        contained no <code>STATE_SNAPSHOT</code> or <code>STATE_DELTA</code>
        and never mentioned <code>delegations</code>. The guide's tools record
        delegations by mutating <code>ctx.deps.state</code> and say the AG-UI
        bridge syncs that back at end of turn. The installed
        <code>pydantic-ai-slim</code> 2.55.0 does not: its AG-UI adapter only
        reads client state in, and forwards state out only when a tool returns
        an AG-UI event (such as a <code>StateSnapshotEvent</code>) as its
        result or metadata. The guide's code is kept as published.
      </ui-callout>

      <ui-callout tone="warn" title="Running and failed entries are not shown">
        The backend writes a <code>running</code> entry before each sub-agent
        call and can finish one as <code>failed</code>. The Angular Showcase's
        <code>readDelegations</code> keeps only <code>completed</code>
        entries, so the log shows each delegation once it finishes, and a
        failed delegation appears only as the supervisor's message in the
        chat.
      </ui-callout>
    </div>
  `,
})
export default class SubagentsPage {}
