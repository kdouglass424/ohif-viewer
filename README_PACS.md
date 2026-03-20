# PACS OHIF Viewer

## Getting started

Refer to the [devcontainer README](.devcontainer/README.md) to set up your local dev environment.

## Sync upstream changes

Git commands to sync upstream changes with **OHIF/Viewer**.

```sh
git fetch upstream
git checkout upstream-mirror
git merge upstream/master
git push origin upstream-mirror

git checkout main
git merge upstream-mirror
git push origin main
```

## Beads for agentic memory

Reference: https://github.com/steveyegge/beads

### Essential commands

| Command | Action |
| --- | --- |
| `bd ready` | List tasks with no open blockers. |
| `bd create "Title" -p 0` | Create a P0 task. |
| `bd update <id> --claim` | Atomically claim a task (sets assignee + in_progress). |
| `bd dep add <child> <parent>` | Link tasks (blocks, related, parent-child). |
| `bd show <id>` | View task details and audit trail. |

### Regular maintenance

```sh
bd doctor        # Health check
bd doctor --fix  # Auto-fix issues
bd cleanup       # Archive closed tasks
```

### Usage

Beads is designed as passive infrastructure: it’s there when you use it, but doesn’t force itself into your workflow. This creates some friction you should know about:

- Claude doesn’t proactively use it. You need to say “track this in beads” or “check bd ready.” The agent won’t spontaneously decide to file issues or check the backlog.

- CLAUDE.md instructions fade. By session end, the agent is focused on the immediate task, not cleanup steps. “Land the plane” (sync, push, file remaining work) needs explicit prompting. The hooks help, but they’re not magic.

- Session handoff is manual. You need to prompt “check bd ready” at session start. The tool provides memory, but you trigger its use.

- Context rot still happens. Even with hooks installed, long sessions can drift. The agent that started by checking bd ready may forget about beads entirely by hour two. The fix: shorter sessions, more explicit prompting, or just accept that you’ll need to remind it.

- Collaboration requires setup. The sync branch pattern works, but you need to configure it explicitly. Out of the box, issues travel with code branches, which may not be what you want.

- Merge conflicts happen. JSONL is more merge-friendly than SQLite, but Beads is still “a crummy architecture (by pre-AI standards) that requires AI in order to work around all its edge cases where it breaks.” Yegge’s words, not mine. The good news: AI can always get it working.

- The bottom line: Beads provides the memory. You provide the discipline to use it.
