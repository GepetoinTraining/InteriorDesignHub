
# InteriorDesignHub.app Development

# Agent Operational Procedure

**For Each User Interaction, Especially Code Change Requests:**

1.  **Understand the Request:**
    *   Carefully read and parse the user's entire prompt to fully understand the desired changes, questions, or information.
    *   If any part of the request is ambiguous or unclear, ask for clarification before proceeding.

2.  **Confirm Current File State:**
    *   **Prioritize User-Provided Files:** Always use the full file content provided by the user *in their current prompt* as the absolute source of truth for those files.
    *   Do not rely on potentially stale internal states or file versions from previous turns.

3.  **Plan the Changes (for code modification requests):**
    *   Based on the user's request and the confirmed current file state, identify all files that require modification.
    *   For each file, detail the specific additions, deletions, or modifications needed.
    *   Consider any impacts on other parts of the application (e.g., imports, component usage, type definitions).

4.  **Construct Updated File Content:**
    *   *Before generating the XML output*, meticulously create the complete, new content for *each file* that will be changed. This means applying the planned modifications to the current version of the file.

5.  **Generate XML Output for File Changes:**
    *   Ensure the XML output is generated and is complete.
    *   The XML block must strictly follow the format:
        # Updated files:

## To-Do List

### Phase 1: Core Authentication & Setup (Completed)
- [x] Basic Project Setup (HTML, TSX, TailwindCSS)
- [x] Initial Login Page UI (`LoginPage.tsx`)
- [x] Mock Authentication Service (`authService.ts`)
- [x] Client-Side Routing (`react-router-dom`)
- [x] Authentication State Management (`AuthContext`)
- [x] Protected Routes & Authenticated Layout

### Phase 2: Core CRM Features (Completed)
- [x] **Dashboard Implementation:** 
    - [x] Create `DashboardPage.tsx` basic structure.
    - [x] Create reusable `StatCard.tsx` component (dashboard specific).
    - [x] Create reusable `Icon.tsx` component.
    - [x] Populate "Sales Performance", "Lead Management", and "Financial Overview" sections on `DashboardPage.tsx`.
    - [x] Replaced chart placeholders with `Recharts` (`ResponsiveLineChart`, `ResponsiveBarChart`).
    - [x] Implemented loading and error states for dashboard data.
- [x] **Tenant Management (Basic UI & Context):**
    - [x] Tenant identification (path-based strategy groundwork, no routing yet)
    - [x] `TenantContext` provider and `useTenant` hook implemented.
    - [x] Mock `tenantService.ts` created with `fetchTenantById`, `fetchDefaultTenant`, `listTenants`.
    - [x] `AuthenticatedLayout` displays current tenant name and themed logo.
    - [x] Tenant switcher dropdown added to `AuthenticatedLayout`.
    - [x] Dynamic theming via CSS variables updated by `TenantContext`.
- [x] **User Management (within tenants):**
    - [x] User profile page (`UserProfilePage.tsx` based on profile.html concept) with view/edit functionality for current user (mock backend).
    - [x] Admin-level User Management page (`UserManagementPage.tsx` based on `usermanagement.html` concept).
- [x] **Lead Management (Kanban):**
    - [x] `CRMBoard.html` (Kanban board) concept converted to React components (`KanbanBoardPage`, `KanbanColumn`, `KanbanCard`).
    - [x] Role-aware lead columns (Salesperson, Professional, Admin show different views).
    - [x] Mock CRUD operations for leads (services & API integration - MOCKED).
    - [x] **Lead Detail View (`LeadDetailPage.tsx`):**
        - [x] Basic structure with Overview, Communication, Tasks, Notes tabs.
        - [x] Functional forms for logging communication, adding/managing tasks, and saving notes (via mock service).
        - [x] Implemented "Convert to Client" and "Edit Lead" actions (mock backend).
- [x] **Inter-Tenant Financials (Partner Transactions):** 
    - [x] `PartnerTransactionsPage.tsx` created with UI for Payables/Receivables tabs and Funding Status display (Mock Data Complete).
- [x] **Client Management:** 
    - [x] Client list view (`ClientsListPage.tsx` - UI and Mock Data Complete)
    - [x] Client detail view (`ClientDetailPage.tsx` - UI and Mock Data Complete)
    - [ ] **NEXT STEP**: Link clients to projects and leads.
