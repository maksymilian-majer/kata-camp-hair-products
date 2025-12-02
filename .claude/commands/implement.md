---
description: Implement a phase using the appropriate specialized subagent
argument-hint: Phase [1-7] or [STORY-ID]
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, TodoWrite, Task
---

# Implement Phase

Implement $ARGUMENTS using the appropriate specialized subagent for that phase.

## What This Command Does

This command dispatches implementation work to phase-specific subagents:

1. **Detects Phase**: Identifies which phase to implement from argument or plan
2. **Locates Plan**: Finds the plan file in `docs/plans/`
3. **Dispatches to Subagent**: Invokes the correct subagent for the phase
4. **Tracks Progress**: Updates plan checkboxes after completion

## Phase-to-Subagent Mapping

| Phase | Subagent              | Focus                        | Testing                      |
| ----- | --------------------- | ---------------------------- | ---------------------------- |
| 1     | `frontend-phase-1`    | Presentational UI components | Tests after                  |
| 2     | `frontend-phase-2`    | API client + MSW mocks       | Tests after                  |
| 3     | `frontend-phase-3`    | Smart components + state     | Tests after                  |
| 4     | `backend-phase-4`     | Repository layer (Drizzle)   | Tests first (Testcontainers) |
| 5     | `backend-phase-5`     | Service layer                | Tests first (mocked repos)   |
| 6     | `backend-phase-6`     | HTTP controllers             | Tests first (Supertest)      |
| 7     | `integration-phase-7` | Frontend-Backend connection  | Manual testing               |

## Process

### 1. Parse Phase Number

Extract phase number from argument:

- `Phase 1`, `Phase 2`, etc. → Direct phase number
- `HAIR-1` → Find plan file, detect next incomplete phase
- No argument → Auto-detect next incomplete phase from most recent plan

### 2. Locate Plan File

Search for plan in `docs/plans/`:

```bash
ls docs/plans/PLAN-*.md
```

Read the plan to understand:

- What tasks are in this phase
- What the BDD scenarios require
- What tests need to be written

### 3. Dispatch to Subagent

**CRITICAL**: Use the Task tool to invoke the correct subagent:

```
Phase 1 → Task tool with subagent_type: "frontend-phase-1"
Phase 2 → Task tool with subagent_type: "frontend-phase-2"
Phase 3 → Task tool with subagent_type: "frontend-phase-3"
Phase 4 → Task tool with subagent_type: "backend-phase-4"
Phase 5 → Task tool with subagent_type: "backend-phase-5"
Phase 6 → Task tool with subagent_type: "backend-phase-6"
Phase 7 → Task tool with subagent_type: "integration-phase-7"
```

### 4. Update Plan Progress

After subagent completes, update the plan file:

- Mark completed tasks with `[x]`
- Add ✅ emoji and completion date to the phase heading (e.g., `## Phase 1: Presentational UI ✅ (2025-01-15)`)
- Note any issues or decisions made

## Implementation Flow by Phase Type

### Frontend Phases (1-3): Tests After

```
1. Read plan phase tasks
2. Implement components/hooks/state
3. Write tests for new code
4. Run pnpm check-all (lint, test, build)
5. Fix any issues
6. Update plan checkboxes
```

### Backend Phases (4-6): Tests First (TDD)

```
1. Read plan phase tasks
2. Write tests FIRST (expect failure)
3. Run tests: pnpm nx test api (confirm failure)
4. Implement to make tests pass
5. Run pnpm check-all (lint, test, build)
6. Update plan checkboxes
```

### Integration Phase (7): Manual Testing

```
1. Remove/disable MSW mocks
2. Connect frontend to real API
3. Manual testing of BDD scenarios
4. Fix any integration issues
5. Run pnpm check-all (lint, test, build)
6. Update plan checkboxes
```

## Subagent Prompt Template

Keep the prompt **minimal** - the subagent's skills and agent definition already contain detailed guidance. Only provide:

1. **Plan file path** - so the agent can read it
2. **Phase number** - so the agent knows which section to implement
3. **Brief context** - any specific decisions or constraints from earlier phases

```markdown
Implement Phase [N] from the plan at `docs/plans/PLAN-[STORY-ID].md`.

Read the plan file to understand:

- Tasks for this phase
- BDD scenarios to satisfy
- Testing requirements

[Optional: Any specific context from previous phases]

Run `pnpm check-all` when complete to validate.
```

**Why minimal prompts?**

- The agent's skills (design-system, vitest-testing, etc.) contain detailed patterns
- The plan file contains the specific tasks and requirements
- Overly detailed prompts can conflict with or override skill guidance

## shadcn/ui Components

When adding new UI components, use the shadcn CLI from project root:

```bash
# CORRECT - run from root, no extra flags
pnpm dlx shadcn@latest add input label checkbox

# WRONG - do not use --path or other flags
pnpm dlx shadcn@latest add input --path libs/ui/src/components  # DON'T DO THIS
```

After running the CLI, fix lint issues in generated files:

- Change double quotes to single quotes
- Add semicolons
- Change `@hair-product-scanner/ui/lib/utils` to `../lib/utils`

Then export new components from `libs/ui/src/index.ts`.

## Nx Commands Reference

```bash
# Serve both apps (development)
pnpm dev

# Lint
pnpm nx lint web
pnpm nx lint api

# Test
pnpm nx test web
pnpm nx test api

# Type check
pnpm nx typecheck web
pnpm nx typecheck api

# Build
pnpm nx build web
pnpm nx build api

# Validate all (run after completing a phase)
pnpm check-all   # runs lint, test, build
```

## After Implementation

### What Happens Next

- Phase is marked complete in plan
- **No automatic commit** - use `/commit` when ready
- Continue with next phase: `/implement Phase N+1`
- After Phase 7: use `/pr` to create pull request

### Recommended Workflow

```bash
/implement Phase 1
# Review changes
/commit

/implement Phase 2
# Review changes
/commit

# ... continue through phases ...

/implement Phase 7
# Manual testing
/commit
/pr
```

## Usage Examples

```
/implement Phase 1

Implement the presentational UI components for the quiz feature.
```

```
/implement Phase 4

Implement the repository layer with Testcontainers integration tests.
```

```
/implement HAIR-1

Auto-detect and implement the next incomplete phase for story HAIR-1.
```

```
/implement

Auto-detect the next incomplete phase from the most recent plan.
```

## Troubleshooting

### Subagent Not Found

If a subagent isn't defined yet, the implementation should:

1. Read the plan phase tasks
2. Follow the patterns in CLAUDE.md
3. Use the appropriate testing strategy
4. Complete the phase without subagent dispatch

### Tests Failing

**Frontend:**

- Check component props match expected types
- Verify mock data matches API types
- Check async operations are properly awaited

**Backend:**

- Ensure Testcontainers is running (Docker required)
- Check repository methods match interface
- Verify service mocks are properly configured

### Type Errors

```bash
# Check types across workspace
pnpm nx run-many --target=typecheck
```

### Lint Errors

```bash
# Auto-fix lint errors
pnpm nx lint web --fix
pnpm nx lint api --fix
```
