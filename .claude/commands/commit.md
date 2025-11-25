---
description: Create a conventional commit with AI attribution following project standards
argument-hint: [optional custom message]
allowed-tools: Bash, Read, Grep, Glob
---

# Create Conventional Commit

Create a conventional commit with AI attribution for $ARGUMENTS following project standards.

## What This Command Does

Creates properly formatted commits with:

- Conventional commit format (`type(scope): description`)
- AI attribution with proper co-authorship
- Pre-commit validation (when needed)
- Automatic staging of changes

## Efficient Workflow Integration

### After `/implement` Command

If you just used `/implement` and tests passed:

- **Skips** pre-commit checks (already validated)
- Proceeds directly to staging and committing
- More efficient workflow

### Standalone Usage

When used independently:

- Runs full pre-commit validation
- Ensures code quality before commit

## Process

### 1. Check Current Changes

Analyzes what will be committed:

```bash
git status
git diff --staged
git diff  # unstaged changes
```

**Detect Code Files:**

Check if any modified files are code files that require validation:

```bash
# Check for code file extensions in changed files
git diff --name-only --staged | grep -E '\.(ts|tsx|js|jsx)$' || echo "No code files"
git diff --name-only | grep -E '\.(ts|tsx|js|jsx)$' || echo "No code files"
```

If no code files are found, skip validation steps.

### 2. Pre-commit Validation

**Skipped if:**

- Recent `/implement` completed successfully, OR
- Only non-code files are modified (e.g., markdown, documentation, config files)

**Check for code files:**

- TypeScript/JavaScript: `.ts`, `.tsx`, `.js`, `.jsx`
- Other code files that require validation

**Non-code files (skip checks):**

- Markdown: `.md`
- Documentation: `.txt`, `.rst`
- Images: `.png`, `.jpg`, `.svg`, etc.
- Config: `.json`, `.yaml`, `.yml` (unless they affect code)

**If code files are modified, runs:**

```bash
pnpm nx run-many --target=lint      # ESLint checks
pnpm nx run-many --target=test      # Vitest tests
```

### 3. Stage Changes

Stages all relevant changes:

```bash
git add .  # or specific files
```

### 4. Create Commit Message

Generates conventional commit with AI attribution

## Commit Message Format

### Structure

```
type(scope): description

[optional body]

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Types (Conventional Commits)

- **`feat`**: New feature
- **`fix`**: Bug fix
- **`docs`**: Documentation only
- **`style`**: Code formatting changes
- **`refactor`**: Code restructuring (no functionality change)
- **`test`**: Adding or updating tests
- **`chore`**: Maintenance tasks, dependency updates
- **`perf`**: Performance improvements
- **`ci`**: CI/CD changes
- **`build`**: Build system changes
- **`revert`**: Reverting previous commit

### Scope Guidelines

Use feature names or component areas:

**Frontend (apps/web):**
- `(web)` - General web app changes
- `(quiz)` - Hair profile quiz feature
- `(scanner)` - Product scanner feature
- `(favorites)` - Favorites feature
- `(ui)` - UI components

**Backend (apps/api):**
- `(api)` - General API changes
- `(questionnaires)` - Questionnaires module
- `(scans)` - Scans module
- `(favorites)` - Favorites module
- `(ai)` - AI/LLM integration

**Shared (libs/shared):**
- `(shared)` - Shared types and schemas

**Infrastructure:**
- `(nx)` - Nx workspace configuration
- `(docker)` - Docker configuration
- `(db)` - Database/Drizzle changes

For multiple areas: `(web,api)` or `(shared,api)`

### Description Rules

- Use imperative mood ("add" not "added")
- Don't capitalize first letter
- No period at the end
- Max 100 characters
- Be specific and descriptive

## Example Commits

### Feature Implementation

```bash
feat(quiz): implement hair type selection step

- Add HairTypeSelector component with radio options
- Style with Tailwind for mobile-first design
- Add form validation with Zod schema

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Bug Fix

```bash
fix(api): resolve questionnaire validation error

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Backend TDD

```bash
feat(questionnaires): add repository with integration tests

- Implement QuestionnairesRepository with Drizzle
- Add testcontainers-based integration tests
- Test CRUD operations against real PostgreSQL

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Documentation

```bash
docs(readme): update development setup instructions

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## AI Attribution

**Always includes proper AI attribution:**

```
🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Multi-line Commits

For complex changes:

```bash
feat(scanner): implement product label scanning

- Add camera integration for label capture
- Implement OCR text extraction
- Add AI analysis request to backend
- Display compatibility score and recommendations

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Special Cases

### Work in Progress

```bash
chore(wip): temporary checkpoint for feature branch

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Reverting Changes

```bash
revert: feat(quiz): implement hair type selection

This reverts commit abc123def456

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## After Committing

### Verification

```bash
git log -1 --oneline  # Check commit was created
```

### If Mistakes Made

```bash
# Amend last commit (before pushing)
git commit --amend

# Change just the message
git commit --amend -m "new message"
```

## Best Practices

### Atomic Commits

- One logical change per commit
- Each commit should make sense independently
- Related changes should be grouped together

### Clear History

- Descriptive commit messages
- Logical progression of changes
- Easy to understand project evolution

### Quality Assurance

- Tests pass before committing
- Code follows project standards
- No linting errors
- TypeScript compiles successfully

## Usage Examples

```
/commit
/commit "custom message" (will be formatted to convention)
```

## Troubleshooting

### Lint/Test Failures

- Fix linting errors: `pnpm nx run-many --target=lint --fix`
- Ensure tests pass: `pnpm nx run-many --target=test`

### Staging Issues

- Check which files need to be committed
- Use `git add .` for all changes
- Use `git add <file>` for specific files
- Verify staged changes with `git diff --staged`

## Nx Commands Reference

```bash
# Lint all projects
pnpm nx run-many --target=lint

# Test all projects
pnpm nx run-many --target=test

# Lint specific project
pnpm nx lint web
pnpm nx lint api

# Test specific project
pnpm nx test web
pnpm nx test api
```