- [x] **Project Management (Basic):** 
    - [x] Project list and dashboard view (`ProjectsDashboardPage.tsx` based on `professionalsdhasboard.html` - Mock Data Complete).
    - [x] **Project Detail View (`ProjectDetailPage.tsx`):** Based on `professionalclientdashboard.html` for professional users. 
        - [x] Overview tab implemented.
        - [x] Budget & Proposal, Communication, Payments, and Documents tabs implemented with basic structure and mock data.
    - [x] Client-facing project view (`ClientProjectDetailPage.tsx` from `projectdetails.html`).
    - [x] Basic project creation (`NewProjectPage.tsx`) and status display.
    - [ ] **NEXT STEP**: Implement more dynamic project status tracking.

### Phase 3: Advanced Features & UI Components (HTML Conversions Completed)
- [x] **Product Catalog:** 
    - [x] Admin views: `ProductListPage.tsx`, `AddProductPage.tsx` & `EditProductPage.tsx` (using `ProductForm.tsx`).
    - [x] Services for product CRUD operations (`productService.ts` with mock data).
    - [x] Buyer/Professional view: `ProductCatalogPage.tsx` (concept from `productcatalogbuyer.html`).
    - [x] Stock Management View (`StockManagementPage.tsx`), with `AdjustStockModal.tsx`.
    - [x] General markup logic: Products now have a `buyingPrice` and a `pricingCalculation` method. `ProductForm` allows manual selling price or tenant-defined markup.
- [x] **Budgeting & Quoting:**
    - [x] Strategic Pricing Logic: Discussed (General markup implemented).
    - [x] Pre-Budget: Data Structures (`PreBudgetItem`, `PreBudget`), Service (`prebudgetService.ts`), `PreBudgetCreatePage.tsx`, `PreBudgetDetailsPage.tsx`. (Conceptual basis from `prebudget.html`).
    - [x] Converted `budgetgeneration.html` to `BudgetGenerationPage.tsx`.
    - [x] Converted `budgetandpreview.html` to `BudgetAndPreviewPage.tsx` (Budget Finalization & AI Preview).
    - [x] AI Visualization (Gemini API integration for image generation - Client-side POC Complete in `BudgetAndPreviewPage.tsx`).
    - [x] Converted `counterproposal.html` to `CounterProposalPage.tsx`.
- [x] **Client-Facing Portal ("Design Hub"):**
    - [x] Converted `clientlandingpage.html` (assumed source) to `ShopPage.tsx`.
    - [x] Converted `cartslider.html` to `CartDrawer.tsx`.
    - [x] Converted `clientdashboard.html` (assumed source) to `ClientQuoteDetailsPage.tsx`.
- [x] **Messaging/Notifications:**
    - [x] `MessagingPage.tsx` (UI from `messaging.html` - Firestore pending).
    - [x] `TaskAndMessagesDrawer.tsx` (from `taskandmessagesdrawer.html`).
    - [x] In-app notifications system (`NotificationContext.tsx`, `NotificationContainer.tsx`, etc.).
- [x] **Financials:**
    - [x] Converted `invoices.html` to `InvoicesPage.tsx`.
    - [x] Converted `clientpaymentsview.html` to `ClientPaymentsPage.tsx`.
    - [x] Converted `clientpaypopup.html` to `PaymentPopupPage.tsx`.
    - [x] Converted `vendors.html` to `VendorsPage.tsx`.
    - [x] Converted `budgetsdashboard.html` to `BudgetsDashboardPage.tsx`.
    - [x] Converted `financialdashboard.html` to `FinancialDashboardPage.tsx`.
- [x] **Scheduling:**
    - [x] Converted `calendar.html` to `VisitsCalendarPage.tsx`.
    - [x] Converted `popupvisit.html` to `VisitFormModal.tsx`.
- [x] **Reporting Module:**
    - [x] Converted `reportgen.html` to `ReportGenerationPage.tsx`.
- [x] **Reusable UI Components:**
    - [x] `Button.tsx` component created (from `buttonscomponents.html`).
    - [x] `Input.tsx` component created (from `inputcomponents.html`).
    - [x] `Badge.tsx` component created (from `badgecomponents.html`).
    - [x] `Card.tsx` generic component created (from `cardcomponent.html`).
    - [x] `TaskCard.tsx` component created (from `taskcard.html`).

### Phase 4: Multi-Tenancy & Deployment (Next Focus)
- [x] **HTML File Conversions (Final Batch):**
    - [x] Admin BI Dashboard (`AdminBiDashboardPage.tsx` from `adminbidashboard.html`)
    - [x] Installation Checklist (`InstallationChecklistPage.tsx` from `installationchecklist.html`)
    - [x] Orders Page (`OrdersPage.tsx` from `orders.html`)
