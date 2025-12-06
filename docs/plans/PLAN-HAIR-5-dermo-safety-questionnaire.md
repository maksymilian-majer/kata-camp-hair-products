# Implementation Plan: Dermo-Safety Questionnaire

**Story**: HAIR-5
**Created**: 2025-12-05

## Overview

Implement a dermo-safety questionnaire that collects information about the user's scalp condition, sebum level, active symptoms, hair strand condition, and ingredient tolerance. This profile data enables personalized ingredient compatibility assessments when scanning products.

The questionnaire consists of 5 questions displayed on a single scrollable page. Users must complete all questions before they can access the product scanner feature. Existing profiles can be edited, and the form pre-fills with saved values.

## BDD Scenarios to Implement

```gherkin
Scenario: New user sees profile prompt on dashboard
Given I am a logged-in user without a dermo-safety profile
When I navigate to the Dashboard
Then I should see a "Complete Your Profile" button
And the Scanner menu item should be disabled
And the Questionnaire menu item should be enabled

Scenario: User accesses questionnaire from dashboard prompt
Given I am on the Dashboard without a completed profile
When I tap "Complete Your Profile"
Then I should navigate to the questionnaire page
And I should see all 5 questions displayed on a single page

Scenario: User completes questionnaire successfully
Given I am on the questionnaire page
When I select "Seborrheic Dermatitis" for scalp condition
And I select "Excessive Sebum" for sebum level
And I select "Itching" and "Yellow/Greasy Scales" for active symptoms
And I select "Natural/Virgin" for hair strand condition
And I select "Moderate" for ingredient tolerance
And I tap "Save Profile"
Then my profile should be saved
And I should be redirected to the Dashboard
And the Scanner menu item should now be enabled

Scenario: User tries to submit without completing all fields
Given I am on the questionnaire page
When I select options for only 3 of the 5 questions
And I tap "Save Profile"
Then I should see validation errors for the incomplete questions
And I should remain on the questionnaire page

Scenario: User tries to submit without selecting any symptoms
Given I am on the questionnaire page
When I complete all questions except Active Symptoms
And I tap "Save Profile"
Then I should see an error "Please select at least one symptom"
And I should remain on the questionnaire page

Scenario: User edits existing profile
Given I have a completed dermo-safety profile
And my scalp condition is set to "Psoriasis"
When I navigate to edit my profile from Settings
Then I should see the questionnaire form
And "Psoriasis" should be pre-selected for scalp condition
And all my other saved values should be pre-selected

Scenario: User updates their profile
Given I am editing my existing profile
When I change my scalp condition to "Severe Dandruff"
And I tap "Save Profile"
Then my profile should be updated with the new value
And I should be redirected to the Dashboard

Scenario: Scanner is enabled after profile completion
Given I have just completed the dermo-safety questionnaire
When I view the navigation menu
Then the Scanner menu item should be enabled
And I should be able to navigate to the scanner
```

---

## Phase 1: Presentational UI Components ✅ (2025-12-05)

**Subagent**: `frontend-phase-1`
**Testing**: Write tests AFTER implementation

### Tasks

- [x] Add missing shadcn/ui components: RadioGroup, Form (if needed)
- [x] Create `QuestionCard` component for wrapping each question section
- [x] Create `ScalpConditionQuestion` component with radio options
- [x] Create `SebumLevelQuestion` component with radio options
- [x] Create `ActiveSymptomsQuestion` component with checkbox options
- [x] Create `HairStrandConditionQuestion` component with radio options
- [x] Create `IngredientToleranceQuestion` component with radio options
- [x] Create `QuestionnaireForm` presentational component combining all questions
- [x] Create `QuestionnairePageHeader` component with title and description
- [x] Create `ProfilePromptCard` component for dashboard CTA ("Complete Your Profile")
- [x] Style all components with Tailwind following the prototype screenshots
- [x] Add loading state button variant with spinner icon

### Question Options Reference

**Scalp Condition** (radio):

- `seborrheic_dermatitis` - "Seborrheic Dermatitis"
- `psoriasis` - "Psoriasis"
- `atopic_dermatitis` - "Atopic Dermatitis (Eczema)"
- `severe_dandruff` - "Severe Dandruff"
- `sensitive_itchy` - "Just Sensitive/Itchy"

**Sebum Level** (radio):

- `excessive` - "Excessive Sebum"
- `moderate` - "Moderate/Normal"
- `dry` - "Dry/Tight Skin"

**Active Symptoms** (checkbox, multi-select):

