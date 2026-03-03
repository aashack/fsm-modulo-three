#### This document outlines the pain points encountered while setting up Playwright for end-to-end testing in the API project, along with the solutions implemented to resolve these issues. It serves as a reference for future testing setup and highlights key learnings from the process. (AI Generated)

# Testing Setup - Pain Points & Solutions

## Issues Encountered

### 1. **TypeScript Configuration Including E2E Tests**

- **Problem**: The `tsconfig.json` had `"e2e"` in its `include` array, causing TypeScript to compile Playwright test files as part of the main project.
- **Impact**: Playwright couldn't properly register its tests because TypeScript was transforming them before Playwright's loader got a chance.
- **Solution**: Removed `"e2e"` from the `include` array in `apps/api/tsconfig.json`.

### 2. **Playwright Config in TypeScript Configuration**

- **Problem**: `playwright.config.ts` was being included in the main project's TypeScript configuration.
- **Impact**: This caused circular dependency issues and confused the TypeScript compiler about which context it was in.
- **Solution**: Removed `"playwright.config.ts"` from the `include` array in `apps/api/tsconfig.json`.

### 3. **Vitest Auto-Discovery of E2E Tests**

- **Problem**: Vitest automatically picks up any `*.spec.ts` files in the project, including those in the `e2e` folder.
- **Impact**: Vitest tried to run Playwright tests, which aren't compatible with Vitest's test runner, causing the "test() called outside of context" error.
- **Solution**: Created `vitest.config.ts` with an explicit `exclude` pattern that prevents Vitest from discovering e2e tests.

### 4. **Missing Playwright Browser Installation**

- **Problem**: Playwright browsers (Chromium, Firefox, WebKit) weren't installed in the environment.
- **Impact**: Even after fixing the configuration issues, Playwright tests couldn't run without the actual browser binaries.
- **Solution**: Ran `npx playwright install` to download all required browser dependencies.

### 5. **No E2E-Specific TypeScript Configuration**

- **Problem**: E2E tests didn't have their own TypeScript configuration with Playwright types.
- **Impact**: TypeScript wouldn't properly recognize Playwright's test types, leading to potential type-checking issues.
- **Solution**: Created `e2e/tsconfig.json` that extends the base config and includes `@playwright/test` in the types.

### 6. **Test Framework Interference**

- **Problem**: Two different test frameworks (Vitest and Playwright) were trying to process the same files.
- **Impact**: Configuration mismatches between frameworks caused registration and runtime errors.
- **Solution**: Properly separated concerns by:
  - Excluding e2e from Vitest's scope
  - Creating Playwright-specific configurations
  - Keeping each framework's tests in isolated directories

## Files Modified/Created

1. `apps/api/tsconfig.json` - Removed e2e and playwright.config.ts from include
2. `apps/api/vitest.config.ts` - Created with e2e exclusion pattern
3. `apps/api/e2e/tsconfig.json` - Created with Playwright-specific types
4. Installed Playwright browsers via `npx playwright install`

## Key Learnings

- **Separation of Concerns**: Keep unit tests and e2e tests in separate folders with separate tooling configurations
- **Explicit Exclusions**: When using multiple test frameworks, explicitly exclude test suites you don't want processed by each tool
- **Type Definitions Matter**: Each folder with different test frameworks should have appropriate TypeScript configurations
- **Post-Install Steps**: Remember to run `npx playwright install` after adding Playwright as a dependency
