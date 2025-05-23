
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './src/pages/LoginPage';
import DashboardPage from './src/pages/DashboardPage';
import UserProfilePage from './src/pages/UserProfilePage';
import KanbanBoardPage from './src/pages/KanbanBoardPage';
import ProductListPage from './src/pages/admin/ProductListPage';
import AddProductPage from './src/pages/admin/AddProductPage';
import EditProductPage from './src/pages/admin/EditProductPage';
import ProductCatalogPage from './src/pages/ProductCatalogPage';
import StockManagementPage from './src/pages/admin/StockManagementPage';
import PreBudgetCreatePage from './src/pages/PreBudgetCreatePage';
import PreBudgetDetailsPage from './src/pages/PreBudgetDetailsPage';
import BudgetGenerationPage from './src/pages/BudgetGenerationPage';
import BudgetAndPreviewPage from './src/pages/BudgetAndPreviewPage'; 
import CounterProposalPage from './src/pages/CounterProposalPage';
import ShopPage from './src/pages/ShopPage';
import ClientQuoteDetailsPage from './src/pages/ClientQuoteDetailsPage';
import MessagingPage from './src/pages/MessagingPage';
import InvoicesPage from './src/pages/InvoicesPage';
import ClientPaymentsPage from './src/pages/ClientPaymentsPage';
import PaymentPopupPage from './src/pages/PaymentPopupPage';
import VendorsPage from './src/pages/VendorsPage';
import BudgetsDashboardPage from './src/pages/BudgetsDashboardPage';
import FinancialDashboardPage from './src/pages/FinancialDashboardPage';
import VisitsCalendarPage from './src/pages/VisitsCalendarPage';
import ReportGenerationPage from './src/pages/ReportGenerationPage';
import PartnerTransactionsPage from './src/pages/PartnerTransactionsPage';
import ClientsListPage from './src/pages/ClientsListPage';
import ClientDetailPage from './src/pages/ClientDetailPage'; 
import ProjectsDashboardPage from './src/pages/ProjectsDashboardPage';
import ProjectDetailPage from './src/pages/ProjectDetailPage';
import LeadDetailPage from './src/pages/LeadDetailPage';
import NewProjectPage from './src/pages/NewProjectPage';
import ClientProjectDetailPage from './src/pages/ClientProjectDetailPage';
import UserManagementPage from './src/pages/admin/UserManagementPage';
import AdminBiDashboardPage from './src/pages/admin/AdminBiDashboardPage';
import InstallationChecklistPage from './src/pages/InstallationChecklistPage';
import OrdersPage from './src/pages/OrdersPage'; // Added OrdersPage import

import { AuthProvider } from './src/contexts/AuthContext';
import { TenantProvider } from './src/contexts/TenantContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import ProtectedRoute from './src/components/auth/ProtectedRoute';
import { AuthenticatedLayout } from './src/components/layout/AuthenticatedLayout.tsx';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <TenantProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route 
    path="/" 
    element={
      <ProtectedRoute>
        <AuthenticatedLayout>
          <DashboardPage />
        </AuthenticatedLayout>
      </ProtectedRoute>
    } 
  />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <DashboardPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <UserProfilePage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/leads"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <KanbanBoardPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/leads/:leadId"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <LeadDetailPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
               <Route 
                path="/projects" 
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <ProjectsDashboardPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/projects/new"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <NewProjectPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/projects/:projectId" 
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <ProjectDetailPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
               <Route 
                path="/client/projects/:projectId"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <ClientProjectDetailPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/admin/products"
                element={
                  <ProtectedRoute> 
                    <AuthenticatedLayout>
                      <ProductListPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/admin/products/new"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <AddProductPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/admin/products/edit/:productId"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <EditProductPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
               <Route 
                path="/admin/stock" 
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <StockManagementPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
               <Route 
                path="/admin/user-management"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <UserManagementPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/admin/bi-dashboard"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <AdminBiDashboardPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/catalog" 
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <ProductCatalogPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/shop" 
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <ShopPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/prebudgets/new"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <PreBudgetCreatePage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/prebudgets/:preBudgetId" 
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <PreBudgetDetailsPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/budget/generate" 
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <BudgetGenerationPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/budget/finalize-preview" 
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <BudgetAndPreviewPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/counter-proposal"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <CounterProposalPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/client-quote-details/:quoteId"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <ClientQuoteDetailsPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/messaging" 
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <MessagingPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/invoices" 
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <InvoicesPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/client-payments"
                element={<ClientPaymentsPage />} 
              />
              <Route 
                path="/checkout/payment"
                element={<PaymentPopupPage />}
              />
              <Route 
                path="/vendors"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <VendorsPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/budgets/dashboard"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <BudgetsDashboardPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/financial-dashboard"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <FinancialDashboardPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/partner-transactions"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <PartnerTransactionsPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/visits"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <VisitsCalendarPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/reports/generate"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <ReportGenerationPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/clients"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <ClientsListPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/clients/:clientId" 
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <ClientDetailPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/installations/:checklistId"
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <InstallationChecklistPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
               <Route 
                path="/orders" // Added OrdersPage route
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout>
                      <OrdersPage />
                    </AuthenticatedLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </NotificationProvider>
      </TenantProvider>
    </AuthProvider>
  );
};

export default App;