- `itching` - "Itching"
- `redness` - "Redness/Inflammation"
- `yellow_scales` - "Yellow/Greasy Scales"
- `white_flakes` - "White/Dry Flakes"
- `pain_burning` - "Pain/Burning"

**Hair Strand Condition** (radio):

- `natural` - "Natural/Virgin"
- `dyed` - "Dyed/Color-Treated"
- `bleached` - "Bleached/High Porosity"

**Ingredient Tolerance** (radio):

- `resilient` - "Resilient"
- `moderate` - "Moderate"
- `hypoallergenic` - "Hypoallergenic"

### Test Scenarios

After implementation, write tests that verify:

- [x] QuestionCard renders title, description, and children
- [x] Each question component renders all options correctly
- [x] RadioGroup components show selected state
- [x] Checkbox components show checked state for multi-select
- [x] ProfilePromptCard renders with correct CTA text
- [x] QuestionnaireForm renders all 5 questions in order

### Completion Criteria

- [x] All components created in `apps/web/src/components/questionnaire/`
- [x] Components viewable at temporary route `/dashboard/questionnaire` (static)
- [x] Components match prototype screenshots visually
- [x] Tests pass: `pnpm nx test web`

---

## Phase 2: API Client + Mocks ✅ (2025-12-06)

**Subagent**: `frontend-phase-2`
**Testing**: Write tests AFTER implementation

### Tasks

- [x] Define questionnaire types in `@hair-product-scanner/shared`:
  - `ScalpCondition` enum/union type
  - `SebumLevel` enum/union type
  - `ActiveSymptom` enum/union type
  - `HairStrandCondition` enum/union type
  - `IngredientTolerance` enum/union type
  - `QuestionnaireProfile` type (full profile with userId and timestamps)
  - `QuestionnaireFormData` type (form submission data)
  - `SaveQuestionnaireRequest` / `SaveQuestionnaireResponse` types
  - `GetQuestionnaireResponse` type
- [x] Create Zod schemas in `@hair-product-scanner/shared`:
  - `questionnaireFormSchema` with all 5 fields validated
  - Export inferred types
- [x] Create API client functions in `apps/web/src/lib/api/questionnaire.ts`:
  - `saveQuestionnaire(data)` - POST /api/questionnaires
  - `getQuestionnaire()` - GET /api/questionnaires/me (returns profile or throws 404)
- [x] Create TanStack Query hooks in `apps/web/src/hooks/`:
  - `useSaveQuestionnaire()` mutation hook
  - `useQuestionnaire()` query hook for fetching existing profile (returns null on 404)
- [x] Set up MSW handlers in `apps/web/src/mocks/handlers/`:
  - `POST /api/questionnaires` - save new/update profile
  - `GET /api/questionnaires/me` - return current user's profile (or 404 if none)
- [x] Add mock data for questionnaire responses

### Test Scenarios

After implementation, write tests that verify:

- [x] `useSaveQuestionnaire` mutation calls correct endpoint with form data
- [x] `useQuestionnaire` returns existing profile data from mock
- [x] `useQuestionnaire` returns null when API returns 404 (no profile)
- [x] Zod schema validates all required fields
- [x] Zod schema requires at least one active symptom
- [x] Zod schema rejects empty/invalid values

### Completion Criteria

- [x] Types defined and exported from shared library
- [x] Zod schemas validate questionnaire data correctly
- [x] API client functions created
- [x] TanStack Query hooks created
- [x] MSW mocks return realistic data
- [x] Tests pass: `pnpm nx test web`

---

## Phase 3: Smart Components + State ✅ (2025-12-06)

**Subagent**: `frontend-phase-3`
**Testing**: Write tests AFTER implementation

### Tasks

- [x] Create `/questionnaire` page route at `apps/web/src/app/dashboard/questionnaire/page.tsx`
- [x] Create `QuestionnaireContainer` smart component that:
  - Uses React Hook Form with Zod resolver
  - Fetches existing profile with `useQuestionnaire()` hook
  - Pre-fills form when editing existing profile
  - Handles form submission with `useSaveQuestionnaire()` mutation
  - Shows loading state during save
  - Redirects to dashboard on success
  - Displays validation errors inline
- [x] Create `useQuestionnaireForm()` custom hook encapsulating form logic
- [x] Update `AppSidebar` and mobile nav to:
  - Enable Questionnaire menu item (currently disabled)
  - Conditionally enable/disable Scanner based on whether `useQuestionnaire()` returns data
- [x] Update Dashboard page to:
  - Show `ProfilePromptCard` when `useQuestionnaire()` returns null (no profile)
  - Hide prompt when profile exists
