# Kata Camp Training Plan: Questionnaire Feature (Phases 1-3)

**Goal**: Build the dermo-focused questionnaire feature end-to-end (frontend only: Phases 1-3)
**Target Duration**: 90 minutes
**Scope**: /story -> Lovable prototype -> /phased-plan -> /implement Phase 1-3

---

## Pre-Workshop Checklist

- [ ] Docker Desktop installed (latest version)
- [ ] Claude Code Pro subscription active
- [ ] Lovable account ready with existing prototype (remix-able)
- [ ] Large font size configured in terminal/editor

**First-time setup (participants run before workshop):**

```bash
git clone <repo-url>
cd hair-product-scanner
docker compose up -d
docker compose exec dev pnpm db:migrate
```

---

## Workshop Timeline (90 min)

| Time | Duration | Step                               | Checkpoint                           |
| ---- | -------- | ---------------------------------- | ------------------------------------ |
| 0:00 | 5 min    | Introduction + Show disabled route | App running, /questionnaire disabled |
| 0:05 | 5 min    | Run `/story` command               | Story file created                   |
| 0:10 | 10 min   | Create questionnaire in Lovable    | Prototype visible                    |
| 0:20 | 5 min    | Run `/phased-plan` command         | Plan file created                    |
| 0:25 | 15 min   | `/implement Phase 1`               | Components created, app works        |
| 0:40 | 15 min   | `/implement Phase 2`               | MSW mocks + hooks, app works         |
| 0:55 | 20 min   | `/implement Phase 3`               | Form working with mocks, app works   |
| 1:15 | 5 min    | Final demo + commit                | Feature complete                     |
| 1:20 | 10 min   | Wrap-up + Q&A                      | Questions answered                   |

---

## Questionnaire Specification

### 5 Dermo-Safety Questions (Single Form Layout)

**Q1: Scalp Condition** (Single Select)

- Seborrheic Dermatitis
- Psoriasis
- Atopic Dermatitis (Eczema)
- Severe Dandruff
- Just Sensitive/Itchy

**Q2: Sebum Level** (Single Select)

- Excessive Sebum (Oily within 24h)
- Moderate/Normal
- Dry/Tight Skin

**Q3: Active Symptoms** (Multi-Select)

- Itching
- Redness/Inflammation
- Yellow/Greasy Scales
- White/Dry Flakes
- Pain/Burning

**Q4: Hair Strand Condition** (Single Select)

- Natural/Virgin
- Dyed/Color-Treated
- Bleached/High Porosity

**Q5: Ingredient Tolerance** (Single Select)

- Resilient (Can tolerate fragrance/alcohol)
- Moderate (Prefer to avoid harsh irritants)
- Hypoallergenic (Strictly no fragrance, alcohol, or allergens)

---

## Step-by-Step Guide with Prompts

### Step 0: Introduction (5 min)

**Coach Script:**

> "Today we're building a real feature: a dermo-safety questionnaire for a hair product scanner. This helps patients
> with conditions like Seborrheic Dermatitis find safe products. We'll use AI-assisted development with Claude Code,
> following a 7-phase workflow. Today we focus on Phases 1-3: the frontend."

**Show:**

1. Run `docker compose up` - show app starting
2. Open http://localhost:3000 and login
3. Show the `/questionnaire` route is disabled in the sidebar
4. Explain the goal: enable this route with a working form

---

### Step 1: Create User Story (5 min)

**Prompt to paste in Claude Code:**

```
/story HAIR-1 Dermo-Safety Questionnaire

Build a single-page questionnaire form for users with scalp conditions (Seborrheic Dermatitis, Psoriasis, etc.) to create their dermo-safety profile.

5 questions:
1. Scalp condition (single select): SebDerm, Psoriasis, Atopic Dermatitis, Severe Dandruff, Just Sensitive
2. Sebum level (single select): Excessive, Moderate, Dry
3. Active symptoms (multi-select): Itching, Redness, Yellow Scales, White Flakes, Pain
4. Hair strand condition (single select): Natural, Dyed, Bleached
5. Ingredient tolerance (single select): Resilient, Moderate, Hypoallergenic

Single form layout (not multi-step wizard). Submit saves profile and navigates to dashboard.
```

