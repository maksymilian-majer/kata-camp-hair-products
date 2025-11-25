---
description: Create a pull request using GitHub CLI
argument-hint: [optional title]
allowed-tools: Bash, Read, Grep, Glob
---

# Create Pull Request

Create a GitHub pull request for $ARGUMENTS using the GitHub CLI (`gh`).

## What This Command Does

Creates a GitHub pull request with:

- Automatic branch analysis and diff review
- Comprehensive PR description
- Proper title format with story ID
- GitHub CLI integration (no MCP required)

## Prerequisites

Ensure GitHub CLI is authenticated:

```bash
gh auth status
```

If not authenticated:

```bash
gh auth login
```

## Process

### 1. Check Git Status

Analyze current repository state:

```bash
git status
git log origin/main..HEAD --oneline
git diff origin/main...HEAD --stat
```

### 2. Verify Branch is Pushed

Ensure branch is synced with remote:

```bash
git branch -vv
git fetch origin
```

If not pushed:

```bash
git push -u origin $(git branch --show-current)
```

### 3. Run Final Validation

Before creating PR, ensure all checks pass:

```bash
pnpm check-all
```

### 4. Analyze Changes

Review all commits to understand:

- Main feature/fix being implemented
- Files changed and their purpose
- Related story and plan files
- Test coverage added

### 5. Generate PR Description

Create comprehensive description following the template below.

### 6. Create Pull Request

Use GitHub CLI to create the PR:

```bash
gh pr create \
  --title "[STORY-ID] Title here" \
  --body "$(cat <<'EOF'
PR body here...
EOF
)" \
  --base main
```

## PR Title Format

```
[STORY-ID] Brief description of the change
```

### Examples

```
[HAIR-1] Implement hair profile quiz
[HAIR-2] Add product scanning with camera
[HAIR-3] Create favorites management
```

### Title Guidelines

- Start with story ID in square brackets
- Use present tense ("Add" not "Added")
- Be concise but descriptive (< 72 characters)
- Capitalize first word after story ID

## PR Description Template

````markdown
## Summary

Brief overview of what this PR accomplishes.

Implements [STORY-ID]: [Story title]

## Changes

- List of main changes
- New features added
- Components/modules created

## How to Test

1. Start the dev server: `pnpm dev`
2. Navigate to [route]
3. [Testing steps]

## BDD Scenarios Implemented

```gherkin
Scenario: [Name from story]
Given [context]
When [action]
Then [outcome]
```
````

## Checklist

- [ ] All phases completed (1-7)
- [ ] `pnpm check-all` passes
- [ ] Manual testing completed
- [ ] No console errors

## Screenshots

[If applicable, add screenshots of UI changes]

---

🤖 Generated with [Claude Code](https://claude.ai/code)

````

## GitHub CLI Commands Reference

```bash
# Check authentication
gh auth status

# Create PR (interactive)
gh pr create

# Create PR with options
gh pr create --title "Title" --body "Body" --base main

# Create PR from file
gh pr create --title "Title" --body-file pr-body.md --base main

# Create draft PR
gh pr create --title "Title" --body "Body" --draft

# View PR status
gh pr status

# List PRs
gh pr list

# View specific PR
gh pr view [PR-NUMBER]
````

## Example PR Creation

````bash
gh pr create \
  --title "[HAIR-1] Implement hair profile quiz" \
  --body "$(cat <<'EOF'
## Summary

Implements the hair profile quiz feature where users select their hair type, concerns, and goals to get personalized product recommendations.

Implements HAIR-1: Hair profile quiz

## Changes

- Added quiz components (HairTypeSelector, ConcernsSelector, GoalsSelector)
- Created TanStack Query hooks for questionnaire API
- Implemented Zustand store for quiz state
- Added NestJS questionnaires module with repository, service, and controller
- Full test coverage with Vitest and Testcontainers

## How to Test

1. Start the dev server: `pnpm dev`
2. Navigate to http://localhost:3000
3. Click "Get Started"
4. Complete the quiz flow
5. Verify profile is saved

## BDD Scenarios Implemented

```gherkin
Scenario: New user completes quiz successfully
Given I am a new user on the home page
When I tap "Get Started"
And I select my hair type as "Curly"
And I select my concerns as "Frizz" and "Dryness"
And I select my goals as "Moisturize"
And I submit the quiz
Then I should see the scanner screen
And my profile should be saved
````

## Checklist

- [x] All phases completed (1-7)
- [x] `pnpm check-all` passes
- [x] Manual testing completed
- [x] No console errors

---

🤖 Generated with [Claude Code](https://claude.ai/code)
EOF
)" \
 --base main

````

## After PR Creation

### What Happens Next

1. PR URL is returned
2. CI/CD pipelines run (if configured)
3. Request reviews from team members
4. Address feedback and push updates

### Updating the PR

```bash
# Make changes based on feedback
git add .
git commit -m "fix: address review feedback

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push
````

### Merging

```bash
# Merge PR (if you have permissions)
gh pr merge [PR-NUMBER] --squash --delete-branch
```

## Troubleshooting

### GitHub CLI Not Authenticated

```bash
gh auth login
# Follow prompts to authenticate
```

### Branch Not Pushed

```bash
git push -u origin $(git branch --show-current)
```

### Conflicts with Main

```bash
git fetch origin
git rebase origin/main
# Resolve conflicts if any
git push --force-with-lease
```

### PR Creation Fails

Check:

- GitHub CLI is authenticated: `gh auth status`
- Branch is pushed to remote
- You have write access to the repository

## Usage Examples

```
/pr

Create a PR for the current branch with auto-generated description.
```

```
/pr Implement hair profile quiz

Create a PR with the specified title.
```