- [ ] **Database Design (PostgreSQL + Firestore):**
    - [ ] Finalize schema for multi-tenancy (`tenant_id` in all relevant tables)
    - [ ] Data relationships between entities
- [ ] **Backend Implementation (Google Cloud Functions / Firebase):**
    - [ ] Secure API endpoints for all CRUD operations
    - [ ] Business logic for each feature
    - [ ] Data isolation logic based on `tenant_id`
- [ ] **Testing:**
    - [ ] Unit tests for components and services
    - [ ] Integration tests for user flows
- [ ] **Deployment to Firebase/Google Cloud:**
    - [ ] CI/CD pipeline setup
    - [ ] Environment configuration (dev, staging, prod)
- [ ] **Final To-Do:** Update this `README.md` to reflect the absolute final state of the project upon completion of all tasks.

## Current Status Summary

- **Phase 1 & 2 are complete.**
- **Phase 3 HTML-to-React conversions are complete.**
- **Phase 4 HTML Conversions are complete.** The next focus is Backend & Deployment.

**Next Steps (Focus on Phase 4):**
1.  **Backend & Deployment**: Proceed with database design, backend implementation (Firebase focus), testing, and deployment.


## HTML File Status for Cleanup/Reference

This section helps clarify the status of the original HTML template files.

**1. HTML Files Fully Converted (Potentially Ready for Archival/Deletion):**
    The following HTML files have been successfully converted into React components and their core UIs are implemented. They might no longer be needed for active development unless for specific detailed reference.
    - `badgecomponents.html` (-> `Badge.tsx`)
    - `budgetgeneration.html` (-> `BudgetGenerationPage.tsx`)
    - `budgetsdashboard.html` (-> `BudgetsDashboardPage.tsx`)
    - `buttonscomponents.html` (-> `Button.tsx`)
    - `calendar.html` (-> `VisitsCalendarPage.tsx`)
    - `cardcomponent.html` (-> `Card.tsx`)
    - `cartslider.html` (-> `CartDrawer.tsx`)
    - `clientpaymentsview.html` (-> `ClientPaymentsPage.tsx`)
    - `clientpaypopup.html` (-> `PaymentPopupPage.tsx`)
    - `counterproposal.html` (-> `CounterProposalPage.tsx`)
    - `financialdashboard.html` (-> `FinancialDashboardPage.tsx`)
    - `inputcomponents.html` (-> `Input.tsx`)
    - `invoices.html` (-> `InvoicesPage.tsx`)
    - `messaging.html` (-> `MessagingPage.tsx` - UI)
    - `popupvisit.html` (-> `VisitFormModal.tsx`)
    - `professionalsdhasboard.html` (-> `ProjectsDashboardPage.tsx`)
    - `professionalclientdashboard.html` (-> `ProjectDetailPage.tsx` - All tabs have basic structure)
    - `projectdetails.html` (-> `ClientProjectDetailPage.tsx`)
    - `reportgen.html` (-> `ReportGenerationPage.tsx`)
    - `taskandmessagesdrawer.html` (-> `TaskAndMessagesDrawer.tsx`)
    - `taskcard.html` (-> `TaskCard.tsx`)
    - `vendors.html` (-> `VendorsPage.tsx`)
    - `usermanagement.html` (-> `UserManagementPage.tsx`)
    - `adminbidashboard.html` (-> `AdminBiDashboardPage.tsx`)
    - `installationchecklist.html` (-> `InstallationChecklistPage.tsx`)
    - `orders.html` (-> `OrdersPage.tsx`)


**2. HTML Files as General Reference / Undecided / Partially Superseded:**
    These files might still offer valuable layout or styling insights, or their features are not yet fully mapped or have been partially addressed.
    - `forgottenpassword.html` (Standalone page, likely okay as is, not part of main React app flow)
    - `multitenantcsstheme.html` (Useful reference for CSS variable theming approach; not a page)
    - `prebudget.html` (Conceptual basis for `PreBudgetCreatePage.tsx` and `PreBudgetDetailsPage.tsx`; likely superseded but can be kept for minor reference if needed)
    - `productcatalogbuyer.html` (Conceptual basis for `ProductCatalogPage.tsx`; likely superseded)
    - `productcatalogsales.html` (Might be superseded by role-based views in `ProductCatalogPage.tsx` or admin views)
    - `salesdashboard.html` (Conceptual basis for `DashboardPage.tsx` or a future specialized sales dashboard)

This categorization should help in deciding which HTML files can be safely archived or removed from the active project directory over time, thus "cleaning up" the structure by reducing unneeded template files.
