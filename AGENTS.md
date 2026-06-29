<!-- governance-schema: 1.0.0 -->
# Repository Instructions

## Scope

These instructions apply to the whole repository. `AGENTS.md` is the canonical
project guidance for Codex and for the ai-spec harness. `CLAUDE.md` imports
this file for Claude Code.

## Primary References

- For any Mastra task, use the vendored official skill in `.agents/skills/mastra/`
  before relying on memory.
- Treat `.agents/skills/mastra.upstream.txt` as the source pin for the vendored
  skill.
- Treat `.agents/skills/agent-governance/SKILL.md` as the canonical execution
  and validation workflow for code changes.
- Treat `agents/README.md` as the human-facing runbook and
  `agents/package.json` as the source of truth for commands.

## Base Load Contract

Any skill or agent that changes code must load this base first:

1. Read `AGENTS.md`.
2. Read `.agents/skills/agent-governance/SKILL.md`.
3. Read the implementation skill for the affected stack.

For this repository, code changes in `agents/` should also load:

- `.agents/skills/node-implementation/SKILL.md`
- `.agents/skills/mastra/SKILL.md` when the task touches Mastra behavior, APIs,
  runtime configuration, CLI usage, or framework conventions

Load additional references only when the active skill requires them.

## Working Rules

- Do not guess Mastra APIs, constructors, model names, or CLI flags when the
  local skill or installed package docs can verify them.
- Prefer the installed Mastra package docs and types in
  `agents/node_modules/@mastra/*` because they match the exact pinned runtime.
- Keep changes minimal, typed, and verifiable. Do not add speculative
  abstractions.
- Preserve local-only artifacts as local-only: `.env`, `.mastra/`,
  `node_modules/`, `.npm-cache/`, `*.db`, and `*.db-*` must not become part of
  documented committed workflow.
- Do not invent missing context. State assumptions and blockers explicitly when
  the repo does not answer them.

## ai-spec Governance

- `AGENTS.md` is the canonical session instruction file for Codex and the
  shared governance entrypoint for ai-spec-managed tooling.
- Procedural flows live in `.agents/skills/`. Tool-specific wrappers in
  `.claude/` and `.codex/` are adapters, not the source of truth.
- Planning skills such as `analyze-project`, `create-prd`,
  `create-technical-specification`, and `create-tasks` should be used only when
  the task explicitly asks for that workflow.
- Execution and review flows should follow `.agents/skills/agent-governance/`
  and the task-specific skill that was invoked.
- Load only the references required for the active task. Do not preload whole
  skill trees unnecessarily.

## Project Commands

Run commands from `agents/`:

- `npm run dev`
- `npm run build`
- `npm run typecheck`
- `npm run check`

## Validation Standard

- Run `npm run check` after code changes.
- If a task touches runtime behavior, also confirm `npm run dev` still starts
  cleanly.
- If validation cannot be run, state that explicitly with the blocker.
- Follow the final validation step from
  `.agents/skills/agent-governance/SKILL.md` before considering the task done.

## Current Stack

- Node `>=22.13.0`
- TypeScript with `moduleResolution: bundler` and ES2022 modules
- Mastra packages are already on the latest audited published versions as of
  `2026-06-29`; do not bump them without a concrete reason