**When Claude asks clarifying questions:** Answer them based on the context.

**Checkpoint:** File created at `docs/stories/HAIR-1-*.md`

---

### Step 2: Create Prototype in Lovable (10 min)

**Prompt to paste in Lovable chat:**

```
Add a new questionnaire page at /questionnaire with a single-page form for dermo-safety profiling.

The form should have these 5 questions:

1. "Do you have a specific scalp condition?" (single select, required)
   Options: Seborrheic Dermatitis, Psoriasis, Atopic Dermatitis (Eczema), Severe Dandruff, Just Sensitive/Itchy

2. "How oily is your scalp?" (single select, required)
   Options: Excessive Sebum (Oily within 24h), Moderate/Normal, Dry/Tight Skin

3. "What symptoms are bothering you right now?" (multi-select, at least 1 required)
   Options: Itching, Redness/Inflammation, Yellow/Greasy Scales, White/Dry Flakes, Pain/Burning

4. "What is the state of your hair?" (single select, required)
   Options: Natural/Virgin, Dyed/Color-Treated, Bleached/High Porosity

5. "How sensitive is your skin to additives?" (single select, required)
   Options: Resilient, Moderate, Hypoallergenic

Use a card-based layout for each question. Include a submit button at the bottom that says "Save Profile".

Design system colors (OKLCH):
- Primary: oklch(0.55 0.15 250) - deep blue/purple
- Background: oklch(0.97 0.01 250) - light gray-blue
- Card: oklch(1 0 0) - white
- Accent: oklch(0.55 0.15 250) - same as primary
- Destructive: oklch(0.577 0.245 27.325) - red for errors
- Border radius: 0.75rem
```

**Checkpoint:** Questionnaire visible in Lovable preview

---

### Step 3: Create Implementation Plan (5 min)

**Prompt to paste in Claude Code:**

```
/phased-plan HAIR-1
```

**Checkpoint:** File created at `docs/plans/PLAN-HAIR-1-*.md`

---

### Step 4: Implement Phase 1 - Presentational UI (15 min)

**Prompt to paste in Claude Code:**

```
/implement Phase 1 @docs/plans/PLAN-HAIR-1-dermo-safety-questionnaire.md
```

**After completion, verify app works:**

```bash
docker compose exec dev pnpm check:affected
```

Open http://localhost:3000 - app should still work (no new routes yet)

---

### Step 5: Implement Phase 2 - API Client + Mocks (15 min)

**Prompt to paste in Claude Code:**

```
/implement Phase 2 @docs/plans/PLAN-HAIR-1-dermo-safety-questionnaire.md
```

**After completion, verify app works:**

```bash
docker compose exec dev pnpm check:affected
```

---

### Step 6: Implement Phase 3 - Smart Components (20 min)

**Prompt to paste in Claude Code:**

```
/implement Phase 3 @docs/plans/PLAN-HAIR-1-dermo-safety-questionnaire.md
```

**After completion, verify app works:**

```bash
docker compose exec dev pnpm check:affected
```

**Manual test:**

1. Open http://localhost:3000
2. Login with test user
3. Navigate to /questionnaire (should now be enabled in nav)
4. Fill out form and submit
5. Verify navigation to /dashboard

---

### Step 7: Final Demo + Commit + PR (5 min)

**Demo the working feature:**

1. Show the questionnaire form
2. Fill it out completely
3. Submit and show navigation

**Commit and create PR:**

```
/commit
```

```
/pr
```

---

### Step 8: Wrap-up + Q&A (10 min)

**Recap:**

> "In 90 minutes, we went from user story to working code using AI-assisted development. The 7-phase workflow keeps the
> AI focused: Phase 1 for pure UI, Phase 2 for API contracts, Phase 3 for integration. The branch checkpoints let you
> continue at home with Phases 4-6 to build the real backend, and Phase 7 for full integration."

**Key takeaways:**

- Start with a story to define scope
- Use Lovable for rapid visual prototyping
- The phased approach keeps AI focused on one layer at a time
- `check:affected` validates only what changed

**Resources for continuing at home:**

