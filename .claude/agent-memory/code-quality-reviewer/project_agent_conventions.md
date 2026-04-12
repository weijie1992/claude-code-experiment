---
name: Agent Definition Conventions
description: Observed conventions in Pocket Heist sub-agent definition files (.claude/agents/*.md)
type: project
---

Agent files in this repo follow a consistent frontmatter schema: `name`, `description` (with inline examples using `<example>` blocks and `<commentary>` tags), `tools`, `model`, `color`. The `code-quality-reviewer` agent also uses `memory: project`.

The description field encodes all trigger examples as an escaped JSON-like string with `\\n` newlines — this is the established pattern, not a bug.

Agent body sections observed: identity paragraph, `## Mission` or equivalent scope section, `## Review Checklist` or equivalent criteria, `## Report Format` with a template, `## Severity Definitions`, and `## Guidelines` / behavioral rules.

The `a11y-reviewer` does NOT include a `memory:` field, unlike `code-quality-reviewer`. This may be intentional (stateless auditor) or an omission.

**Why:** Established through comparison of the two agent files in the repo.
**How to apply:** When reviewing or writing new agent definitions, flag deviations from this schema.
