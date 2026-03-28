---
description: Create a commit message by analyzing git diffs
allowed-tools: Bash(git status:*) Bash(git diff --staged), Bash(git commit:*)
---

## Your task

Analyze the staged git changes and create a commit message. Use present tense and explain "why" something has changed, not just "what" has changed.

## Run these commands

```bash
git status
git diff --staged
```

## Commit types with emojis

Only use the following emojis:

- `✨` `feat` for new features
- `🐛` `fix` for bug fixes
- `🧹` `refactor` for code changes that neither fix a bug nor add a feature
- `📝` `docs` for documentation updates
- `🎨` `style` for code style changes (formatting, missing semicolons, etc.
- `✅` `test` for adding or updating tests
- `🚀` `perf` for performance improvements)

## Format

Use the following format for making the commit message:

```ash
<emoji> <type>: <short description>
<optional_body_explaining_why>
```

## Output

1. Show summary of changes currently staged
2. Propose commit message with appropriate emoji
3. Ask for confirmation before committing

DO NOT auto-commit - wait for user approval, and only commit if the user say so.

1. Ask for confirmation before committing

DO NOT auto-commit - wait for user approval, and only commit if the user say so.
