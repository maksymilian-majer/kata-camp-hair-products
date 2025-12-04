# PRD: Hairminator

**Created**: 2025-11-30

## 1. Introduction & Overview

Hairminator is an intelligent mobile shopping companion designed to revolutionize how users select hair care products. By analyzing complex ingredient lists against individual scalp conditions and hair goals, Hairminator acts as a personal trichologist in your pocket, ensuring every purchase is safe, effective, and personalized.

The app enables users to build a comprehensive hair profile through an onboarding questionnaire, then scan product labels in-store to receive AI-powered ingredient analysis and personalized recommendations.

## 2. Problem Statement

Choosing the right hair care product is overwhelming. Consumers face walls of products with ingredient lists written in incomprehensible INCI nomenclature. People with specific scalp conditions (seborrheic dermatitis, dandruff, sensitivity) or hair concerns (color-treated, damaged, curly) struggle to identify which products are safe and effective for their needs.

Current solutions are inadequate:

- **Trichologist consultations** are expensive and may carry conflicts of interest - many are financed by pharmaceutical companies and may not always provide objective advice
- **Self-research** requires hours of decoding ingredient lists and cross-referencing scientific literature
- **Marketing claims** mislead consumers, and what works for one hair type may damage another

Hairminator empowers users to make their own informed decisions. Even when working with a dermatologist or trichologist, users deserve an independent tool to verify recommendations, understand what's being prescribed, and explore alternatives within their budget.

**Who experiences this problem:**

- People with scalp conditions needing to avoid irritants and verify professional recommendations
- Consumers with specific hair goals (moisture, repair, color protection)
- Budget-conscious shoppers wanting value for their specific needs
- Anyone who wants to understand what they're putting on their scalp, not just trust a label or prescription

## 3. Goals

### User Goals

- Quickly identify if a product is safe for their specific scalp condition
- Understand what ingredients actually do (in plain language)
- Get personalized compatibility assessment while shopping in-store
- Make informed decisions independently of marketing claims or biased advice

### Business Goals

- Establish Hairminator as a trusted hair care decision tool
- Build a user base through valuable, personalized recommendations
- Create a foundation for future monetization (affiliate partnerships, premium features)
- Demonstrate AI-assisted development workflow for training purposes

## 4. Target Audience

### Primary Users

**The Condition-Conscious Shopper**

- Has a specific scalp condition (seborrheic dermatitis, dandruff, psoriasis, sensitivity)
- Needs to carefully check ingredients to avoid flare-ups
- Willing to spend time finding the right product
- Values safety over brand loyalty

### Secondary Users

**The Ingredient-Aware Consumer**

- Prefers products without certain ingredients (SLS, parabens, silicones)
- May follow specific hair care philosophies (curly girl method, low-poo)
- Wants transparency about what they're putting on their hair
- Often shops at drugstores (Rossmann, Hebe, dm) rather than salons

## 5. Core Features

> **MVP Philosophy**: Maximize user feedback with minimal development effort. P1 and P2 are hypotheses - we won't commit to them until P0 is in users' hands and validated.

### P0 - MVP

**User Authentication**

- Required sign-up/login
- Secure profile storage
- Session persistence across devices

**Hair Profile Questionnaire**

- Collects information needed to determine the best product for the user (scalp type, hair concerns, conditions, preferences, allergies, etc.)
- Specific questions to be determined during implementation
- Profile saved to database for personalization

**Single Product Scanning & Analysis**

- Camera-based ingredient label capture
- INCI ingredient list extraction (OpenAI Vision)
- AI analysis cross-referencing ingredients against user's Hair Profile
- Personalized compatibility assessment with explanation

**Scan History**

- Archive of previously scanned products
- View past analyses

### P1 - After MVP Validation

**Multi-Product Scanning**

- Scan up to 5 products per session
- Manage products in comparison pool

**Product Comparison**

- Side-by-side comparison view
- AI-recommended "Winner" with reasoning

### P2 - Future Consideration

**Favorite Products**

- Save products to a favorites list
- Quick access to trusted products

**Offline Mode**

- View saved favorites without internet

## 6. Technical Requirements

### Stack

| Layer         | Technology     | Purpose                             |
| ------------- | -------------- | ----------------------------------- |
| Monorepo      | Nx 22          | Build system, caching, task running |
| Frontend      | Next.js 16     | React framework with App Router     |
| Backend       | NestJS 11      | Node.js API framework               |
| Database      | PostgreSQL 16  | Relational database                 |
| ORM           | Drizzle        | Type-safe SQL query builder         |
| Styling       | Tailwind 4.1   | Utility-first CSS                   |
| UI Components | shadcn/ui      | Accessible component library        |
| Server State  | TanStack Query | Data fetching & caching             |
| Client State  | Zustand        | Lightweight state management        |
| Testing       | Vitest         | Fast unit & integration tests       |
| DB Testing    | Testcontainers | Real PostgreSQL in tests            |
| API Mocking   | MSW            | Mock Service Worker for frontend    |

### Architecture

**Frontend (Next.js)**

- App Router with Server Components by default
- TanStack Query for server state (API calls)
- Zustand for client state (UI state)
- React Hook Form + Zod for form validation

**Backend (NestJS)**

- Clean Architecture pattern: Controller → Service → Repository → Database
- Controllers handle HTTP, Services contain business logic
- Drizzle ORM for type-safe database queries
- Shared types library for API contracts

### Integrations

| Service       | Purpose                             |
| ------------- | ----------------------------------- |
| OpenAI Vision | OCR for ingredient label extraction |
| OpenAI GPT    | Ingredient analysis and comparison  |

### Internationalization

- Support for English only for MVP
- No i18n & translations setup
- Ingredient names displayed in original INCI format

## 7. Constraints

### Scope Limitations

- **No barcode database** - MVP focuses on ingredient label scanning, not UPC/EAN lookups
- **No price scraping** - Prices entered manually or captured from label
- **No e-commerce integration** - App is for analysis only, not purchasing
- **No social features** - No reviews, ratings, or community aspects in MVP
- **No salon/professional products** - Focus on retail/drugstore products

### Technical Constraints

- **Mobile-first web app** - Not a native mobile app
- **Requires camera access** - Core scanning functionality depends on device camera
- **Internet required for scanning** - AI analysis requires API calls
- **OpenAI API costs** - Usage-based pricing affects scaling decisions