- [x] Add toast notification on successful save
- [x] Implement proper focus management for validation errors

### Test Scenarios

After implementation, write integration tests that verify:

- [x] User can fill out all 5 questions and submit successfully
- [x] Form shows validation errors when submitting incomplete form
- [x] Form shows error when no symptoms selected
- [x] Existing profile values pre-fill the form when editing
- [x] Dashboard shows "Complete Your Profile" CTA when no profile
- [x] Dashboard hides CTA after profile completion
- [x] Navigation enables Scanner after profile completion
- [x] Save button shows loading state during submission
- [x] User is redirected to dashboard after successful save
- [x] Toast appears on successful save

### Completion Criteria

- [x] Questionnaire page accessible at `/dashboard/questionnaire`
- [x] Form validation works correctly with error messages
- [x] Pre-fill works for editing existing profiles
- [x] Navigation gating works (Scanner disabled until profile complete)
- [x] Dashboard CTA appears/disappears based on profile status
- [x] Feature works end-to-end with mocked API
- [x] Tests pass: `pnpm nx test web`

---

## Phase 4: Repository Layer (TDD) ✅ (2025-12-06)

**Subagent**: `backend-phase-4`
**Testing**: Write tests FIRST (Testcontainers)

### Tasks

- [x] Write repository integration tests FIRST
- [x] Define PostgreSQL enums using Drizzle's `pgEnum` (generates `CREATE TYPE ... AS ENUM`):
  - `scalp_condition` enum
  - `sebum_level` enum
  - `active_symptom` enum
  - `hair_strand_condition` enum
  - `ingredient_tolerance` enum
- [x] Define Drizzle schema for `questionnaires` table:
  - `id` - UUID primary key
  - `userId` - UUID foreign key to users
  - `scalpCondition` - scalp_condition enum
  - `sebumLevel` - sebum_level enum
  - `activeSymptoms` - active_symptom[] (PostgreSQL enum array)
  - `hairStrandCondition` - hair_strand_condition enum
  - `ingredientTolerance` - ingredient_tolerance enum
  - `createdAt` - timestamp with default
  - `updatedAt` - timestamp
  - Unique constraint on `userId` (one profile per user)
- [x] Create database migration
- [x] Define `QuestionnaireRepository` interface:
  - `findByUserId(userId: string): Promise<Questionnaire | null>`
  - `save(questionnaire: NewQuestionnaire): Promise<Questionnaire>`
  - `update(userId: string, data: UpdateQuestionnaire): Promise<Questionnaire>`
- [x] Implement `QuestionnaireDrizzleRepository`

### Test Scenarios (Write BEFORE Implementation)

Write integration tests using Testcontainers that verify:

```typescript
describe('QuestionnaireDrizzleRepository', () => {
  it('should save a new questionnaire and return it with generated ID', async () => {
    // Given: valid questionnaire data for existing user
    // When: repository.save(questionnaire)
    // Then: returns questionnaire with UUID and timestamps
  });

  it('should find questionnaire by userId', async () => {
    // Given: existing questionnaire in database
    // When: repository.findByUserId(userId)
    // Then: returns the questionnaire with all fields
  });

  it('should return null when no questionnaire exists for user', async () => {
    // Given: user without questionnaire
    // When: repository.findByUserId(userId)
    // Then: returns null
  });

  it('should update existing questionnaire', async () => {
    // Given: existing questionnaire
    // When: repository.update(userId, { scalpCondition: 'psoriasis' })
    // Then: returns updated questionnaire with new updatedAt
  });

  it('should enforce unique userId constraint', async () => {
    // Given: existing questionnaire for user
    // When: repository.save(questionnaire with same userId)
    // Then: throws constraint violation error
  });

  it('should store and retrieve activeSymptoms array correctly', async () => {
    // Given: questionnaire with multiple symptoms ['itching', 'redness']
    // When: save and then findByUserId
    // Then: activeSymptoms array matches exactly
  });
});
```

### Completion Criteria

- [x] Repository tests written and initially failing (RED)
- [x] Drizzle schema created for questionnaires table
- [x] Migration generated and tested
- [x] Repository implementation complete
- [x] All tests pass: `pnpm nx test api` (GREEN)

---

## Phase 5: Service Layer (TDD) ✅ (2025-12-06)

**Subagent**: `backend-phase-5`
**Testing**: Write tests FIRST (Unit tests with mocked repository)

### Tasks

- [x] Write service unit tests FIRST
- [x] Define `ProfileCurator` interface:
  - `getProfile(userId: string): Promise<QuestionnaireProfile | null>`
  - `saveProfile(userId: string, data: QuestionnaireFormData): Promise<QuestionnaireProfile>`
