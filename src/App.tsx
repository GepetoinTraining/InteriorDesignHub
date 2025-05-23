
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UserProfilePage from './pages/UserProfilePage';
import KanbanBoardPage from './pages/KanbanBoardPage';
import ProductListPage from './pages/admin/ProductListPage';
import AddProductPage from './pages/admin/AddProductPage';
import EditProductPage from './pages/admin/EditProductPage';
import ProductCatalogPage from './pages/ProductCatalogPage';
import StockManagementPage from './pages/admin/StockManagementPage';
import PreBudgetCreatePage from './pages/PreBudgetCreatePage';
import PreBudgetDetailsPage from './pages/PreBudgetDetailsPage';
import BudgetGenerationPage from './pages/BudgetGenerationPage';
import BudgetAndPreviewPage from './pages/BudgetAndPreviewPage'; 
import CounterProposalPage from './pages/CounterProposalPage';
import ShopPage from './pages/ShopPage';
import ClientQuoteDetailsPage from './pages/ClientQuoteDetailsPage';
import MessagingPage from './pages/MessagingPage';
import InvoicesPage from './pages/InvoicesPage';
import ClientPaymentsPage from './pages/ClientPaymentsPage';
import PaymentPopupPage from './pages/PaymentPopupPage';
import VendorsPage from './pages/VendorsPage';
import BudgetsDashboardPage from './pages/BudgetsDashboardPage';
import FinancialDashboardPage from './pages/FinancialDashboardPage';
import VisitsCalendarPage from './pages/VisitsCalendarPage';
import ReportGenerationPage from './pages/ReportGenerationPage';
import PartnerTransactionsPage from './pages/PartnerTransactionsPage';
import ClientsListPage from './pages/ClientsListPage';
import ClientDetailPage from './pages/ClientDetailPage'; 
import ProjectsDashboardPage from './pages/ProjectsDashboardPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import LeadDetailPage from './pages/LeadDetailPage';
import NewProjectPage from './pages/NewProjectPage';
import ClientProjectDetailPage from './pages/ClientProjectDetailPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import AdminBiDashboardPage from './pages/admin/AdminBiDashboardPage';
import InstallationChecklistPage from './pages/InstallationChecklistPage';
import OrdersPage from './pages/OrdersPage'; // Added OrdersPage import
import RegisterPage from './pages/RegisterPage';
import { AuthProvider } from './contexts/AuthContext';
import { TenantProvider } from './contexts/TenantContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthenticatedLayout } from './components/layout/AuthenticatedLayout.tsx';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <TenantProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
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
