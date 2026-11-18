---
name: delegate
description: Hand a well-specified job to a cheaper helper agent - the read-only Haiku `runner` or the Sonnet `worker` - and check what comes back. Use when the user runs /delegate, and on your own initiative during normal work for running test suites, sorting transcript diffs, writing play scripts from a spec, mechanical multi-file edits and broad searches.
---

# Delegating to the runner and the worker

You are the orchestrator. You decide, brief, check and report. Two helpers do the legwork:

- `runner` (`.claude/agents/runner.md`): Haiku, effort low by default, read-only tools. For jobs that are mostly running a command or searching and condensing the output.
- `worker` (`.claude/agents/worker.md`): Sonnet, effort medium by default. For anything that changes files.

The point is to save tokens, so a delegation must cost less than doing the job yourself.

## Which helper, at which effort

Pass `effort` on the Agent call as this table says (this skill is the instruction that allows it). Leave it out when it matches the helper's default.

| Job | Helper | Effort |
| --- | --- | --- |
| Full or partial suite run with transcript comparison | none: run `node tools/suite_report.js [filters]` yourself in the background and read its few summary lines | — |
| Quicktest or lint with long output | none if its summary line is enough (`| tail`); otherwise runner | low |
| Broad search, or listing where something is used | runner | low |
| Sort transcript diffs, or anything that needs judgment about what changed and why (only when `suite_report.js --show=N` lists more changes than you can read cheaply) | worker | medium |
| Mechanical edits from exact instructions | worker | low |
| Write a play script from a spec | worker | medium |
| Diagnose why a script fails | worker | high |

The runner is for running a command and reporting what it printed, never for judgment: in testing, Haiku sorted diffs by the wrong rule and stated a wrong cause as fact. If a runner comes back BLOCKED or its result looks wrong, rerun the job once on the worker before taking it yourself.

## Reuse or start fresh

- A follow-up on material a helper has already read (the same diffs, files or failures): send it to that helper with SendMessage. It keeps its context and skips the start-up and re-reading.
- An unrelated job: start a fresh helper. A reused one carries all its earlier context into every later step.
- In a brief, say what is already committed. Do not point a helper at uncommitted changes (`git diff HEAD`) unless there are some.

## Do it yourself

- Engine design, conditions, locks and anything where a subtle mistake is easy (for example `condition_end` overwriting `ce_prefix`).
- Player-facing prose (`Resources & Quest/NARRATIVE_GUIDELINES.md` applies).
- Anything the user must decide.
- Tiny jobs, where the brief would be as long as the job itself.

## The brief

Call the Agent tool with `subagent_type: "runner"` or `"worker"`. The helper starts cold, so the brief must stand on its own:

```
Goal: <one sentence>
Context: <only the facts it needs: labels, variable names, why>
Files: <exact paths; for the worker, which it may edit and which it must not touch>
Steps: <numbered, concrete>
Checks: <exact commands to run>
Scratchpad: <absolute scratchpad path for temp files>
Report: the standard report from your instructions<, plus anything extra>
```

Give exact paths and names you already know, so it does not spend tokens rediscovering them. Independent jobs can go to several helpers in one message, but run suite jobs one at a time so they do not compete for Chrome and CPU.

## When it comes back

1. Read the report. A BLOCKED or "Unsure" item is yours to resolve.
2. If it edited files: run `git diff --numstat` yourself and account for every deletion, then read the diff.
3. Rerun at least one of its checks yourself, or a narrower one (a single `play_all` script), before calling the work done.
4. Tell the user plainly what the helper did, what you checked, and what was not run.

Neither helper commits. Neither do you, unless the user asks.

## Measuring the saving

Each Agent result reports the helper's total tokens. Keep a line for the session: job, helper, effort, tokens. When the user wants a comparison, run the same brief through `runner`, `worker` and `general-purpose` with `model: "opus"`, one after another, then compare tokens, cost (tokens times each model's price) and whether each found the same thing. Use a read-only job whose answer you can check, so the runs do not collide.