- [x] Implement `ProfileCuratorImpl` with:
  - Create new profile if none exists
  - Update existing profile if one exists (upsert behavior)
  - Transform domain model to response DTO
- [x] Add validation for input data
- [x] Reused existing types from shared library (no separate DTOs needed)

### Test Scenarios (Write BEFORE Implementation)

Write unit tests with mocked repository:

```typescript
describe('QuestionnaireServiceImpl', () => {
  describe('getProfile', () => {
    it('should return questionnaire response DTO when profile exists', async () => {
      // Given: repository returns existing questionnaire
      // When: service.getProfile(userId)
      // Then: returns QuestionnaireResponse with ISO date strings
    });

    it('should return null when no profile exists', async () => {
      // Given: repository returns null
      // When: service.getProfile(userId)
      // Then: returns null
    });
  });

  describe('saveProfile', () => {
    it('should create new profile when none exists', async () => {
      // Given: repository.findByUserId returns null
      // When: service.saveProfile(userId, validInput)
      // Then: calls repository.save with correct data
      // And: returns QuestionnaireResponse
    });

    it('should update existing profile when one exists', async () => {
      // Given: repository.findByUserId returns existing questionnaire
      // When: service.saveProfile(userId, updatedInput)
      // Then: calls repository.update with correct data
      // And: returns updated QuestionnaireResponse
    });

    it('should validate activeSymptoms has at least one item', async () => {
      // Given: input with empty activeSymptoms array
      // When: service.saveProfile(userId, invalidInput)
      // Then: throws ValidationException
    });
  });
});
```

### Completion Criteria

- [x] Service tests written and initially failing (RED)
- [x] Service implementation complete
- [x] Types reused from shared library (QuestionnaireProfile, QuestionnaireFormData)
- [x] All tests pass: `pnpm nx test api` (GREEN)

---

## Phase 6: HTTP Controllers (TDD) ✅ (2025-12-06)

**Subagent**: `backend-phase-6`
**Testing**: Write E2E tests FIRST (Supertest + Testcontainers)

### Tasks

- [x] Write E2E tests FIRST
- [x] Create `QuestionnairesModule` with:
  - `QuestionnairesController`
  - Service and repository providers
  - Module exports
- [x] Implement controller endpoints:
  - `GET /api/questionnaires/me` - get current user's profile (404 if none)
  - `POST /api/questionnaires` - save/update current user's profile
- [x] Add JWT authentication guard to all endpoints
- [x] Extract `userId` from authenticated user (JWT payload) - NOT from request params
- [x] Ensure users can only read/write their own questionnaire (no userId in URL or body)
- [x] Add Zod validation pipe for request body
- [x] Register module in AppModule

### Test Scenarios (Write BEFORE Implementation)

Write E2E tests with Supertest:

```typescript
describe('QuestionnairesController (e2e)', () => {
  describe('GET /api/questionnaires/me', () => {
    it('should return 401 when not authenticated', async () => {
      // When: GET /api/questionnaires/me without token
      // Then: 401 Unauthorized
    });

    it('should return 404 when user has no profile', async () => {
      // Given: authenticated user without profile
      // When: GET /api/questionnaires/me
      // Then: 404 Not Found
    });

    it('should return questionnaire when profile exists', async () => {
      // Given: authenticated user with saved profile
      // When: GET /api/questionnaires/me
      // Then: 200 OK with QuestionnaireResponse body
    });
  });

  describe('POST /api/questionnaires', () => {
    it('should return 401 when not authenticated', async () => {
      // When: POST /api/questionnaires without token
      // Then: 401 Unauthorized
    });

    it('should return 400 for invalid input', async () => {
      // Given: authenticated user
      // When: POST with missing required fields
      // Then: 400 Bad Request with validation errors
    });

    it('should return 400 when activeSymptoms is empty', async () => {
      // Given: authenticated user
      // When: POST with empty activeSymptoms array
      // Then: 400 Bad Request
    });

    it('should create profile and return 201', async () => {
      // Given: authenticated user without profile
      // When: POST with valid questionnaire data
      // Then: 201 Created with QuestionnaireResponse
    });

    it('should update existing profile and return 200', async () => {
      // Given: authenticated user with existing profile
      // When: POST with updated questionnaire data
      // Then: 200 OK with updated QuestionnaireResponse
    });
  });
});
```

### Security Note

The controller MUST extract `userId` from the authenticated user's JWT token (via `@Request() req` decorator), not from URL parameters or request body. This ensures:

