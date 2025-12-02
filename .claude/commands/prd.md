---
description: Create a Product Requirements Document for the product
argument-hint: [PRODUCT-NAME] [Description + context]
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Create Product Requirements Document

Create a Product Requirements Document for $ARGUMENTS following the simplified template for training katas.

## What This Command Creates

Creates a comprehensive PRD with:

- Product vision and problem statement
- Target users and use cases
- Core features organized by priority
- Future considerations (next iterations or post-MVP in case of early product discovery)

## What NOT to Include

- No detailed acceptance criteria for each feature - only high level narrative
- No tracking plan (events, analytics)
- No rollout plan (feature flags)
- No API specifications
- No database schema details
- No SQL queries

## Process

### 1. Get Current Date

Retrieves current date for documentation timestamps using a shell command.

### 2. Ask Clarifying Questions

**IMPORTANT**: Only ask questions about genuinely unclear aspects. Do NOT ask about:

- Information already in the command definition
- Established project patterns from CLAUDE.md
- Information from recent conversation context

**Before writing ANY PRD:**

- Review the product description
- Ask clarifying questions about unclear requirements
- Uncover edge cases and important details
- Use lettered questions (a, b, c) with numbered answers (1, 2, 3)
- Wait for user responses before proceeding

### 3. Get Confirmation

- Present summary of what will be created
- Ask for explicit user confirmation
- Only proceed after receiving approval

### 4. Create the PRD

- Create PRD in appropriate directory
- Follow template structure below
- Include all required sections

## PRD Structure

### File Location

- **Directory**: `docs/`
- **File**: `PRD-{product-name}.md`
- **Example**: `docs/PRD-hair-product-scanner.md`

### Template Structure

```markdown
# PRD: [Product Name]

**Created**: [Date]

## 1. Introduction & Overview

Brief description of what the product is and the problem it solves.

## 2. Problem Statement

What problem does this product solve? Who experiences this problem?

## 3. Goals

### User Goals

- What users want to achieve

### Business Goals

- What the business wants to achieve

## 4. Target Audience

### Primary Users

Description of primary user personas.

### Secondary Users

Description of secondary user personas (if any).

## 5. Core Features

### P0 - Must Have (MVP)

Features required for initial release.

### P1 - Should Have

Features important but not blocking release.

### P2 - Nice to Have

Features for future consideration.

## 6. Technical Requirements

### Stack

- Frontend: [technology]
- Backend: [technology]
- Database: [technology]

### Integrations

External services or APIs required.

## 7. Constraints

### Scope Limitations

What is explicitly out of scope.

### Technical Constraints

Technical limitations to consider.

## 8. Future Considerations

Post-MVP ideas and enhancements.
```

## Example Clarifying Questions

```
a) What is the primary use case for this product?
  1) In-store product scanning and comparison
  2) At-home ingredient analysis
  3) Both in-store and at-home usage

b) Should users be able to create accounts?
  1) Yes, required for saving preferences
  2) No, anonymous usage only
  3) Optional - can save locally or with account

c) What hair types should the questionnaire cover?
  1) Basic types (straight, wavy, curly, coily)
  2) Extended classification (including 3A-4C curl patterns)
  3) Simple binary (curly vs straight)
```

## PRD Validation Checklist

Ensure all template sections are completed:

- [ ] Introduction & Overview
- [ ] Problem Statement
- [ ] Goals (user and business)
- [ ] Target Audience
- [ ] Core Features (prioritized P0/P1/P2)
- [ ] Technical Requirements
- [ ] Constraints
- [ ] Future Considerations

## After PRD Creation

- PRD is created but development doesn't start automatically
- Share with stakeholders for review if applicable
- Use `/story` command to create detailed user stories
- Use `/phased-plan` command to create implementation plans

## Usage Examples

When invoking the `/prd` command, provide a rich narrative description of the product including key screens and functionalities. Attaching screenshots from design tools (Figma, Lovable) is highly recommended.

```
/prd hair-product-scanner

Create a PRD for a mobile-first web app that helps users find the right hair care products.

The app has three main screens:

1. **Quiz Screen** - A multi-step questionnaire where users select their hair type (straight, wavy, curly, coily), concerns (frizz, dryness, damage), and goals (moisturize, define curls, repair). The quiz saves a profile that personalizes all future recommendations.

2. **Scanner Screen** - Users can scan product labels using their phone camera. The app extracts ingredients using OCR and sends them to an AI for analysis. The AI compares ingredients against the user's hair profile and provides a compatibility score with pros/cons.

3. **Favorites Screen** - Users can save products they like for future reference. Each saved product shows the compatibility score and a summary of why it was recommended.

The app should work offline for viewing saved favorites but requires internet for scanning and AI analysis.

[Attached: screenshot of Lovable prototype showing quiz flow]
```

```
/prd ingredient-analyzer

Create a PRD for an ingredient analysis feature. Users paste or type ingredient lists from hair products and get an AI-powered breakdown of what each ingredient does, potential concerns for different hair types, and overall product rating.

Key functionality:
- Text input for pasting ingredients
- Camera capture of ingredient labels with OCR
- AI analysis with explanations in plain language
- Save analysis history

[Attached: mockup screenshots from Figma]
```
