# Testing Strategy for New Features

This document outlines the testing strategy for the recently developed features: Invoices, XML Generation, SEFAZ Integration (Mocked), and Pre-Budget Enhancements.

## 1. Types of Testing

A multi-layered testing approach will be employed to ensure quality and reliability.

### 1.1. Unit Tests

*   **Objective:** To verify that individual functions and modules work correctly in isolation.
*   **Scope:**
    *   **Backend (Firebase Functions):** Focus on business logic within each function (e.g., data validation, permission checks, state transitions, interactions with Prisma).
        *   `functions/src/invoices.ts`: Test `createInvoice`, `getInvoice`, `listInvoices`, `updateInvoice`, `deleteInvoice`, `generateInvoiceXml`, `sendInvoiceToSefaz`.
        *   `functions/src/prebudgets.ts`: Test `createPreBudget`, `getPreBudgetById`, `getPreBudgets`, `updatePreBudget`, `deletePreBudget`.
        *   `functions/src/preBudgetItems.ts`: Test `addPreBudgetItem`, `updatePreBudgetItem`, `removePreBudgetItem`.
        *   Helper functions and utilities.
    *   **Frontend (React Components/Services):** Test utility functions, complex state management logic (e.g., Redux reducers/selectors if used), and service functions that format data or interact with Firebase.
*   **Tools:**
    *   **Jest:** Already set up in the project (`functions/jest.config.js` and `jest.config.js` in root) and should be used for both backend and frontend unit tests.
    *   **Mocking Libraries:** `jest-mock-extended` (already in `functions/package.json` devDependencies) or Jest's built-in mocking (`jest.fn()`, `jest.mock()`) will be crucial for mocking Prisma Client, Firebase Admin SDK, other Firebase services, and external dependencies.
*   **Key Areas:**
    *   Correct data manipulation and storage.
    *   Proper error handling and propagation.
    *   Role-based access control (RBAC) and permission logic.
    *   Tenant isolation.
    *   Edge cases and invalid inputs.

### 1.2. Integration Tests

*   **Objective:** To verify the interaction between different parts of the system.
*   **Scope:**
    *   **Frontend Service <> Firebase Function:** Test that frontend services correctly call Firebase Functions and handle their responses (both success and error). This involves testing the full request/response cycle, including data serialization/deserialization.
    *   **Firebase Function <> Prisma <> Database:** While unit tests mock Prisma, integration tests could (in a dedicated test environment) interact with a real test database to ensure Prisma queries and mutations work as expected with the schema.
    *   **Multiple Firebase Functions:** If one function triggers another (e.g., via Pub/Sub or direct call), their interaction should be tested.
*   **Tools:**
    *   **Jest:** Can be used to write these tests.
    *   **Firebase Emulator Suite:** Essential for testing Firebase Functions locally. It allows functions to be called via HTTPS triggers and interact with emulated Firestore, Auth, Pub/Sub, etc. This is the primary tool for backend integration tests.
    *   **Prisma:** For database interactions, a separate test database instance is recommended.
*   **Key Areas:**
    *   Data consistency between services.
    *   Authentication and authorization flow across services.
    *   Error propagation and handling between integrated components.

### 1.3. End-to-End (E2E) Tests

*   **Objective:** To simulate real user scenarios from the user interface (UI) to the backend and database, ensuring the entire system works as expected.
*   **Scope:** Test complete user flows through the application's UI.
    *   **Invoice Management:**
        1.  User logs in.
        2.  Navigates to the Invoices page.
        3.  Creates a new invoice with items.
        4.  Verifies the invoice appears in the list.
        5.  Views the invoice details.
        6.  Generates XML for the invoice.
        7.  Sends the invoice to SEFAZ (mocked).
        8.  Verifies status changes and data updates at each step.
    *   **Pre-Budget Management:**
        1.  User (Salesman/VENDEDOR) logs in.
        2.  Creates a new pre-budget (header and items, including custom JSON).
        3.  Verifies the pre-budget is saved and appears in their list (if a list view exists).
        4.  Views the pre-budget details, verifying all information including custom JSON.
        5.  (If applicable) Attempts to edit/delete the pre-budget according to permissions.
*   **Tools:**
    *   **Cypress or Playwright:** Industry-standard E2E testing frameworks. These are not currently set up but would be recommended for comprehensive E2E testing. They allow scripting browser interactions.
*   **Key Areas:**
    *   User authentication and navigation.
    *   Form submissions and data validation through the UI.
    *   Correct display of data and state changes in the UI.
    *   Full workflow integrity.

### 1.4. UI/Component Tests (Frontend)

*   **Objective:** To test individual React components in isolation, verifying their rendering, behavior, and interaction with props and state.
*   **Scope:** Focus on UI components, especially those with complex logic, user interactions, or conditional rendering.
    *   `InvoiceCreatePage.tsx` / `InvoiceDetailPage.tsx` / `InvoicesPage.tsx`
    *   `PreBudgetCreatePage.tsx` / `PreBudgetDetailsPage.tsx`
    *   Shared UI elements like forms, tables, modals related to these features.
*   **Tools:**
    *   **React Testing Library (RTL):** Often used with Jest (already in the project). RTL focuses on testing components from a user's perspective.
    *   **Jest:** As the test runner and for assertions.
*   **Key Areas:**
    *   Correct rendering based on props and state.
    *   User interactions (button clicks, form input).
    *   Client-side form validation.
    *   Conditional rendering logic.
    *   Accessibility (basic checks).

## 2. Existing Tools

*   **Jest:** Configured for both frontend (`jest.config.js`) and backend (`functions/jest.config.js`). This will be the primary tool for unit and component tests, and can also be used for some integration tests (especially for frontend services calling backend mocks or emulated functions).
*   **Firebase Emulator Suite:** While not explicitly a "testing tool" in the same vein as Jest, it's crucial for local development and integration testing of Firebase Functions.
*   **Prisma:** Used for database interaction; for tests, this means managing a test database or effectively mocking the Prisma client.

## 3. General Testing Principles

*   **Test Pyramid:** Emphasize more unit tests, a reasonable number of integration tests, and fewer, more focused E2E tests.
*   **CI/CD Integration:** Tests should be integrated into the CI/CD pipeline to run automatically on code changes.
*   **Test Data Management:** A strategy for managing test data will be needed, especially for integration and E2E tests (e.g., seeding a test database, creating mock users with specific roles).
*   **Coverage:** Aim for good test coverage, particularly for critical business logic and complex components.

This strategy provides a comprehensive approach to ensure the quality of the new features. The next steps would involve setting up any missing tools (like Cypress/Playwright for E2E) and writing the actual test cases.