- Users can only access their own questionnaire data
- No need for authorization checks beyond authentication
- URL structure `/me` indicates "current authenticated user"

### Completion Criteria

- [x] E2E tests written and initially failing (RED)
- [x] Controller implementation complete
- [x] All endpoints protected with JWT guard
- [x] Validation working correctly
- [x] All tests pass: `pnpm nx test api` (GREEN)
- [ ] Manual verification with cURL/Postman

---

## Phase 7: Frontend-Backend Integration ✅ (2025-12-06)

**Subagent**: `integration-phase-7`
**Testing**: Manual testing of complete flow

### Tasks

- [x] Configure MSW to only mock in development/test (not production)
- [x] Update API client to use real backend endpoints
- [x] Verify CORS configuration allows frontend origin
- [ ] Test complete user flows end-to-end
- [ ] Fix any integration issues discovered
- [x] Verify error handling for network failures
- [ ] Test with both new users and existing users with profiles

### Verification Checklist

Manually verify each BDD scenario:

- [ ] **New user sees profile prompt**: Dashboard shows "Complete Your Profile" button for new users
- [ ] **Scanner disabled**: Scanner menu item is disabled until profile complete
- [ ] **Questionnaire accessible**: User can access questionnaire from menu and CTA
- [ ] **Form displays correctly**: All 5 questions visible on single scrollable page
- [ ] **Successful submission**: User can complete and save questionnaire
- [ ] **Redirect works**: User redirected to dashboard after save
- [ ] **Scanner enabled**: Scanner menu item enabled after profile complete
- [ ] **Dashboard updates**: CTA disappears after profile saved
- [ ] **Validation errors**: Inline errors show for incomplete form
- [ ] **Symptom validation**: Error shows when no symptoms selected
- [ ] **Edit existing**: Existing profile values pre-fill the form
- [ ] **Update works**: Changes to existing profile are saved correctly

### Completion Criteria

- [x] Frontend connected to real backend API
- [ ] All BDD scenarios verified manually
- [ ] No console errors in browser
- [ ] Network requests succeed with proper status codes
- [ ] Ready for PR

---

## Phase-to-Subagent Reference

| Phase | Subagent              | Focus                        | Testing Approach  |
| ----- | --------------------- | ---------------------------- | ----------------- |
| 1     | `frontend-phase-1`    | Presentational UI components | Tests after       |
| 2     | `frontend-phase-2`    | API types, hooks, MSW mocks  | Tests after       |
| 3     | `frontend-phase-3`    | Smart components, form logic | Tests after       |
| 4     | `backend-phase-4`     | Repository + Drizzle schema  | Tests first (TDD) |
| 5     | `backend-phase-5`     | Service layer business logic | Tests first (TDD) |
| 6     | `backend-phase-6`     | Controllers + E2E tests      | Tests first (TDD) |
| 7     | `integration-phase-7` | Connect FE to BE             | Manual testing    |

---

## File Structure Reference

### Frontend Files to Create

```
apps/web/src/
├── app/dashboard/questionnaire/
│   └── page.tsx
├── components/questionnaire/
│   ├── index.ts
│   ├── QuestionCard.tsx
│   ├── ScalpConditionQuestion.tsx
│   ├── SebumLevelQuestion.tsx
│   ├── ActiveSymptomsQuestion.tsx
│   ├── HairStrandConditionQuestion.tsx
│   ├── IngredientToleranceQuestion.tsx
│   ├── QuestionnaireForm.tsx
│   ├── QuestionnaireContainer.tsx
│   └── ProfilePromptCard.tsx
├── hooks/
│   ├── useQuestionnaire.ts
│   ├── useSaveQuestionnaire.ts
│   └── useQuestionnaireForm.ts
├── lib/api/
│   └── questionnaire.ts
└── mocks/handlers/
    └── questionnaire.ts
```

### Backend Files to Create

```
apps/api/src/
├── database/schema/
│   └── questionnaires.ts (replace placeholder)
├── modules/questionnaires/
│   ├── questionnaires.module.ts
│   ├── questionnaires.controller.ts
│   ├── questionnaires.controller.spec.ts (E2E)
│   ├── questionnaires.service.ts
│   ├── questionnaires.service.spec.ts
│   ├── questionnaires.repository.ts
│   ├── questionnaires.repository.spec.ts
│   └── index.ts
└── database/migrations/
    └── XXXX_add_questionnaires_table.ts
```

### Shared Library Files to Create

```
libs/shared/src/
├── types/
│   └── questionnaire.ts
├── schemas/
│   └── questionnaire.ts
└── index.ts (update exports)
```
