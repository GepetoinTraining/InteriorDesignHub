
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext'; 
import Button from '../ui/Button';
import Icon from '../ui/Icon'; 
import TaskAndMessagesDrawer from '../global/TaskAndMessagesDrawer';
import NotificationContainer from '../notifications/NotificationContainer';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  const { currentUser, logout, isLoading: authLoading, role, tenantId: userTenantId } = useAuth(); // Added role, userTenantId
  const { currentTenant, isLoadingTenant, fetchCurrentTenantDetails } = useTenant(); // Removed allTenants, setCurrentTenantById
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  // Tenant is now fetched based on user's tenantId from AuthContext, via TenantContext's useEffect
  // No manual tenant switcher needed in this layout for now.

  const headerTitle = currentTenant?.name ? `${currentTenant.name} CRM` : 'Stitch Design CRM'; // Default title
  const logoColor = currentTenant?.themePrimaryColor || 'var(--color-primary, #0b80ee)';
  const userDisplayName = currentUser?.name || currentUser?.email || 'User';

  const effectiveAvatarUrl = currentUser?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userDisplayName)}&background=random&size=96&color=fff`;

  // Use role directly from useAuth() for clarity and directness
  const productsLink = role === 'ADMIN' ? '/admin/products' : '/catalog';
  const isAdmin = role === 'ADMIN';
  const isDesigner = role === 'DESIGNER'; // Assuming 'DESIGNER' is the new 'professional'
  const isUser = role === 'USER'; // Standard user
  // const isSalesOrAdmin = role === 'ADMIN' || role === 'SALESPERSON'; // SALESPERSON role needs to be defined in UserRole enum if used

  // Example: For "New Pre-Budget", perhaps ADMINs and DESIGNERs can create it.
  const canCreatePreBudget = isAdmin || isDesigner;


  return (
    <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden bg-slate-50 text-slate-900">
      <NotificationContainer />
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 bg-white px-4 sm:px-6 py-3 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-3 text-slate-900">
             <div className="size-7" style={{ color: logoColor }}>
              {isLoadingTenant ? (
                <div className="animate-pulse bg-slate-200 rounded-full size-7"></div>
              ) : currentTenant?.logoUrl ? (
                <img src={currentTenant.logoUrl} alt={`${currentTenant.name} Logo`} className="h-7 w-auto object-contain" />
              ) : (
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
                </svg>
              )}
            </div>
            <h2 className="text-slate-900 text-lg sm:text-xl font-bold leading-tight">
              {isLoadingTenant ? <span className="animate-pulse">Loading...</span> : headerTitle}
            </h2>
          </div>

          { /* Removed Tenant Switcher UI as tenant is now tied to user context */ }

          <div className="flex items-center gap-2 sm:gap-4"> {/* Main nav and user profile section wrapper */}
            <nav className="hidden md:flex items-center gap-1 sm:gap-2">
              <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/">Dashboard</Link>
              <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/leads">Leads</Link>
              <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/projects">Projects</Link>
              {(isAdmin || isDesigner) && ( // Example: Installations link for Admin or Designer
                <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/installations/install-1">Installations</Link>
              )}
               <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/orders">Orders</Link>
              <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/clients">Clients</Link>
              <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to={productsLink}>Products</Link>
              {isAdmin && (
                <>
                  <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/admin/stock">Stock</Link>
                  <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/admin/user-management">Users</Link>
                  <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/admin/bi-dashboard">BI</Link>
                </>
              )}
              {canCreatePreBudget && ( // Example: New Pre-Budget link for Admin or Designer
                <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/prebudgets/new">New Pre-Budget</Link>
              )}
              {/* Partner Finances might be ADMIN only or a specific role */}
              {isAdmin && (
                 <Link className="text-slate-600 hover:text-[var(--color-primary)] hover:bg-slate-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium leading-normal transition-colors duration-150" to="/partner-transactions">Partner Finances</Link>
              )}
            </nav>
          {/* This div now correctly closes before the user profile/logout section */}
          </div> 
          
          <div className="flex items-center gap-2 sm:gap-4"> {/* User profile and logout section */}
            <button className="text-slate-500 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors">
              <Icon iconName="notifications" className="text-xl sm:text-2xl" ariaLabel="Notifications"/>
            </button>
            <div className="flex items-center gap-2">
               <Link to="/profile" className="flex items-center gap-2 group">
                <div 
                  className="bg-cover bg-center bg-no-repeat aspect-square rounded-full size-8 sm:size-10 border-2 border-slate-200 shadow-sm group-hover:border-[var(--color-primary)] transition-colors"
                  style={{ backgroundImage: `url('${effectiveAvatarUrl}')` }}
                  role="img"
                  aria-label={`${userDisplayName}'s profile photo`}
                >
                </div>
                <span className="text-xs sm:text-sm text-slate-700 hidden xl:inline group-hover:text-[var(--color-primary)] transition-colors">
                  {userDisplayName}
                </span>
              </Link>
            </div>
             <Button onClick={handleLogout} isLoading={authLoading} variant="secondary" className="h-8 sm:h-9 px-2 sm:px-3 py-1 text-xs">
              Logout
            </Button>
          </div>
        </header>
        <main className="flex flex-1 justify-center py-4 sm:py-6 md:py-8 bg-slate-100">
          <div className="layout-content-container flex flex-col w-full h-full">
            {children}
          </div>
        </main>
        <TaskAndMessagesDrawer />
      </div>
    </div>
  );
};