- Branch checkpoints cover all 7 phases
- docs/TRAINING-REQUIREMENTS.md has full backend phases
- Phases 4-6 use TDD with Testcontainers

---

## Troubleshooting Quick Reference

### If tests fail:

```bash
docker compose exec dev pnpm nx test web --watch
```

### If types don't sync:

```bash
docker compose exec dev pnpm nx reset
docker compose restart
```

### If MSW not intercepting:

- Check browser devtools Network tab
- Verify handler is exported in `handlers/index.ts`

### If participant falls behind:

- Provide branch checkpoint: `git checkout kata/phase-1-complete`
- Continue with group, help them catch up during next phase

---

## Branch Checkpoints (Created via /commit during simulation)

The `/commit` command creates commits automatically. Create branches from those commits for participant recovery:

```bash
# After simulation, create branches from commit history:
kata/start              # Clean starting point (before /story)
kata/story-complete     # After /story (for Lovable reference)
kata/lovable-complete   # After Lovable (includes /phased-plan prompt context)
kata/plan-complete      # After /phased-plan

# Implementation branches (workshop covers 1-3)
kata/phase-1-complete   # After Phase 1
kata/phase-2-complete   # After Phase 2
kata/phase-3-complete   # After Phase 3

# Home continuation branches (phases 4-7)
kata/phase-4-complete   # After Phase 4 (Repository TDD)
kata/phase-5-complete   # After Phase 5 (Service TDD)
kata/phase-6-complete   # After Phase 6 (Controller TDD)
kata/phase-7-complete   # After Phase 7 (Integration)
```

---

## Files to be Created/Modified

### Phase 1 (Presentational UI)

- `apps/web/src/components/questionnaire/question-card.tsx`
- `apps/web/src/components/questionnaire/radio-group.tsx`
- `apps/web/src/components/questionnaire/checkbox-group.tsx`
- `apps/web/src/components/questionnaire/submit-button.tsx`
- `apps/web/src/components/questionnaire/index.ts`
- `apps/web/src/components/questionnaire/*.spec.tsx` (tests)

### Phase 2 (API Client + Mocks)

- `libs/shared/src/types/questionnaire.types.ts`
- `libs/shared/src/schemas/questionnaire.schemas.ts`
- `libs/shared/src/index.ts` (add exports)
- `apps/web/src/hooks/use-questionnaire.ts`
- `apps/web/src/hooks/index.ts` (add export)
- `apps/web/src/mocks/handlers/questionnaire.ts`
- `apps/web/src/mocks/handlers/index.ts` (add export)

### Phase 3 (Smart Components)

- `apps/web/src/app/questionnaire/page.tsx`
- `apps/web/src/components/questionnaire/questionnaire-form.tsx`
- `apps/web/src/components/layout/app-sidebar.tsx` (enable nav)
- `apps/web/src/components/layout/mobile-bottom-nav.tsx` (enable nav)
- Integration tests

---

## Risk Mitigation

1. **Time overrun**: Skip tests for Phase 1-2, only write Phase 3 integration tests
2. **AI generates wrong patterns**: Have correct code snippets ready to paste
3. **Participant confusion**: Keep terminal visible, announce file paths clearly
4. **Environment issues**: Docker handles everything, fallback to branch checkpoints

---

# SIMULATION GUIDE

Below is the exact sequence to run the simulation and verify timing.

## Pre-Simulation Setup

```bash
# Ensure clean state
cd /Users/maksymilian/kata-camp/hair-product-scanner
git status  # Should be clean

# Start Docker environment
docker compose up -d
docker compose exec dev pnpm db:migrate

# Verify everything works
docker compose exec dev pnpm check-all

# Start timer
```

## Simulation Commands (Copy-Paste Sequence)

### 1. Story Creation

