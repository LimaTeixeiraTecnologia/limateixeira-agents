@AGENTS.md

# Claude Code Addendum

- Use `AGENTS.md` as the shared source of truth.
- `.claude/skills/` mirrors `.agents/skills/`; the canonical source remains
  `.agents/skills/`.
- In execution tasks, load `AGENTS.md`,
  `.agents/skills/agent-governance/SKILL.md`, and the relevant implementation
  skill before editing.
- Before editing Mastra code, read `.agents/skills/mastra/SKILL.md` and then
  only the specific referenced files needed for the task.
- Keep persistent project guidance in `AGENTS.md`; keep Claude-specific notes
  here only when they are not portable to Codex.
