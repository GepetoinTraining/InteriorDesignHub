

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
import PreBudgetCreatePage from './src/pages/PreBudgetCreatePage'; // Import PreBudgetCreatePage
import { AuthProvider } from './src/contexts/AuthContext';
import { TenantProvider } from './src/contexts/TenantContext';
import ProtectedRoute from './src/components/auth/ProtectedRoute';
import { AuthenticatedLayout } from './src/components/layout/AuthenticatedLayout.tsx';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <TenantProvider>
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
              path="/prebudgets/new" // New route for Pre-Budget Create Page
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <PreBudgetCreatePage />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </TenantProvider>
    </AuthProvider>
  );
};

export default App;