```
/story HAIR-1 Dermo-Safety Questionnaire

Build a single-page questionnaire form for users with scalp conditions to create their dermo-safety profile.

5 questions:
1. Scalp condition (single select, required): Seborrheic Dermatitis, Psoriasis, Atopic Dermatitis (Eczema), Severe Dandruff, Just Sensitive/Itchy
2. Sebum level (single select, required): Excessive Sebum, Moderate/Normal, Dry/Tight Skin
3. Active symptoms (multi-select, at least 1 required): Itching, Redness/Inflammation, Yellow/Greasy Scales, White/Dry Flakes, Pain/Burning
4. Hair strand condition (single select, required): Natural/Virgin, Dyed/Color-Treated, Bleached/High Porosity
5. Ingredient tolerance (single select, required): Resilient, Moderate, Hypoallergenic

Single form layout. Submit saves profile and navigates to /dashboard.
Users cannot skip - questionnaire is required for personalized recommendations.
Users can edit their profile later from settings.
```

**Answer clarifying questions as they come.**

**Commit:**

```
/commit
```

**Record time**: **\_** minutes

---

### 2. Lovable Prototype

Use the Lovable prompt from Step 2 above.

**Commit (if any changes to repo):**

```
/commit
```

**Record time**: **\_** minutes

---

### 3. Plan Creation

```
/phased-plan HAIR-1
```

**Commit:**

```
/commit
```

**Record time**: **\_** minutes

---

### 4. Phase 1 Implementation

```
/implement Phase 1 @docs/plans/PLAN-HAIR-1-dermo-safety-questionnaire.md
```

**Verify:**

```bash
docker compose exec dev pnpm check:affected
```

**Commit:**

```
/commit
```

**Record time**: **\_** minutes

---

### 5. Phase 2 Implementation

```
/implement Phase 2 @docs/plans/PLAN-HAIR-1-dermo-safety-questionnaire.md
```

**Verify:**

```bash
docker compose exec dev pnpm check:affected
```

**Commit:**

```
/commit
```

**Record time**: **\_** minutes

---

### 6. Phase 3 Implementation

```
/implement Phase 3 @docs/plans/PLAN-HAIR-1-dermo-safety-questionnaire.md
```

**Verify:**

```bash
docker compose exec dev pnpm check:affected
```

**Manual test:**

- Open http://localhost:3000
- Login, navigate to /questionnaire
- Fill out and submit form
- Verify navigation to /dashboard

**Commit and PR:**

```
/commit
```

```
/pr
```

**Record time**: **\_** minutes

---

### 7-10. Backend Phases (Home Continuation)

Continue with phases 4-7 for full implementation:

```
/implement Phase 4 @docs/plans/PLAN-HAIR-1-dermo-safety-questionnaire.md
```

```bash
docker compose exec dev pnpm check:affected
```

```
/commit
```

---

```
/implement Phase 5 @docs/plans/PLAN-HAIR-1-dermo-safety-questionnaire.md
```

```bash
docker compose exec dev pnpm check:affected
```

```
/commit
```

---

```
/implement Phase 6 @docs/plans/PLAN-HAIR-1-dermo-safety-questionnaire.md
```

```bash
docker compose exec dev pnpm check:affected
```

```
/commit
```

---

```
/implement Phase 7 @docs/plans/PLAN-HAIR-1-dermo-safety-questionnaire.md
```

```bash
docker compose exec dev pnpm check:affected
```

```
/commit
```

```
/pr
```

---

## Timing Log Template

| Step              | Target     | Actual | Notes |
| ----------------- | ---------- | ------ | ----- |
| Story creation    | 5 min      |        |       |
| Lovable prototype | 10 min     |        |       |
| Plan creation     | 5 min      |        |       |
| Phase 1           | 15 min     |        |       |
| Phase 2           | 15 min     |        |       |
| Phase 3           | 20 min     |        |       |
| Demo + commit     | 5 min      |        |       |
| Wrap-up           | 10 min     |        |       |
| **TOTAL**         | **85 min** |        |       |

**Buffer available**: 5 min

---

## After Simulation

If simulation completes under 85 minutes:

- [ ] Create all branch checkpoints (kata/start through kata/phase-7-complete)
- [ ] Document any gotchas or issues
- [ ] Push branches to remote for participants
- [ ] Test checkout and continuation from each branch

If simulation exceeds 85 minutes:

- [ ] Identify bottlenecks
- [ ] Pre-create story (start from kata/story-complete)
- [ ] Pre-create plan (start from kata/plan-complete)
- [ ] Simplify to 3 questions instead of 5
